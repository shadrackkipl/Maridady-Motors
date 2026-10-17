from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Car, SalesRepresentative
from .serializers import CarSerializer, SalesRepresentativeSerializer

# Only show active sales representatives on vehicles
ACTIVE_REPS = Prefetch(
    'sales_representatives',
    queryset=SalesRepresentative.objects.filter(is_active=True),
)


@api_view(['GET'])
@permission_classes([AllowAny])
def car_list(request):
    cars = (
        Car.objects.filter(is_available=True)
        .prefetch_related('images', ACTIVE_REPS)
        .order_by('-created_at')
    )

    # Optional filter: /api/cars/?body_type=suv
    body_type = request.query_params.get('body_type')
    if body_type:
        body_type = body_type.strip().lower()
        if body_type not in Car.BodyType.values:
            return Response(
                {
                    'body_type': (
                        f'Invalid body type. Choose from: '
                        f'{", ".join(Car.BodyType.values)}.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        cars = cars.filter(body_type=body_type)

    serializer = CarSerializer(cars, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def car_detail(request, pk):
    car = get_object_or_404(
        Car.objects.prefetch_related('images', ACTIVE_REPS),
        pk=pk,
        is_available=True,
    )
    serializer = CarSerializer(car, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def add_car(request):
    serializer = CarSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        car = serializer.save()
        return Response(
            {
                'message': 'Car added successfully!',
                'data': CarSerializer(car, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def sales_rep_list(request):
    reps = SalesRepresentative.objects.filter(is_active=True)
    serializer = SalesRepresentativeSerializer(
        reps, many=True, context={'request': request}
    )
    return Response(serializer.data)