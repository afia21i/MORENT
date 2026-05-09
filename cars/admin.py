from django.contrib import admin
from .models import Car, Rental

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):

    list_display = [
        'name',
        'brand',
        'type',
        'price_per_day',
        'available',
        'is_popular',
        'is_recommended'
    ]

    list_filter = [
        'type',
        'available',
        'is_popular',
        'is_recommended'
    ]

    search_fields = [
        'name',
        'brand'
    ]


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):

    list_display = [
        'full_name',
        'car',
        'pickup_date',
        'dropoff_date',
        'total_price'
    ]

    search_fields = [
        'full_name'
    ]