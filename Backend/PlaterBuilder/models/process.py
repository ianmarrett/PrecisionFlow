from django.db import models
from .projects import Projects

#global process aspects
#class GlobalProcessAspects(models.Model):
    #recipe_quantity = models.IntegerField(default=1, help_text="Number of recipes to be processed in parallel")

class ProcessMapEntry(models.Model):
    """
    Individual process step in the plating line
    """
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='process_map_entries')
    station_number = models.CharField(max_length=10)
    process_step = models.IntegerField()
    process = models.CharField(max_length=200)
    
    # Time parameters
    dwell_time = models.IntegerField(blank=True, null=True, help_text="Standard dwell time in seconds")
    min_dwell_time = models.IntegerField(blank=True, null=True, help_text="Minimum dwell time in seconds")
    max_dwell_time = models.IntegerField(blank=True, null=True, help_text="Maximum dwell time in seconds")
    drip_time = models.IntegerField(default=0, help_text="Time to allow for dripping after lifting (seconds)")
    
    # Physical parameters
    tank_length = models.FloatField(default=0.0, help_text="Tank length in meters")
    tank_width = models.FloatField(default=0.0, help_text="Tank width in meters")
    distance_to_next = models.FloatField(default=0.0, help_text="Distance to next station in meters")
    
    # Process flags
    is_loading_station = models.BooleanField(default=False)
    is_unloading_station = models.BooleanField(default=False)
    requires_manual_handling = models.BooleanField(default=False)
    
    # Metadata
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Process Map Entries"
        ordering = ['process_step']
        
    def __str__(self):
        return f"Step {self.process_step}: Station {self.station_number}" 