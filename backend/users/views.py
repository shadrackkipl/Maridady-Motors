from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Car
from .serializers import CarSerializer

@api_view(['GET'])
def car_list(request):
    # Fetch only cars that are marked as available
    cars = Car.objects.filter(is_available=True).order_by('-created_at')
    
    # Convert the database query into JSON using the serializer
    serializer = CarSerializer(cars, many=True)
    
    # Return the JSON response
    return Response(serializer.data)

@api_view(['GET'])
def car_detail(request, pk):
    try:
        car = Car.objects.get(pk=pk)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=404)
        
    serializer = CarSerializer(car)
    return Response(serializer.data)