# cars/admin_views.py
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from rest_framework import permissions, viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Car, SalesRepresentative
from .serializers import AdminSalesRepSerializer, StaffUserSerializer
from .staff import STAFF_GROUP_NAME

User = get_user_model()


class IsAdminSuperuser(permissions.BasePermission):
    """Only the administrator (a Django superuser) may use these endpoints."""

    message = "Only the administrator can do this."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.is_active and user.is_superuser
        )


def staff_queryset():
    return User.objects.filter(groups__name=STAFF_GROUP_NAME, is_superuser=False)


class AdminStaffViewSet(viewsets.ModelViewSet):
    """Add, edit, deactivate, reset the password of, and delete staff."""

    serializer_class = StaffUserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminSuperuser]

    def get_queryset(self):
        return staff_queryset().order_by("-date_joined")


class AdminSalesRepViewSet(viewsets.ModelViewSet):
    """Full control of the sales representatives shown on vehicle pages."""

    serializer_class = AdminSalesRepSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminSuperuser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return SalesRepresentative.objects.annotate(cars_count=Count("cars"))


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminSuperuser])
def admin_stats(request):
    """Numbers for the admin dashboard."""
    cars = Car.objects.all()
    available = cars.filter(is_available=True)
    labels = dict(Car.BodyType.choices)

    by_body_type = [
        {
            "body_type": row["body_type"],
            "label": labels.get(row["body_type"], row["body_type"]),
            "count": row["count"],
        }
        for row in cars.values("body_type")
        .annotate(count=Count("id"))
        .order_by("-count")
    ]

    recent_cars = [
        {
            "id": car.id,
            "name": f"{car.year} {car.make} {car.model_name}",
            "stock_number": car.stock_number,
            "is_available": car.is_available,
            "created_at": car.created_at.isoformat(),
        }
        for car in cars.order_by("-created_at")[:6]
    ]

    staff = staff_queryset()
    reps = SalesRepresentative.objects.all()

    return Response(
        {
            "cars": {
                "total": cars.count(),
                "available": available.count(),
                "hidden": cars.filter(is_available=False).count(),
                "listed_value": float(
                    available.aggregate(total=Sum("price"))["total"] or 0
                ),
            },
            "staff": {
                "total": staff.count(),
                "active": staff.filter(is_active=True).count(),
            },
            "sales_reps": {
                "total": reps.count(),
                "active": reps.filter(is_active=True).count(),
            },
            "by_body_type": by_body_type,
            "recent_cars": recent_cars,
        }
    )