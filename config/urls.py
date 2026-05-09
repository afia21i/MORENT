from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('cars.urls')),

    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('home.html', TemplateView.as_view(template_name='home.html')),
    path('category.html', TemplateView.as_view(template_name='category.html')),
    path('detail.html', TemplateView.as_view(template_name='detail.html')),
    path('payment.html', TemplateView.as_view(template_name='payment.html')),
    path('dashboard.html', TemplateView.as_view(template_name='dashboard.html')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)