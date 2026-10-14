from django.db import models


class Car(models.Model):
    class BodyType(models.TextChoices):
        SUV = "suv", "SUV"
        SEDAN = "sedan", "Sedan"
        HATCHBACK = "hatchback", "Hatchback"
        PICKUP = "pickup", "Pickup"
        VAN = "van", "Van"
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