# cars/models.py
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone


class Car(models.Model):
    class BodyType(models.TextChoices):
        SUV = "suv", "SUV"
        SEDAN = "sedan", "Sedan"
        HATCHBACK = "hatchback", "Hatchback"
        STATION_WAGON = "station_wagon", "Station Wagon"
        PICKUP = "pickup", "Pickup"
        VAN = "van", "Van"
        MINIVAN = "minivan", "Minivan"
        COMMERCIAL = "commercial", "Commercial Vehicle"
        OTHER = "other", "Other"

    class Condition(models.TextChoices):
        USED = "Used", "Used"
        NEW = "New", "New"

    make = models.CharField(max_length=50)  # e.g., Toyota, Mercedes
    model_name = models.CharField(max_length=50, verbose_name="Model")  # e.g., Camry, GLE
    body_type = models.CharField(
        max_length=20,
        choices=BodyType.choices,
        default=BodyType.OTHER,
        db_index=True,
    )
    year = models.IntegerField()
    stock_number = models.CharField(max_length=30, unique=True, verbose_name="Stock no.")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mileage = models.IntegerField(help_text="Mileage in KM")
    engine_capacity = models.PositiveIntegerField(help_text="Engine capacity in cc")
    drivetrain = models.CharField(
        max_length=10,
        blank=True,
        choices=[("2WD", "2WD"), ("4WD", "4WD"), ("AWD", "AWD")],
        default="",
    )

    # Extra details shown on the vehicle page
    condition = models.CharField(
        max_length=10, choices=Condition.choices, default=Condition.USED
    )
    location = models.CharField(
        max_length=50, blank=True, default="", help_text="e.g. Yokohama, Mombasa"
    )
    variant = models.CharField(max_length=50, blank=True, default="")
    trim = models.CharField(max_length=50, blank=True, default="")
    model_code = models.CharField(max_length=30, blank=True, default="")
    doors = models.PositiveSmallIntegerField(null=True, blank=True)
    seats = models.PositiveSmallIntegerField(null=True, blank=True)
    exterior_color = models.CharField(max_length=30, blank=True, default="")
    interior_color = models.CharField(max_length=30, blank=True, default="")
    features = models.TextField(
        blank=True,
        default="",
        verbose_name="Top features",
        help_text="One feature per line, e.g. Sunroof, Reverse camera",
    )
    equipment = models.TextField(
        blank=True,
        default="",
        verbose_name="Features & equipment",
        help_text=(
            "Full equipment list for the Features tab, one item per line. "
            "If left blank, the Top features list is shown instead."
        ),
    )

    # Main (cover) image, used on listing cards. Requires Pillow.
    image = models.ImageField(upload_to="cars/", null=True, blank=True)

    description = models.TextField(
        blank=True,
        default="",
        help_text="Wrap text in **double asterisks** to make it bold.",
    )
    transmission = models.CharField(
        max_length=20,
        choices=[("Automatic", "Automatic"), ("Manual", "Manual")],
        default="Automatic",
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=[
            ("Petrol", "Petrol"),
            ("Diesel", "Diesel"),
            ("Hybrid", "Hybrid"),
            ("Electric", "Electric"),
        ],
        default="Petrol",
    )

    sales_representatives = models.ManyToManyField(
        "SalesRepresentative",
        blank=True,
        related_name="cars",
        help_text="Who customers should contact about this vehicle",
    )

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model_name}"


class CarImage(models.Model):
    """Additional gallery photos for a car."""

    car = models.ForeignKey(Car, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="cars/gallery/")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"Image {self.pk} for {self.car}"


class SalesRepresentative(models.Model):
    """A sales team member shown on vehicle pages, with contact details."""

    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="sales_reps/", null=True, blank=True)
    phone = models.CharField(
        max_length=20,
        help_text="Used for the call button, e.g. 0712345678 or +254712345678",
    )
    whatsapp_number = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="Leave blank to use the phone number for WhatsApp",
    )
    email = models.EmailField(
        blank=True,
        default="",
        help_text="Used for announcements from the administrator",
    )
    is_active = models.BooleanField(
        default=True, help_text="Untick to hide this person from the website"
    )
    order = models.PositiveSmallIntegerField(
        default=0, help_text="Lower numbers appear first"
    )

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Sales representative"
        verbose_name_plural = "Sales representatives"

    def __str__(self):
        return self.name


class StaffMember(get_user_model()):
    """
    Proxy of the user model, used only to give the admin a simple
    "Staff members" screen. It creates no new database table.
    """

    class Meta:
        proxy = True
        verbose_name = "Staff member"
        verbose_name_plural = "Staff members"


class Inquiry(models.Model):
    """A request sent by a customer from the website."""

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    car = models.ForeignKey(
        Car, null=True, blank=True, on_delete=models.SET_NULL, related_name="inquiries"
    )
    # Kept as text so the request still makes sense if the car is deleted later
    vehicle_label = models.CharField(max_length=200, blank=True, default="")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True, default="")
    message = models.TextField()
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.NEW, db_index=True
    )
    admin_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Inquiries"

    def __str__(self):
        return f"{self.name} - {self.vehicle_label or 'General inquiry'}"


class Sale(models.Model):
    """A sold vehicle and its invoice."""

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        MPESA = "mpesa", "M-Pesa"
        BANK = "bank_transfer", "Bank transfer"
        FINANCING = "financing", "Financing / loan"
        OTHER = "other", "Other"

    car = models.OneToOneField(
        Car, null=True, blank=True, on_delete=models.SET_NULL, related_name="sale"
    )
    invoice_number = models.CharField(max_length=20, unique=True, editable=False)

    # Vehicle details are copied at the time of sale, so the invoice never
    # changes if the car is edited or deleted later.
    vehicle_description = models.CharField(max_length=200)
    stock_number = models.CharField(max_length=30, blank=True, default="")
    vehicle_details = models.TextField(blank=True, default="")

    buyer_name = models.CharField(max_length=120)
    buyer_phone = models.CharField(max_length=30, blank=True, default="")
    buyer_email = models.EmailField(blank=True, default="")
    buyer_address = models.CharField(max_length=200, blank=True, default="")

    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH
    )
    notes = models.TextField(blank=True, default="")
    sold_at = models.DateField(default=timezone.localdate)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sales_recorded",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-sold_at", "-id"]

    def __str__(self):
        return f"{self.invoice_number} - {self.vehicle_description}"

    @property
    def balance(self):
        return self.sale_price - self.amount_paid

    @property
    def payment_status(self):
        if self.amount_paid <= 0:
            return "unpaid"
        return "paid" if self.balance <= 0 else "partial"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            year = (self.sold_at or timezone.localdate()).year
            prefix = f"INV-{year}-"
            last = (
                Sale.objects.filter(invoice_number__startswith=prefix)
                .order_by("-invoice_number")
                .first()
            )
            number = int(last.invoice_number.rsplit("-", 1)[1]) + 1 if last else 1
            self.invoice_number = f"{prefix}{number:04d}"
        super().save(*args, **kwargs)


class Announcement(models.Model):
    """A message the administrator emailed to sales representatives."""

    subject = models.CharField(max_length=200)
    message = models.TextField()
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="announcements",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    recipients = models.TextField(blank=True, default="", help_text="One per line")
    sent_count = models.PositiveSmallIntegerField(default=0)
    failed_count = models.PositiveSmallIntegerField(default=0)
    failures = models.TextField(blank=True, default="")
    real_delivery = models.BooleanField(
        default=True,
        help_text="False when the server only printed the emails to its console",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.subject