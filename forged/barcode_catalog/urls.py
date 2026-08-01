from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreLocationViewSet, ProductVariantViewSet, BarcodeViewSet

router = DefaultRouter()
router.register(r'stores', StoreLocationViewSet, basename='storelocation')
router.register(r'variants', ProductVariantViewSet, basename='productvariant')
router.register(r'barcodes', BarcodeViewSet, basename='barcode')

urlpatterns = [
    path('', include(router.urls)),
]
