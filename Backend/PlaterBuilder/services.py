from django.db import models
from .models import (Projects, Station, Recipe, RecipeStep,
                     SimulationParameters, ProductionGoal, SimulationResult)
from django.utils import timezone
from datetime import datetime


class ProductionSimulator:
    """
    Simulates production throughput for a plating line project.
    Supports multiple recipes with configurable production ratios.
    """

    def __init__(self, project_id):
        try:
            self.project = Projects.objects.get(project_id=project_id)
        except Projects.DoesNotExist:
            raise ValueError(f"Project with ID {project_id} not found")

        # Get or create simulation parameters
        self.params, _ = SimulationParameters.objects.get_or_create(
            project=self.project,
            defaults={
                'process_lines': 1,
                'has_transfer_shuttle': False,
                'calculated_hoist_count': 0,
                'hoist_speed_horizontal': 0.5,
                'hoist_speed_vertical': 0.2,
                'hoist_acceleration': 0.1,
                'transfer_time': 10,
                'parts_per_rack': 1,
                'working_hours_per_day': 8.0,
                'working_days_per_week': 5,
                'part_load_time': 60,
                'part_unload_time': 60,
                'optimization_target': 'balanced'
            }
        )

        # Load stations ordered by physical position
        self.stations = list(
            Station.objects.filter(project=self.project).order_by('position_index')
        )

        # Load active recipes with prefetched steps
        self.recipes = list(
            Recipe.objects.filter(project=self.project, is_active=True)
            .prefetch_related('steps__station')
        )

        # Get production goal
        self.goal, _ = ProductionGoal.objects.get_or_create(
            project=self.project,
            defaults={
                'primary_target': 'day',
                'target_parts_per_hour': 0,
                'target_parts_per_day': 0,
                'target_parts_per_week': 0,
                'target_parts_per_month': 0,
                'target_parts_per_year': 0
            }
        )

    # ------------------------------------------------------------------
    # Per-recipe cycle time
    # ------------------------------------------------------------------
    def _calculate_recipe_cycle_time(self, recipe):
        """Calculate cycle time for a single recipe's steps."""
        steps = list(recipe.steps.all().order_by('step_order'))
        if not steps:
            return 0

        total_time = 0

        # Load time
        total_time += self.params.part_load_time or 60

        for i, step in enumerate(steps):
            process_time = step.dwell_time or step.min_dwell_time or 0
            total_time += process_time
            total_time += step.drip_time or 0

            # Transfer time between steps (not after last)
            if i < len(steps) - 1:
                total_time += self.params.transfer_time or 10

        # Unload time
        total_time += self.params.part_unload_time or 60

        return total_time

    # ------------------------------------------------------------------
    # Station utilization across all recipes in a super-cycle
    # ------------------------------------------------------------------
    def _calculate_station_utilization(self):
        """
        For each station, compute total occupied time per super-cycle.
        A super-cycle = sum of all production_ratios flight-bars.
        Station occupied = sum of (dwell_time + drip_time) * recipe.production_ratio
        for each recipe that visits it.
        """
        utilization = {}  # station_id -> occupied seconds

        for station in self.stations:
            utilization[station.id] = {
                'station_id': station.id,
                'station_number': station.station_number,
                'process_name': station.process_name,
                'occupied_time': 0,
            }

        for recipe in self.recipes:
            for step in recipe.steps.all():
                if step.station_id in utilization:
                    dwell = step.dwell_time or step.min_dwell_time or 0
                    drip = step.drip_time or 0
                    utilization[step.station_id]['occupied_time'] += (dwell + drip) * recipe.production_ratio

        return utilization

    # ------------------------------------------------------------------
    # Optimal hoist calculation
    # ------------------------------------------------------------------
    def calculate_optimal_hoists(self):
        if not self.stations or not self.recipes:
            return 0

        target_pph = self.goal.target_parts_per_hour or 0
        if target_pph <= 0:
            return 1

        # Weighted average cycle time
        total_ratio = sum(r.production_ratio for r in self.recipes) or 1
        weighted_cycle = sum(
            self._calculate_recipe_cycle_time(r) * r.production_ratio
            for r in self.recipes
        ) / total_ratio

        if weighted_cycle <= 0:
            return 1

        cycles_per_hour_needed = target_pph / (self.params.parts_per_rack or 1)
        cycles_per_hoist_per_hour = 3600 / weighted_cycle if weighted_cycle > 0 else 0
        if cycles_per_hoist_per_hour <= 0:
            return 1

        hoists_needed = int(cycles_per_hour_needed / cycles_per_hoist_per_hour) + 1
        return max(1, hoists_needed)

    # ------------------------------------------------------------------
    # Main throughput calculation
    # ------------------------------------------------------------------
    def calculate_throughput(self, hoist_count=None):
        if not self.stations:
            return {"error": "No stations found. Please add stations before running simulation."}
        if not self.recipes:
            return {"error": "No active recipes found. Please add at least one recipe with steps."}

        has_steps = any(r.steps.exists() for r in self.recipes)
        if not has_steps:
            return {"error": "No recipe steps found. Please add steps to at least one recipe."}

        # Determine hoist count
        if hoist_count is None:
            hoist_count = self.params.manual_hoist_count or self.params.calculated_hoist_count
            if hoist_count is None or hoist_count <= 0:
                hoist_count = self.calculate_optimal_hoists()

        total_ratio = sum(r.production_ratio for r in self.recipes) or 1

        # Per-recipe cycle times
        recipe_cycle_times = {}
        for recipe in self.recipes:
            recipe_cycle_times[recipe.id] = self._calculate_recipe_cycle_time(recipe)

        # Station utilization
        station_util = self._calculate_station_utilization()

        # Bottleneck = station with highest occupied time per super-cycle
        bottleneck_station = None
        max_occupied = 0
        for sid, info in station_util.items():
            if info['occupied_time'] > max_occupied:
                max_occupied = info['occupied_time']
                bottleneck_station = info

        # Weighted cycle sum
        weighted_cycle_sum = sum(
            recipe_cycle_times[r.id] * r.production_ratio for r in self.recipes
        )

        # Effective super-cycle time
        hoist_effective_time = weighted_cycle_sum / (hoist_count * 0.8) if hoist_count > 0 else weighted_cycle_sum
        effective_super_cycle_time = max(max_occupied, hoist_effective_time) if max_occupied > 0 else hoist_effective_time

        if effective_super_cycle_time <= 0:
            return {"error": "Invalid cycle time calculated. Please check recipe steps."}

        # Aggregate throughput
        parts_per_rack = self.params.parts_per_rack or 1
        parts_per_hour = (total_ratio / effective_super_cycle_time) * 3600 * parts_per_rack

        hours_per_day = self.params.working_hours_per_day or 8
        days_per_week = self.params.working_days_per_week or 5

        parts_per_day = parts_per_hour * hours_per_day
        parts_per_week = parts_per_day * days_per_week
        parts_per_month = parts_per_week * 4
        parts_per_year = parts_per_month * 12

        # Per-recipe breakdown
        recipe_results = []
        for recipe in self.recipes:
            ratio_fraction = recipe.production_ratio / total_ratio
            recipe_results.append({
                'recipe_id': recipe.id,
                'recipe_name': recipe.name,
                'production_ratio': recipe.production_ratio,
                'cycle_time': round(recipe_cycle_times[recipe.id], 2),
                'parts_per_hour': round(parts_per_hour * ratio_fraction, 2),
                'parts_per_day': round(parts_per_day * ratio_fraction, 2),
            })

        # Station utilization percentages
        station_utilization_list = []
        for sid, info in station_util.items():
            util_pct = (info['occupied_time'] / effective_super_cycle_time * 100) if effective_super_cycle_time > 0 else 0
            station_utilization_list.append({
                'station_id': info['station_id'],
                'station_number': info['station_number'],
                'process_name': info['process_name'],
                'occupied_time': round(info['occupied_time'], 2),
                'utilization_pct': round(util_pct, 2),
            })

        # Total process / transfer / drip times (aggregate across recipes)
        total_process_time = 0
        total_drip_time = 0
        for recipe in self.recipes:
            for step in recipe.steps.all():
                total_process_time += (step.dwell_time or step.min_dwell_time or 0) * recipe.production_ratio
                total_drip_time += (step.drip_time or 0) * recipe.production_ratio

        total_transfer_time = 0
        for recipe in self.recipes:
            step_count = recipe.steps.count()
            if step_count > 1:
                total_transfer_time += (self.params.transfer_time or 10) * (step_count - 1) * recipe.production_ratio

        # Hoist utilization
        hoist_utilization = min(100, (parts_per_hour / (self.goal.target_parts_per_hour or 1)) * 100) if self.goal.target_parts_per_hour else 50

        # Bottleneck description
        bottleneck_description = None
        bottleneck_station_number = None
        if bottleneck_station:
            bottleneck_station_number = bottleneck_station['station_number']
            bottleneck_description = (
                f"Station {bottleneck_station['station_number']} ({bottleneck_station['process_name']}) "
                f"has the highest occupied time ({bottleneck_station['occupied_time']}s per super-cycle)"
            )

        # Check if meets production goal
        meets_goal = False
        if self.goal.primary_target == 'hour' and self.goal.target_parts_per_hour:
            meets_goal = parts_per_hour >= self.goal.target_parts_per_hour
        elif self.goal.primary_target == 'day' and self.goal.target_parts_per_day:
            meets_goal = parts_per_day >= self.goal.target_parts_per_day
        elif self.goal.primary_target == 'week' and self.goal.target_parts_per_week:
            meets_goal = parts_per_week >= self.goal.target_parts_per_week
        elif self.goal.primary_target == 'month' and self.goal.target_parts_per_month:
            meets_goal = parts_per_month >= self.goal.target_parts_per_month
        elif self.goal.primary_target == 'year' and self.goal.target_parts_per_year:
            meets_goal = parts_per_year >= self.goal.target_parts_per_year

        # Recommendations
        recommendations = []
        if not meets_goal:
            recommendations.append("Consider increasing the number of hoists to improve throughput.")
            if bottleneck_station:
                recommendations.append(f"Optimize process time at {bottleneck_station['station_number']} to reduce bottleneck.")
        if hoist_utilization > 90:
            recommendations.append("Hoist utilization is very high. Consider adding more hoists for reliability.")
        if hoist_utilization < 30:
            recommendations.append("Hoist utilization is low. Consider reducing the number of hoists to optimize costs.")

        # Weighted average cycle time for top-level cycle_time field
        avg_cycle_time = weighted_cycle_sum / total_ratio if total_ratio > 0 else 0

        return {
            "parts_per_hour": round(parts_per_hour, 2),
            "parts_per_day": round(parts_per_day, 2),
            "parts_per_week": round(parts_per_week, 2),
            "parts_per_month": round(parts_per_month, 2),
            "parts_per_year": round(parts_per_year, 2),
            "cycle_time": round(avg_cycle_time, 2),
            "total_process_time": round(total_process_time, 2),
            "total_transfer_time": round(total_transfer_time, 2),
            "total_drip_time": round(total_drip_time, 2),
            "hoist_count": hoist_count,
            "hoist_utilization": round(hoist_utilization, 2),
            "bottleneck_station": bottleneck_station_number,
            "bottleneck_description": bottleneck_description,
            "meets_production_goal": meets_goal,
            "recommendations": "; ".join(recommendations) if recommendations else None,
            # New multi-recipe fields
            "recipe_results": recipe_results,
            "station_utilization": station_utilization_list,
            "total_ratio": total_ratio,
            "recipe_count": len(self.recipes),
        }

    # ------------------------------------------------------------------
    # Full simulation (saves to DB)
    # ------------------------------------------------------------------
    def run_simulation(self, name="Simulation Run"):
        results = self.calculate_throughput()

        if "error" in results:
            return results

        hoist_count = self.params.manual_hoist_count or self.params.calculated_hoist_count
        if hoist_count is None or hoist_count <= 0:
            hoist_count = self.calculate_optimal_hoists()

        simulation_result = SimulationResult.objects.create(
            project=self.project,
            name=name,
            parts_per_hour=results["parts_per_hour"],
            parts_per_day=results["parts_per_day"],
            parts_per_week=results["parts_per_week"],
            parts_per_month=results["parts_per_month"],
            parts_per_year=results["parts_per_year"],
            cycle_time=results["cycle_time"],
            total_process_time=results["total_process_time"],
            total_transfer_time=results["total_transfer_time"],
            total_drip_time=results["total_drip_time"],
            hoist_count=results["hoist_count"],
            hoist_utilization=results["hoist_utilization"],
            bottleneck_station=results.get("bottleneck_station"),
            bottleneck_description=results.get("bottleneck_description"),
            meets_production_goal=results["meets_production_goal"],
            recommendations=results.get("recommendations"),
            recipe_results=results.get("recipe_results"),
            station_utilization=results.get("station_utilization"),
        )

        return {
            "id": simulation_result.id,
            "name": simulation_result.name,
            "simulation_date": simulation_result.simulation_date.isoformat(),
            "parts_per_hour": simulation_result.parts_per_hour,
            "parts_per_day": simulation_result.parts_per_day,
            "parts_per_week": simulation_result.parts_per_week,
            "parts_per_month": simulation_result.parts_per_month,
            "parts_per_year": simulation_result.parts_per_year,
            "cycle_time": simulation_result.cycle_time,
            "total_process_time": simulation_result.total_process_time,
            "total_transfer_time": simulation_result.total_transfer_time,
            "total_drip_time": simulation_result.total_drip_time,
            "hoist_count": simulation_result.hoist_count,
            "hoist_utilization": simulation_result.hoist_utilization,
            "bottleneck_station": simulation_result.bottleneck_station,
            "bottleneck_description": simulation_result.bottleneck_description,
            "meets_production_goal": simulation_result.meets_production_goal,
            "recommendations": simulation_result.recommendations,
            "recipe_results": simulation_result.recipe_results,
            "station_utilization": simulation_result.station_utilization,
            "total_ratio": results.get("total_ratio"),
            "recipe_count": results.get("recipe_count"),
        }
