from django.contrib import admin
from .models import (Projects, Customers, ProductionGoal,
                     SimulationParameters, SimulationResult, Station, Recipe, RecipeStep)

admin.site.register(Projects)
admin.site.register(Customers)
admin.site.register(ProductionGoal)
admin.site.register(SimulationParameters)
admin.site.register(SimulationResult)
admin.site.register(Station)
admin.site.register(Recipe)
admin.site.register(RecipeStep)

