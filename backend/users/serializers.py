# cars/serializers.py
from rest_framework import serializers
from .models import Car

class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model_name', 'year', 'price', 'mileage', 
            'image', 'description', 'transmission', 'fuel_type', 
            'is_available', 'created_at'
        ]