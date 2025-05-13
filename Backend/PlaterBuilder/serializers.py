from rest_framework import serializers
from .models import Projects, Customers, EquipmentTypeChoices, ProcessMapEntry, ProductionGoal, SimulationParameters, SimulationResult

class CustomersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customers
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'

class ProcessMapEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessMapEntry
        fields = '__all__'

class ProductionGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionGoal
        fields = '__all__'

class SimulationParametersSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationParameters
        fields = '__all__'

class SimulationResultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationResult
        fields = '__all__'


