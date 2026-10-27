from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .admin_views import AdminSalesRepViewSet, AdminStaffViewSet, admin_stats

router = SimpleRouter()
router.register("staff", AdminStaffViewSet, basename="admin-staff")
router.register("sales-reps", AdminSalesRepViewSet, basename="admin-sales-rep")

urlpatterns = [
    path("stats/", admin_stats),
    path("", include(router.urls)),
]