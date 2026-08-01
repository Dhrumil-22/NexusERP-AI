from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, SupplierProductMapViewSet, PurchaseOrderViewSet, PurchaseOrderLineViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'supplier-mappings', SupplierProductMapViewSet, basename='supplier-mapping')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'purchase-order-lines', PurchaseOrderLineViewSet, basename='purchase-order-line')

urlpatterns = [
    path('', include(router.urls)),
]
