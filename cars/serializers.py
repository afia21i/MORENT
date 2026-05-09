from rest_framework import serializers
from .models import Car, Rental

class CarSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(use_url=True)

    class Meta:
        model = Car
        fields = '__all__'


class RentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = '__all__'
        read_only_fields = ['subtotal', 'tax', 'total_price','user']

