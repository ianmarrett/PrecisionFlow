from django.db import models
from .projects import Projects

class SimulationParameters(models.Model):
    """
    Global parameters for production simulation
    """
    project = models.OneToOneField(Projects, on_delete=models.CASCADE, related_name='simulation_parameters')
    
    # Line configuration
    process_lines = models.IntegerField(default=1, help_text="Number of parallel process lines")
    has_transfer_shuttle = models.BooleanField(default=False, help_text="Whether the line has a transfer shuttle")
    
    # Hoist parameters
    calculated_hoist_count = models.IntegerField(default=0, help_text="Calculated number of hoists needed")
    manual_hoist_count = models.IntegerField(null=True, blank=True, help_text="Manually specified number of hoists")
    hoist_speed_horizontal = models.FloatField(default=0.5, help_text="Hoist horizontal speed in meters per second")
    hoist_speed_vertical = models.FloatField(default=0.2, help_text="Hoist vertical speed in meters per second")
    hoist_acceleration = models.FloatField(default=0.1, help_text="Hoist acceleration in meters per second²")
    
    # Time parameters
    transfer_time = models.IntegerField(default=10, help_text="Time to transfer between stations in seconds")
    parts_per_rack = models.IntegerField(default=1, help_text="Number of parts loaded on each rack")
    rack_spacing = models.FloatField(default=0.5, help_text="Minimum spacing between racks in meters")
    
    # Schedule parameters
    working_hours_per_day = models.FloatField(default=8.0, help_text="Working hours per day")
    working_days_per_week = models.IntegerField(default=5, help_text="Working days per week")
    
    # Loading/unloading
    part_load_time = models.IntegerField(default=60, help_text="Time to load parts in seconds")
    part_unload_time = models.IntegerField(default=60, help_text="Time to unload parts in seconds")
    
    # Simulation settings
    optimization_target = models.CharField(
        max_length=20,
        choices=[
            ('throughput', 'Maximum Throughput'),
            ('hoists', 'Minimum Hoists'),
            ('balanced', 'Balanced Operation'),
        ],
        default='balanced',
        help_text="What to optimize for in simulation"
    )
    
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Simulation Parameters for {self.project.project_name}"

class SimulationResult(models.Model):
    """
    Results of production throughput simulation
    """
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='simulation_results')
    simulation_date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100, default="Simulation Run", help_text="Name for this simulation run")
    
    # Production results
    parts_per_hour = models.FloatField(help_text="Estimated parts produced per hour")
    parts_per_day = models.FloatField(help_text="Estimated parts produced per day")
    parts_per_week = models.FloatField(help_text="Estimated parts produced per week")
    parts_per_month = models.FloatField(help_text="Estimated parts produced per month (based on 4 weeks)")
    parts_per_year = models.FloatField(help_text="Estimated parts produced per year")
    
    # Time calculations
    cycle_time = models.FloatField(help_text="Time to complete one full cycle in seconds")
    total_process_time = models.FloatField(help_text="Sum of all process times in seconds")
    total_transfer_time = models.FloatField(help_text="Sum of all transfer times in seconds")
    total_drip_time = models.FloatField(help_text="Sum of all drip times in seconds")
    
    # Resource utilization
    hoist_count = models.IntegerField(help_text="Number of hoists used in simulation")
    hoist_utilization = models.FloatField(help_text="Percentage of hoist utilization")
    
    # Bottleneck analysis
    bottleneck_station = models.CharField(max_length=10, blank=True, null=True, help_text="Station number causing bottleneck")
    bottleneck_description = models.TextField(blank=True, null=True, help_text="Description of bottleneck")
    
    # Goal achievement
    meets_production_goal = models.BooleanField(default=False, help_text="Whether this simulation meets production goals")
    
    # Recommendations
    recommendations = models.TextField(blank=True, null=True, help_text="Recommendations for improvement")
    
    # Metadata
    notes = models.TextField(blank=True, null=True, help_text="Additional notes about the simulation")
    
    def __str__(self):
        return f"Simulation for {self.project.project_name} on {self.simulation_date.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-simulation_date'] 