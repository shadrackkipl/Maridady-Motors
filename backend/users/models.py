# cars/models.py
from django.db import models

class Car(models.Model):
    make = models.CharField(max_length=50) # e.g., Toyota, Mercedes
    model_name = models.CharField(max_length=50, verbose_name="Model") # e.g., Camry, GLE
    year = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mileage = models.IntegerField(help_text="Mileage in KM")
    
    # Image field requires Pillow (installed in Step 1)
    image = models.ImageField(upload_to='cars/', null=True, blank=True) 
    
    description = models.TextField()
    transmission = models.CharField(max_length=20, choices=[('Automatic', 'Automatic'), ('Manual', 'Manual')])
    fuel_type = models.CharField(max_length=20, choices=[('Petrol', 'Petrol'), ('Diesel', 'Diesel'), ('Hybrid', 'Hybrid'), ('Electric', 'Electric')])
    
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model_name}"