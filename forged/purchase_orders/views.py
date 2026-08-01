from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from forged_permissions.permissions import HasModulePermission
from .models import PurchaseOrder, PurchaseOrderLine
from .serializers import PurchaseOrderSerializer, PurchaseOrderLineSerializer
from core.events import purchase_order_created, stock_received

class PurchaseOrderBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "purchase_orders"

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.required_permission = 'view_purchase_orders'
        else:
            self.required_permission = 'edit_purchase_orders'
        return super().get_permissions()

    def get_queryset(self):
        return self.queryset.filter(tenant=self.request.user.business)

    def perform_create(self, serializer):
        instance = serializer.save(tenant=self.request.user.business)
        # Send purchase order created signal if needed
        purchase_order_created.send(sender=self.__class__, tenant_id=self.request.user.business_id, purchase_order_id=instance.id)

class PurchaseOrderViewSet(PurchaseOrderBaseViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        po = self.get_object()
        # Expecting request.data to be {'received_items': [{'product_id': 'uuid', 'quantity_received': 10}]}
        # or simplified {'items': [{'product_id': 'uuid', 'quantity_received': 10}]}
        items = request.data.get('items', [])
        
        if not items:
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # We need to update the PurchaseOrderLines and then fire the stock_received event
        for item in items:
            product_id = item.get('product_id')
            qty = float(item.get('quantity_received', 0))
            
            # Find the line
            line = po.lines.filter(product_id=product_id).first()
            if line:
                line.quantity_received += qty
                line.save()
        
        # Check if fully received
        all_lines = po.lines.all()
        fully_received = True
        for line in all_lines:
            if line.quantity_received < line.quantity_ordered:
                fully_received = False
                break
        
        if fully_received:
            po.status = 'received'
            po.save()
            
        # Fire signal to notify inventory
        stock_received.send(sender=self.__class__, tenant_id=self.request.user.business_id, items=items)
        
        return Response({"status": po.status})

class PurchaseOrderLineViewSet(PurchaseOrderBaseViewSet):
    queryset = PurchaseOrderLine.objects.all()
    serializer_class = PurchaseOrderLineSerializer
