from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Car(models.Model):

    CAR_TYPES = [
        ('sport', 'Sport'),
        ('suv', 'SUV'),
        ('coupe', 'Coupe'),
        ('hatchback', 'Hatchback'),
        ('mpv', 'MPV'),
    ]

    TRANSMISSION_TYPES = [
        ('manual', 'Manual'),
        ('automatic', 'Automatic'),
    ]

    name = models.CharField(max_length=100)

    brand = models.CharField(max_length=100)

    type = models.CharField(
        max_length=20,
        choices=CAR_TYPES,
        default='sport'
    )

    description = models.TextField(
        default='Luxury car for comfortable driving'
    )

    price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to='cars/',
        null=True,
        blank=True
    )

    available = models.BooleanField(default=True)

    is_popular = models.BooleanField(default=False)

    is_recommended = models.BooleanField(default=False)

    fuel_capacity = models.IntegerField(default=70)

    seats = models.IntegerField(default=4)

    transmission = models.CharField(
        max_length=20,
        choices=TRANSMISSION_TYPES,
        default='automatic'
    )

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=4.5
    )

    reviews = models.IntegerField(default=100)

    horsepower = models.IntegerField(default=500)

    top_speed = models.IntegerField(default=280)

    def __str__(self):
        return self.name
    
class Rental(models.Model):
    PAYMENT_METHODS = [
        ('card', 'Credit Card'),
        ('paypal', 'PayPal'),
        ('bitcoin', 'Bitcoin'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    car = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name='rentals'
    )

    
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)

    
    pickup_location = models.CharField(max_length=100)
    dropoff_location = models.CharField(max_length=100)

    pickup_date = models.DateField()
    dropoff_date = models.DateField()

    pickup_time = models.TimeField()
    dropoff_time = models.TimeField()
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        days = (self.dropoff_date - self.pickup_date).days

        if days <= 0:
            days = 1

        self.subtotal = days * self.car.price_per_day
        self.tax = self.subtotal * Decimal('0.1')
        self.total_price = self.subtotal + self.tax

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} | {self.car} | {self.pickup_date}"
    
