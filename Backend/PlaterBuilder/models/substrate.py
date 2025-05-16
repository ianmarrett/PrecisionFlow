from django.db import models
from .projects import Projects

class Element(models.Model):
    """
    Represents a chemical element in the plating process.
    """
    name = models.CharField(max_length=50, unique=True)
    atomic_number = models.IntegerField(unique=True)
    symbol = models.CharField(max_length=3, unique=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = "Elements"
        ordering = ['atomic_number']

class Part_Size(models.Model):
    """
    Represents the size of a part in the plating process.
    """
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    length = models.FloatField() # Length in meters
    width = models.FloatField() # Width in meters
    height = models.FloatField() # Height in meters
    volume = models.FloatField() # Volume in cubic meters
    weight = models.FloatField() # Weight in kilograms
    total_surface_area = models.FloatField() # Surface area in square meters
    plated_area = models.FloatField() # Plated area in square meters

    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = "Part Sizes"
        ordering = ['size']