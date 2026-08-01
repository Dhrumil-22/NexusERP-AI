from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from forged_permissions.permissions import HasModulePermission
from .models import StoreLocation, ProductVariant, Barcode
from .serializers import StoreLocationSerializer, ProductVariantSerializer, BarcodeSerializer

class StoreLocationViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "barcode_catalog"
    required_permission = "manage_catalog"

    serializer_class = StoreLocationSerializer

    def get_queryset(self):
        return StoreLocation.objects.for_tenant(self.request.user.business_id)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

class ProductVariantViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "barcode_catalog"
    required_permission = "manage_catalog"

    serializer_class = ProductVariantSerializer

    def get_queryset(self):
        return ProductVariant.objects.for_tenant(self.request.user.business_id)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

    @action(detail=False, methods=['post'])
    def scan(self, request):
        barcode_value = request.data.get('barcode')
        if not barcode_value:
            return Response({"error": "barcode is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            barcode = Barcode.objects.get(
                tenant=request.user.business,
                barcode_value=barcode_value
            )
            variant = barcode.variant
            
            # Fire product_scanned event
            from core.events import product_scanned
            product_scanned.send(
                sender=self.__class__,
                tenant_id=request.user.business_id,
                variant_id=variant.id,
                product_id=variant.product_id
            )
            
            serializer = self.get_serializer(variant)
            return Response(serializer.data)
        except ObjectDoesNotExist:
            return Response({"error": "Barcode not found"}, status=status.HTTP_404_NOT_FOUND)

class BarcodeViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "barcode_catalog"
    required_permission = "manage_catalog"

    serializer_class = BarcodeSerializer

    def get_queryset(self):
        return Barcode.objects.for_tenant(self.request.user.business_id)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)
