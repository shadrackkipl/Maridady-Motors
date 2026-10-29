# cars/admin_views.py
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Sum
from django.conf import settings
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import (
    action,
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .mailing import email_delivery_is_real, send_announcement
from .models import Announcement, Car, Inquiry, Sale, SalesRepresentative
from .serializers import (
    AdminInquirySerializer,
    AdminSalesRepSerializer,
    AnnouncementSerializer,
    SaleSerializer,
    StaffUserSerializer,
)
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
    sales = Sale.objects.all()
    sales_totals = sales.aggregate(
        revenue=Sum("sale_price"), outstanding=Sum(F("sale_price") - F("amount_paid"))
    )
    inquiry_counts = {
        row["status"]: row["total"]
        for row in Inquiry.objects.values("status").annotate(total=Count("id"))
    }

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
            "inquiries": {
                "total": sum(inquiry_counts.values()),
                "new": inquiry_counts.get("new", 0),
            },
            "sales": {
                "total": sales.count(),
                "revenue": float(sales_totals["revenue"] or 0),
                "outstanding": float(sales_totals["outstanding"] or 0),
            },
            "by_body_type": by_body_type,
            "recent_cars": recent_cars,
        }
    )


class AdminInquiryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Requests customers send from the website. The admin can update the
    status and notes, or delete a request."""

    serializer_class = AdminInquirySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminSuperuser]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = Inquiry.objects.select_related("car")
        wanted = self.request.query_params.get("status")
        if wanted in Inquiry.Status.values:
            queryset = queryset.filter(status=wanted)
        return queryset

    @action(detail=False, methods=["get"])
    def summary(self, request):
        counts = {row["status"]: row["total"] for row in
                  Inquiry.objects.values("status").annotate(total=Count("id"))}
        return Response(
            {
                "new": counts.get("new", 0),
                "contacted": counts.get("contacted", 0),
                "closed": counts.get("closed", 0),
                "total": sum(counts.values()),
            }
        )


class AdminSaleViewSet(viewsets.ModelViewSet):
    """Record a sold vehicle (this creates its invoice), view and edit invoices."""

    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminSuperuser]

    def get_queryset(self):
        return Sale.objects.select_related("car", "created_by")

    @action(detail=False, methods=["get"], url_path="sellable-cars")
    def sellable_cars(self, request):
        """Vehicles that have not been sold yet, for the "Record a sale" form."""
        cars = Car.objects.filter(sale__isnull=True).order_by("-created_at")
        return Response(
            [
                {
                    "id": car.id,
                    "label": f"{car.year} {car.make} {car.model_name}",
                    "stock_number": car.stock_number,
                    "price": str(car.price),
                    "is_available": car.is_available,
                }
                for car in cars
            ]
        )


class AdminAnnouncementViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Email the sales representatives and keep a history of what was sent."""

    serializer_class = AnnouncementSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminSuperuser]

    def get_queryset(self):
        return Announcement.objects.select_related("sent_by")

    @action(detail=False, methods=["get"], url_path="email-status")
    def email_status(self, request):
        """Tells the page whether real email delivery is set up."""
        return Response(
            {
                "configured": email_delivery_is_real(),
                "from_email": settings.DEFAULT_FROM_EMAIL,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        reps = SalesRepresentative.objects.filter(is_active=True).exclude(email="")
        chosen = data.get("recipient_ids")
        if chosen:
            reps = reps.filter(id__in=chosen)
        reps = list(reps)

        if not reps:
            return Response(
                {
                    "recipient_ids": (
                        "No sales representatives with an email address were found. "
                        "Add their emails on the Sales team page first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        sent, failures, recipients = send_announcement(
            data["subject"], data["message"], reps, request.user
        )

        announcement = Announcement.objects.create(
            subject=data["subject"],
            message=data["message"],
            sent_by=request.user,
            recipients="\n".join(recipients),
            sent_count=sent,
            failed_count=len(failures),
            failures="\n".join(failures),
            real_delivery=email_delivery_is_real(),
        )
        return Response(
            self.get_serializer(announcement).data, status=status.HTTP_201_CREATED
        )