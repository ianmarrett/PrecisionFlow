from django.db import models
from .projects import Projects
from .station import Station


class Recipe(models.Model):
    """
    A named plating recipe with a production ratio weight.
    Each recipe defines a sequence of steps through stations.
    """
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='recipes')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    production_ratio = models.IntegerField(default=1, help_text="Weight in the production mix (e.g. 3 in a 3:2:1 split)")
    is_active = models.BooleanField(default=True)

    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Recipes"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (ratio: {self.production_ratio})"


class RecipeStep(models.Model):
    """
    One step in a recipe: a visit to a specific station with timing parameters.
    """
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='steps')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='recipe_steps')
    step_order = models.IntegerField(help_text="Order of this step within the recipe")

    # Time parameters
    dwell_time = models.IntegerField(blank=True, null=True, help_text="Standard dwell time in seconds")
    min_dwell_time = models.IntegerField(blank=True, null=True, help_text="Minimum dwell time in seconds")
    max_dwell_time = models.IntegerField(blank=True, null=True, help_text="Maximum dwell time in seconds")
    drip_time = models.IntegerField(default=0, help_text="Drip time after lifting in seconds")

    # Metadata
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Recipe Steps"
        ordering = ['step_order']
        unique_together = [['recipe', 'step_order']]

    def __str__(self):
        return f"Step {self.step_order}: {self.station.process_name}"
