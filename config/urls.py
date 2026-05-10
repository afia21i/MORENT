from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('cars.urls')),
    path('',           TemplateView.as_view(template_name='home.html'),      name='home'),
    path('category/',  TemplateView.as_view(template_name='category.html'),  name='category'),
    path('detail/',    TemplateView.as_view(template_name='detail.html'),     name='detail'),
    path('payment/',   TemplateView.as_view(template_name='payment.html'),    name='payment'),
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html'),  name='dashboard'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)