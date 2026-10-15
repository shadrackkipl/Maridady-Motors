# backend/cars/urls.py
from django.urls import path
from .views import sales_rep_list
from . import views


urlpatterns = [
    path('cars/', views.car_list, name='car_list'),
    path('cars/add/', views.add_car, name='add_car'),
    path('cars/<int:pk>/', views.car_detail, name='car_detail'),
    path('api/sales-reps/', sales_rep_list),
]