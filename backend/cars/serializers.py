# cars/serializers.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import (
    Announcement,
    Car,
    CarImage,
    Inquiry,
    Sale,
    SalesRepresentative,
)
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
            'id', 'name', 'photo', 'phone', 'whatsapp_number', 'email',
            'is_active', 'order', 'cars_count',
        ]


# ---------------------------------------------------------------------------
# Client requests (inquiries)
# ---------------------------------------------------------------------------

class InquiryCreateSerializer(serializers.ModelSerializer):
    """What a customer sends from the website."""

    car = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.filter(is_available=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Inquiry
        fields = ['car', 'name', 'phone', 'email', 'message']
        extra_kwargs = {
            'name': {'max_length': 100},
            'message': {'max_length': 2000},
        }

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please enter your name.')
        return value

    def validate_phone(self, value):
        digits = ''.join(ch for ch in value if ch.isdigit())
        if not 9 <= len(digits) <= 15:
            raise serializers.ValidationError('Please enter a valid phone number.')
        return value.strip()

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please write a short message.')
        return value

    def create(self, validated_data):
        car = validated_data.get('car')
        if car:
            validated_data['vehicle_label'] = (
                f'{car.year} {car.make} {car.model_name} (Stock no. {car.stock_number})'
            )
        return super().create(validated_data)


class AdminInquirySerializer(serializers.ModelSerializer):
    """The administrator can read everything and change only status and notes."""

    class Meta:
        model = Inquiry
        fields = [
            'id', 'car', 'vehicle_label', 'name', 'phone', 'email',
            'message', 'status', 'admin_notes', 'created_at',
        ]
        read_only_fields = [
            'id', 'car', 'vehicle_label', 'name', 'phone', 'email',
            'message', 'created_at',
        ]


# ---------------------------------------------------------------------------
# Sales and invoices
# ---------------------------------------------------------------------------

def vehicle_snapshot(car):
    """Text copied onto the invoice at the time of sale."""
    details = [
        ('Year', car.year),
        ('Make', car.make),
        ('Model', car.model_name),
        ('Variant', car.variant),
        ('Body type', car.get_body_type_display()),
        ('Mileage', f'{car.mileage:,} km' if car.mileage is not None else ''),
        ('Engine', f'{car.engine_capacity:,} cc' if car.engine_capacity else ''),
        ('Transmission', car.transmission),
        ('Fuel type', car.fuel_type),
        ('Drivetrain', car.drivetrain),
        ('Colour', car.exterior_color),
        ('Condition', car.condition),
    ]
    return {
        'vehicle_description': f'{car.year} {car.make} {car.model_name}',
        'stock_number': car.stock_number,
        'vehicle_details': '\n'.join(
            f'{label}: {value}' for label, value in details if value not in ('', None)
        ),
    }


class SaleSerializer(serializers.ModelSerializer):
    car = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(), required=False, allow_null=True
    )
    sale_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, min_value=0
    )
    amount_paid = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, min_value=0
    )
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    payment_status = serializers.CharField(read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'car', 'vehicle_description', 'stock_number',
            'vehicle_details', 'buyer_name', 'buyer_phone', 'buyer_email',
            'buyer_address', 'sale_price', 'amount_paid', 'balance',
            'payment_status', 'payment_method', 'notes', 'sold_at',
            'created_by_name', 'created_at',
        ]
        read_only_fields = [
            'id', 'invoice_number', 'vehicle_description', 'stock_number',
            'vehicle_details', 'created_at',
        ]

    def get_created_by_name(self, obj):
        user = obj.created_by
        if not user:
            return ''
        return user.get_full_name() or user.get_username()

    def validate_car(self, value):
        if self.instance is None:
            if value is None:
                raise serializers.ValidationError('Choose the vehicle that was sold.')
            if Sale.objects.filter(car=value).exists():
                raise serializers.ValidationError(
                    'This vehicle already has a sale and an invoice.'
                )
        return value

    def validate(self, attrs):
        creating = self.instance is None
        car = attrs.get('car')

        if creating and car is None:
            raise serializers.ValidationError({'car': 'Choose the vehicle that was sold.'})
        if creating and 'sale_price' not in attrs and car is not None:
            attrs['sale_price'] = car.price

        price = attrs.get('sale_price', getattr(self.instance, 'sale_price', None))
        paid = attrs.get('amount_paid', getattr(self.instance, 'amount_paid', 0))
        if price is not None and paid is not None and paid > price:
            raise serializers.ValidationError(
                {'amount_paid': 'The amount paid cannot be more than the sale price.'}
            )
        return attrs

    def create(self, validated_data):
        from django.db import transaction

        car = validated_data['car']
        request = self.context.get('request')

        with transaction.atomic():
            validated_data.update(vehicle_snapshot(car))
            if request and request.user.is_authenticated:
                validated_data['created_by'] = request.user
            sale = super().create(validated_data)

            # A sold vehicle must no longer appear on the website
            if car.is_available:
                car.is_available = False
                car.save(update_fields=['is_available'])
        return sale

    def update(self, instance, validated_data):
        validated_data.pop('car', None)  # the vehicle cannot be swapped later
        return super().update(instance, validated_data)


# ---------------------------------------------------------------------------
# Announcements to sales representatives
# ---------------------------------------------------------------------------

class AnnouncementSerializer(serializers.ModelSerializer):
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    sent_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'subject', 'message', 'recipient_ids', 'recipients',
            'sent_by_name', 'sent_count', 'failed_count', 'failures',
            'real_delivery', 'created_at',
        ]
        read_only_fields = [
            'id', 'recipients', 'sent_by_name', 'sent_count', 'failed_count',
            'failures', 'real_delivery', 'created_at',
        ]
        extra_kwargs = {
            'subject': {'max_length': 200},
            'message': {'max_length': 5000},
        }

    def get_sent_by_name(self, obj):
        user = obj.sent_by
        if not user:
            return ''
        return user.get_full_name() or user.get_username()

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please enter a subject.')
        return value

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please write a message.')
        return value