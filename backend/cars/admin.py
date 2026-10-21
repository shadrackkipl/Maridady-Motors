# cars/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import Car, CarImage, SalesRepresentative, StaffMember
from .staff import STAFF_GROUP_NAME, ensure_staff_group

User = get_user_model()

admin.site.unregister(User)
admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


class CarImageInline(TabularInline):
    model = CarImage
    extra = 3
    fields = ('image', 'order')


@admin.register(Car)
class CarAdmin(ModelAdmin):
    inlines = [CarImageInline]
    filter_horizontal = ('sales_representatives',)

    list_display = (
        'image_thumbnail', 'stock_number', 'make', 'model_name', 'year',
        'body_type', 'condition', 'mileage', 'engine_capacity', 'drivetrain',
        'price', 'is_available',
    )
    list_filter = (
        'body_type', 'condition', 'make', 'year', 'drivetrain', 'is_available',
    )
    search_fields = ('stock_number', 'make', 'model_name')
    list_editable = ('is_available',)

    fieldsets = (
        ('Vehicle', {
            'fields': (
                'image', 'make', 'model_name', 'body_type', 'year',
                'stock_number', 'condition', 'location', 'mileage',
                'engine_capacity', 'drivetrain', 'price',
            )
        }),
        ('Specifications', {
            'fields': (
                'transmission', 'fuel_type', 'variant', 'trim', 'model_code',
                'doors', 'seats', 'exterior_color', 'interior_color',
            ),
        }),
        ('Description & features', {
            'fields': ('description', 'features', 'equipment'),
        }),
        ('Sales representatives', {
            'fields': ('sales_representatives',),
            'description': 'Choose who customers should contact about this vehicle.',
        }),
        ('Availability', {
            'fields': ('is_available',),
            'description': 'Uncheck to hide this vehicle from the frontend.',
        }),
    )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'drivetrain' and formfield:
            formfield.required = True
        return formfield

    @admin.display(description='Preview')
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:80px; height:50px; object-fit:cover; border-radius:5px;" />',
                obj.image.url,
            )
        return "No Image"


@admin.register(SalesRepresentative)
class SalesRepresentativeAdmin(ModelAdmin):
    list_display = (
        'photo_thumbnail', 'name', 'phone', 'whatsapp_number', 'order',
        'is_active',
    )
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'phone', 'whatsapp_number')

    @admin.display(description='Photo')
    def photo_thumbnail(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:40px; height:40px; object-fit:cover; border-radius:50%;" />',
                obj.photo.url,
            )
        return "—"


@admin.register(StaffMember)
class StaffMemberAdmin(BaseUserAdmin, ModelAdmin):
    """
    Add staff here. They can sign in to the staff panel and manage cars
    only. They cannot open this Django admin (Staff status stays off).
    """

    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = ('username', 'first_name', 'last_name', 'email', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('username', 'first_name', 'last_name', 'email')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Access', {
            'fields': ('is_active',),
            'description': (
                'Staff can manage cars only. Untick Active to block this '
                'person from signing in.'
            ),
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .filter(groups__name=STAFF_GROUP_NAME, is_superuser=False)
        )

    def save_model(self, request, obj, form, change):
        obj.is_staff = False  # no access to the Django admin
        obj.is_superuser = False
        super().save_model(request, obj, form, change)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.groups.add(ensure_staff_group())