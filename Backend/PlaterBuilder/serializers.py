from rest_framework import serializers
from .models import (Projects, Customers, EquipmentTypeChoices,
                     ProductionGoal, SimulationParameters, SimulationResult,
                     Station, Recipe, RecipeStep)

class CustomersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customers
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'

class ProductionGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionGoal
        fields = '__all__'
        read_only_fields = ('date_created', 'last_updated')

class SimulationParametersSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationParameters
        fields = '__all__'

class SimulationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationResult
        fields = '__all__'


# --- Station / Recipe serializers ---

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class RecipeStepSerializer(serializers.ModelSerializer):
    station_number = serializers.CharField(source='station.station_number', read_only=True)
    station_process_name = serializers.CharField(source='station.process_name', read_only=True)

    class Meta:
        model = RecipeStep
        fields = '__all__'

class RecipeSerializer(serializers.ModelSerializer):
    steps = RecipeStepSerializer(many=True, read_only=True)
    step_count = serializers.IntegerField(source='steps.count', read_only=True)

    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = ('date_created', 'last_updated')

class RecipeListSerializer(serializers.ModelSerializer):
    step_count = serializers.IntegerField(source='steps.count', read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'project', 'name', 'description', 'production_ratio',
                  'is_active', 'step_count', 'date_created', 'last_updated']
        read_only_fields = ('date_created', 'last_updated')


