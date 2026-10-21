# cars/staff.py
from django.contrib.auth.models import Group, Permission

STAFF_GROUP_NAME = "Car Staff"

# Staff get full create / read / update / delete on cars and car photos,
# and nothing else.
STAFF_PERMISSIONS = [
    "view_car", "add_car", "change_car", "delete_car",
    "view_carimage", "add_carimage", "change_carimage", "delete_carimage",
]


def ensure_staff_group():
    """Create the staff group if needed and make sure it has the car permissions."""
    group, _ = Group.objects.get_or_create(name=STAFF_GROUP_NAME)
    permissions = Permission.objects.filter(
        content_type__app_label="cars",
        codename__in=STAFF_PERMISSIONS,
    )
    group.permissions.add(*permissions)
    return group