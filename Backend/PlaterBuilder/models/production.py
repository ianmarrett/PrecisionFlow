from django.db import models
from .projects import Projects

class ProductionGoal(models.Model):
    """
    Production targets for the project
    """
    project = models.OneToOneField(Projects, on_delete=models.CASCADE, related_name='production_goal')
    
    # Production targets
    target_parts_per_hour = models.FloatField(null=True, blank=True, help_text="Target parts per hour")
    target_parts_per_shift = models.FloatField(null=True, blank=True, help_text="Target parts per shift")
    target_parts_per_day = models.FloatField(null=True, blank=True, help_text="Target parts per day")
    target_parts_per_week = models.FloatField(null=True, blank=True, help_text="Target parts per week")
    target_parts_per_month = models.FloatField(null=True, blank=True, help_text="Target parts per month")
    target_parts_per_year = models.FloatField(null=True, blank=True, help_text="Target parts per year")
    
    # Just one of these targets should be set - others will be calculated
    primary_target = models.CharField(
        max_length=20,
        choices=[
            ('hour', 'Parts Per Hour'),
            ('shift', 'Parts Per Shift'),
            ('day', 'Parts Per Day'),
            ('week', 'Parts Per Week'),
            ('month', 'Parts Per Month'),
            ('year', 'Parts Per Year'),
        ],
        default='day',
        help_text="Primary production target timeframe"
    )
    
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Production Goals for {self.project.project_name}" 