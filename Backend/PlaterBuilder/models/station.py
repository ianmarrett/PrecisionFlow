from django.db import models
from .projects import Projects


class Station(models.Model):
    """
    A physical tank / station on the plating line.
    Defined once per project; recipes reference stations via RecipeStep.
    """
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='stations')
    station_number = models.CharField(max_length=10)
    process_name = models.CharField(max_length=200, help_text="What happens at this station")
    position_index = models.IntegerField(help_text="Physical sort order on the line")

    # Physical parameters
    tank_length = models.FloatField(default=0.0, help_text="Tank length in meters")
    tank_width = models.FloatField(default=0.0, help_text="Tank width in meters")
    distance_to_next = models.FloatField(default=0.0, help_text="Distance to next station in meters")

    # Station flags
    is_loading_station = models.BooleanField(default=False)
    is_unloading_station = models.BooleanField(default=False)
    requires_manual_handling = models.BooleanField(default=False)

    # Metadata
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Stations"
        ordering = ['position_index']
        unique_together = [['project', 'station_number']]

    def __str__(self):
        return f"Station {self.station_number}: {self.process_name}"
