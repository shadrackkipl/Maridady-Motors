# cars/serializers.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Car, CarImage, SalesRepresentative
from .staff import ensure_staff_group

User = get_user_model()


def normalize_phone(value):
    """Return digits only, with Kenya's 254 country code for local numbers."""
    digits = "".join(ch for ch in (value or "") if ch.isdigit())
    if digits.startswith("0"):
        digits = "254" + digits[1:]
    elif len(digits) == 9 and digits[0] in "17":
        digits = "254" + digits
    return digits


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image']


class SalesRepresentativeSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()
    whatsapp = serializers.SerializerMethodField()

    class Meta:
        model = SalesRepresentative
        fields = ['id', 'name', 'photo', 'phone', 'whatsapp']

    def get_phone(self, obj):
        return normalize_phone(obj.phone)

    def get_whatsapp(self, obj):
        return normalize_phone(obj.whatsapp_number or obj.phone)


class CarSerializer(serializers.ModelSerializer):
    body_type_display = serializers.CharField(
        source='get_body_type_display', read_only=True
    )
    images = CarImageSerializer(many=True, read_only=True)
    sales_representatives = SalesRepresentativeSerializer(many=True, read_only=True)
    feature_list = serializers.SerializerMethodField()
    equipment_list = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model_name', 'body_type', 'body_type_display',
            'year', 'stock_number', 'price', 'mileage', 'engine_capacity',
            'drivetrain', 'image', 'images', 'description', 'transmission',
            'fuel_type', 'condition', 'location', 'variant', 'trim',
            'model_code', 'doors', 'seats', 'exterior_color',
            'interior_color', 'features', 'feature_list', 'equipment',
            'equipment_list', 'sales_representatives', 'is_available',
            'created_at',
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'transmission': {'required': False},
            'fuel_type': {'required': False},
            'body_type': {'required': True},
            'engine_capacity': {'required': True, 'min_value': 1},
            'drivetrain': {'required': True, 'allow_blank': False},
        }

    def get_feature_list(self, obj):
        return [line.strip() for line in obj.features.splitlines() if line.strip()]

    def get_equipment_list(self, obj):
        return [line.strip() for line in obj.equipment.splitlines() if line.strip()]


class StaffCarSerializer(serializers.ModelSerializer):
    """Full read/write car data for the staff panel."""

    body_type_display = serializers.CharField(
        source='get_body_type_display', read_only=True
    )
    images = CarImageSerializer(many=True, read_only=True)
    sales_representative_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        required=False,
        queryset=SalesRepresentative.objects.all(),
        source='sales_representatives',
    )

    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model_name', 'body_type', 'body_type_display',
            'year', 'stock_number', 'price', 'mileage', 'engine_capacity',
            'drivetrain', 'condition', 'location', 'variant', 'trim',
            'model_code', 'doors', 'seats', 'exterior_color',
            'interior_color', 'transmission', 'fuel_type', 'description',
            'features', 'equipment', 'image', 'images',
            'sales_representative_ids', 'is_available', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'engine_capacity': {'min_value': 1},
            'drivetrain': {'required': True, 'allow_blank': False},
        }


class StaffUserSerializer(serializers.ModelSerializer):
    """Staff accounts, managed by the administrator in the admin panel."""

    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'is_active', 'date_joined', 'last_login', 'password',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'A password is required.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.is_staff = False       # no access to the Django admin
        user.is_superuser = False
        user.set_password(password)
        user.save()
        user.groups.add(ensure_staff_group())
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AdminSalesRepSerializer(serializers.ModelSerializer):
    cars_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SalesRepresentative
        fields = [
            'id', 'name', 'photo', 'phone', 'whatsapp_number',
            'is_active', 'order', 'cars_count',
        ]