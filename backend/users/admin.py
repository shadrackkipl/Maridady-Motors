# cars/admin.py
from django.contrib import admin
from .models import Car

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('make', 'model_name', 'year', 'price', 'is_available')
    list_filter = ('make', 'year', 'is_available')