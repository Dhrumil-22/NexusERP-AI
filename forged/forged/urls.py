"""
URL configuration for forged project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('forged_auth.urls')),
    path('api/barcode/', include('barcode_catalog.urls')),
    path('api/booking/', include('booking_scheduler.urls')),
    path('api/business_setup/', include('business_setup.urls')),
    path('api/registry/', include('module_registry.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/sales_orders/', include('sales_orders.urls')),
    path('api/service_packages/', include('service_packages.urls')),
    path('api/reports/', include('reports_analytics.urls')),
    path('api/billing/', include('invoicing_finance.urls')),
    path('api/hr/', include('employee_hr.urls')),
    path('api/reports_analytics/', include('reports_analytics.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/permissions/', include('forged_permissions.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/tables/', include('table_order_mgmt.urls')),
    path('api/kot/', include('kitchen_kot.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/purchase/', include('purchase_supplier.urls')),
    path('api/customer_care/', include('customer_care.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
