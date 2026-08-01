from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from forged_permissions.permissions import HasModulePermission
from .models import Category, Product, StockAdjustment
from .serializers import CategorySerializer, ProductSerializer, StockAdjustmentSerializer
from django.db import transaction

class InventoryBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "inventory"

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.required_permission = 'view_inventory'
        else:
            self.required_permission = 'edit_inventory'
        return super().get_permissions()

    def get_queryset(self):
        business_id = self.request.user.business_id
        return self.queryset.model.objects.for_tenant(business_id)  # type: ignore

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

class CategoryViewSet(InventoryBaseViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(InventoryBaseViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        quantity = request.data.get('quantity_adjusted')
        reason = request.data.get('reason')
        
        if not quantity or not reason:
            return Response({"error": "quantity_adjusted and reason are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from decimal import Decimal, InvalidOperation
        try:
            quantity = Decimal(str(quantity))
        except InvalidOperation:
            return Response({"error": "Invalid quantity."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():  # type: ignore
            product.stock_quantity += quantity
            product.save()
            
            StockAdjustment.objects.create(
                tenant=request.user.business,
                product=product,
                quantity_adjusted=quantity,
                reason=reason
            )
            
            # Fire signal if low stock
            if product.stock_quantity <= product.reorder_threshold:
                from core.events import stock_low
                stock_low.send(sender=self.__class__, tenant_id=request.user.business_id, product_id=product.id, current_stock=product.stock_quantity, threshold=product.reorder_threshold)
            
        return Response({"status": "stock adjusted", "new_quantity": product.stock_quantity})

class StockAdjustmentViewSet(InventoryBaseViewSet):
    queryset = StockAdjustment.objects.all()
    serializer_class = StockAdjustmentSerializer
