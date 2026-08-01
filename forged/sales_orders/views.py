from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from core.events import order_confirmed

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.for_tenant(self.request.user.tenant_id).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        from django.db import transaction
        
        with transaction.atomic():
            order = self.get_object()
            if order.status != 'draft':
                return Response({'error': 'Order must be in draft status to confirm'}, status=status.HTTP_400_BAD_REQUEST)
                
            order.status = 'confirmed'
            order.save()
            
            items = [{'product_id': item.product_id, 'quantity': float(item.quantity), 'unit_price': float(item.unit_price)} for item in order.items.all()]
            order_confirmed.send(
                sender=self.__class__,
                tenant_id=self.request.user.tenant_id,
                order_id=str(order.id),
                customer_id=order.customer_id,
                total=float(order.total),
                source=order.source,
                items=items
            )
            
        return Response(OrderSerializer(order).data)

class OrderItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderItemSerializer

    def get_queryset(self):
        return OrderItem.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
