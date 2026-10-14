# cars/serializers.py
from rest_framework import serializers

from .models import Car, CarImage, SalesRepresentative


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image']


class CarSerializer(serializers.ModelSerializer):
    body_type_display = serializers.CharField(
        source='get_body_type_display', read_only=True
    )
    images = CarImageSerializer(many=True, read_only=True)
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
            'equipment_list',
            'is_available', 'created_at',
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


def normalize_phone(value):
    """Return digits only, with Kenya's 254 country code for local numbers."""
    digits = "".join(ch for ch in (value or "") if ch.isdigit())
    if digits.startswith("0"):
        digits = "254" + digits[1:]
    elif len(digits) == 9 and digits[0] in "17":
        digits = "254" + digits
    return digits


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