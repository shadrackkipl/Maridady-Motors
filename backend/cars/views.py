# cars/views.py
import hashlib
from datetime import datetime, timedelta, timezone

from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    parser_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Car, SalesRepresentative
from .serializers import (
    CarSerializer,
    InquiryCreateSerializer,
    SalesRepresentativeSerializer,
)

# Only show active sales representatives on vehicles
ACTIVE_REPS = Prefetch(
    'sales_representatives',
    queryset=SalesRepresentative.objects.filter(is_active=True),
)


# East Africa Time (UTC+3, no daylight saving): the "day" changes at midnight in Nairobi
NAIROBI_TZ = timezone(timedelta(hours=3))


# How many vehicles are featured each day (fewer if stock is lower).
# Pages can ask for another number with ?limit=, up to the maximum.
FEATURED_DAILY_COUNT = 6
FEATURED_MAX_COUNT = 12


def daily_featured(cars, limit_param=None):
    """
    Picks cars that stay the same all day for every visitor and change at
    midnight. Each car gets a score from the date and its id, and the lowest
    scores win, so adding a car mid-day rarely reshuffles the list.
    """
    try:
        count = max(1, min(int(limit_param), FEATURED_MAX_COUNT))
    except (TypeError, ValueError):
        count = FEATURED_DAILY_COUNT

    today = datetime.now(NAIROBI_TZ).date().isoformat()
    by_id = {car.id: car for car in cars}
    ranked = sorted(
        by_id,
        key=lambda car_id: hashlib.sha256(f'{today}:{car_id}'.encode()).hexdigest(),
    )
    return [by_id[car_id] for car_id in ranked[:count]]


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

    # Optional: /api/cars/?featured=1&limit=8 gives today's rotating picks
    if request.query_params.get('featured'):
        cars = daily_featured(cars, request.query_params.get('limit'))

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


class InquiryThrottle(AnonRateThrottle):
    """At most 10 requests an hour from one visitor, to stop spam."""

    scope = 'inquiry'
    rate = '10/hour'


@api_view(['POST'])
@authentication_classes([])  # public: an old or expired login must not block it
@permission_classes([AllowAny])
@throttle_classes([InquiryThrottle])
def create_inquiry(request):
    """A customer sends a request about a vehicle (or a general question)."""
    # Honeypot: real visitors never see or fill this hidden field, bots do
    if request.data.get('website'):
        return Response({'message': 'Thank you!'}, status=status.HTTP_201_CREATED)

    serializer = InquiryCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(
        {
            'message': (
                'Thank you! Your request has been received. '
                'We will contact you shortly.'
            )
        },
        status=status.HTTP_201_CREATED,
    )