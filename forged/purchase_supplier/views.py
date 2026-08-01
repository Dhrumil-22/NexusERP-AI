from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supplier, SupplierProductMap, PurchaseOrder, PurchaseOrderLine
from .serializers import SupplierSerializer, SupplierProductMapSerializer, PurchaseOrderSerializer, PurchaseOrderLineSerializer
from core.events import purchase_order_created, stock_received

class SupplierViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierSerializer

    def get_queryset(self):
        return Supplier.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

class SupplierProductMapViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierProductMapSerializer

    def get_queryset(self):
        return SupplierProductMap.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PurchaseOrderSerializer

    def get_queryset(self):
        return PurchaseOrder.objects.for_tenant(self.request.user.tenant_id).order_by('-created_at')

    def perform_create(self, serializer):
        po = serializer.save(tenant_id=self.request.user.tenant_id)
        purchase_order_created.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            po_id=str(po.id)
        )

    @action(detail=True, methods=['post'])
    def mark_received(self, request, pk=None):
        po = self.get_object()
        if po.status == 'received':
            return Response({'error': 'Already received'}, status=status.HTTP_400_BAD_REQUEST)
            
        po.status = 'received'
        po.save()
        
        # Fire stock_received event for inventory to catch
        items = []
        for line in po.lines.all():
            line.quantity_received = line.quantity_ordered
            line.save()
            items.append({
                'product_id': line.product_id,
                'quantity_received': float(line.quantity_received)
            })
            
        if items:
            stock_received.send(
                sender=self.__class__,
                tenant_id=self.request.user.tenant_id,
                items=items
            )
            
        return Response(PurchaseOrderSerializer(po).data)

class PurchaseOrderLineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PurchaseOrderLineSerializer

    def get_queryset(self):
        return PurchaseOrderLine.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
