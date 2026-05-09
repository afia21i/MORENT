from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Sum, Q
from django.contrib.auth.models import User

from .models import Car, Rental
from .serializers import CarSerializer, RentalSerializer


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer

    def get_queryset(self):
        queryset = Car.objects.all()

        car_type = self.request.query_params.get('type')
        seats = self.request.query_params.get('seats')
        search = self.request.query_params.get('search')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if car_type:
            queryset = queryset.filter(type=car_type)

        if seats:
            queryset = queryset.filter(seats=int(seats))

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(brand__icontains=search)
            )

        if min_price:
            queryset = queryset.filter(price_per_day__gte=float(min_price))

        if max_price:
            queryset = queryset.filter(price_per_day__lte=float(max_price))

        return queryset


class RentalViewSet(viewsets.ModelViewSet):

    queryset = Rental.objects.all()

    serializer_class = RentalSerializer

    def perform_create(self, serializer):

        car = serializer.validated_data['car']

        pickup = serializer.validated_data['pickup_date']

        dropoff = serializer.validated_data['dropoff_date']

        if dropoff < pickup:

            raise ValidationError(
                "Dropoff date must be after pickup date"
            )

        if Rental.objects.filter(
            car=car,
            pickup_date__lt=dropoff,
            dropoff_date__gt=pickup
        ).exists():

            raise ValidationError(
                "Car already booked for these dates!"
            )

        user = User.objects.first()

        serializer.save(user=user)

@api_view(['GET'])
def dashboard(request):
    try:
        total_cars = Car.objects.count()
        total_rentals = Rental.objects.count()
        revenue = Rental.objects.aggregate(
            Sum('total_price')
        )['total_price__sum'] or 0

        recent_rentals = Rental.objects.select_related('car').order_by('-created_at')[:5]

        rentals_data = []
        for rental in recent_rentals:
            rentals_data.append({
                "customer":         rental.full_name,
                "car":              rental.car.name,
                "car_type":         rental.car.type,
                "image":            request.build_absolute_uri(rental.car.image.url) if rental.car.image else None,
                "total":            str(rental.total_price),
                "pickup":           str(rental.pickup_date),
                "dropoff":          str(rental.dropoff_date),
                "pickup_location":  rental.pickup_location,
                "dropoff_location": rental.dropoff_location,
                "pickup_time":      str(rental.pickup_time),
                "dropoff_time":     str(rental.dropoff_time),
            })

        return Response({
            "total_cars":     total_cars,
            "total_rentals":  total_rentals,
            "revenue":        str(revenue),
            "recent_rentals": rentals_data,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
def car_counts(request):
    from django.db.models import Count
    
    # Type counts
    type_counts = dict(
        Car.objects.values_list('type').annotate(count=Count('id'))
    )
    
    # Seat counts
    seat_counts = {}
    seat_counts['2']  = Car.objects.filter(seats=2).count()
    seat_counts['4']  = Car.objects.filter(seats=4).count()
    seat_counts['6']  = Car.objects.filter(seats=6).count()
    seat_counts['8+'] = Car.objects.filter(seats__gte=8).count()

    return Response({
        "types": type_counts,
        "seats": seat_counts,
    })

@api_view(['GET'])
def popular_cars(request):
    cars = Car.objects.filter(is_popular=True)[:6]
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def recommended_cars(request):
    cars = Car.objects.filter(is_recommended=True)[:6]
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)