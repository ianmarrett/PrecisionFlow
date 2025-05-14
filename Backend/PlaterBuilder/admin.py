from django.contrib import admin
from .models import Projects, Customers, ProcessMapEntry, ProductionGoal, SimulationParameters, SimulationResult

admin.site.register (Projects)
admin.site.register (Customers)
admin.site.register (ProcessMapEntry)
admin.site.register (ProductionGoal)
admin.site.register (SimulationParameters)
admin.site.register (SimulationResult)

