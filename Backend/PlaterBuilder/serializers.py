from rest_framework import serializers
from .models import Projects, Customers, EquipmentTypeChoices, ProcessMap

class CustomersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customers
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'

class ProcessMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessMap
        fields = '__all__'