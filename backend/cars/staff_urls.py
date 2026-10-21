# cars/staff_urls.py
from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .staff_views import StaffCarViewSet, staff_me, staff_sales_reps

router = SimpleRouter()
router.register("cars", StaffCarViewSet, basename="staff-car")

urlpatterns = [
    path("me/", staff_me),
    path("sales-reps/", staff_sales_reps),
    path("", include(router.urls)),
]