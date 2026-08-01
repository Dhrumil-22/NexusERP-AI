from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import KitchenTicket, KitchenTicketItem
from .serializers import KitchenTicketSerializer, KitchenTicketItemSerializer
from core.events import kot_ready

class KitchenTicketViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = KitchenTicketSerializer

    def get_queryset(self):
        return KitchenTicket.objects.for_tenant(self.request.user.tenant_id).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

    @action(detail=True, methods=['post'])
    def bump_status(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status == 'pending':
            ticket.status = 'preparing'
        elif ticket.status == 'preparing':
            ticket.status = 'ready'
            # Fire event so waitstaff/notifications know
            kot_ready.send(
                sender=self.__class__,
                tenant_id=self.request.user.tenant_id,
                ticket_id=str(ticket.id),
                order_id=ticket.order_id,
                table_number=ticket.table_number,
                items=[{'product_id': i.product_id, 'quantity': i.quantity} for i in ticket.items.all()]
            )
        ticket.save()
        
        # Also sync item statuses for simplicity
        ticket.items.update(status=ticket.status)
        
        return Response({'status': ticket.status})
