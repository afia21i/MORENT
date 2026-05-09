from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, RentalViewSet, dashboard, popular_cars, recommended_cars, car_counts

router = DefaultRouter()
router.register(r'cars', CarViewSet)
router.register(r'rentals', RentalViewSet)

urlpatterns = [
    path('popular-cars/',     popular_cars),
    path('recommended-cars/', recommended_cars),
    path('dashboard/',        dashboard),
    path('car-counts/',       car_counts),
    path('', include(router.urls)),
]