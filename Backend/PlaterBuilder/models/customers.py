from django.db import models

class Customers(models.Model):
    company_name = models.CharField(max_length=200)
    point_of_contact = models.CharField(max_length=200)
    email = models.EmailField()

    def __str__(self):
        return f"{self.company_name} ({self.point_of_contact})"
    
    class Meta:
        verbose_name_plural = "Customers" 