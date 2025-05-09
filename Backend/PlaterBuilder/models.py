from django.db import models

#these are options that can be selected for equipment type
class EquipmentTypeChoices(models.TextChoices):
    RACK = 'rack', 'Rack'
    BARREL = 'barrel', 'Barrel'
    REEL_TO_REEL = 'reel_to_reel', 'Reel to Reel'
    ROLL_TO_ROLL = 'roll_to_roll', 'Roll to Roll'
    OTHER = 'other', 'Other'

    def __str__(self):
        return self.name

class Customers(models.Model):
    company_name = models.CharField(max_length=200)
    point_of_contact = models.CharField(max_length=200)
    #phone_number = PhoneNumberField(unique=True, null=False, blank=False) #have to install with pip using... pip install django-phonenumber-field[phonenumbers]
    email = models.EmailField()

    def __str__(self):
        return f"{self.company_name} ({self.point_of_contact})"
    
    class Meta:
        verbose_name_plural = "Customers"


class Projects(models.Model):
    #project identifiers
    project_id = models.CharField(max_length=10, unique=True)
    project_name = models.CharField(max_length=200)
    customer = models.ForeignKey(Customers, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    spec_document = models.FileField(upload_to='documents/specs/', blank=True, null=True)
    sketch = models.FileField(upload_to='documents/sketches/', blank=True, null=True)
    
    #equipment info
    equipment_type = models.CharField(
        max_length=20,
        choices=EquipmentTypeChoices.choices,
        blank=True,
    )
    process = models.CharField(max_length=200)
    substrate = models.CharField(max_length=100)
    #spec_document = models.FileField(upload_to='documents/')   gotta set something else up here for this to work

    def __str__(self):
        return f"{self.project_name} ({self.project_id})"
    
    class Meta:
        verbose_name_plural = "Projects"
        ordering = ['project_id']
    