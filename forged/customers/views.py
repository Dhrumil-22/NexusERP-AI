from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from forged_permissions.permissions import HasModulePermission
from .models import Customer, CustomerNote
from .serializers import CustomerSerializer, CustomerNoteSerializer

class CustomersBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "customers"

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.required_permission = 'view_customers'
        else:
            self.required_permission = 'edit_customers'
        return super().get_permissions()

    def get_queryset(self):
        return self.queryset.model.objects.for_tenant(self.request.user.business_id)  # type: ignore

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

class CustomerViewSet(CustomersBaseViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def perform_create(self, serializer):
        instance = serializer.save(tenant=self.request.user.business)
        # Fire customer_added signal
        from core.events import customer_added
        customer_added.send(sender=self.__class__, tenant_id=self.request.user.business_id, customer_id=instance.id)

    @action(detail=True, methods=['post'])
    def add_points(self, request, pk=None):
        customer = self.get_object()
        points = request.data.get('points', 0)
        try:
            points = int(points)
            customer.loyalty_points += points
            customer.save()
            return Response({"status": "points added", "loyalty_points": customer.loyalty_points})
        except ValueError:
            return Response({"error": "Invalid points."}, status=status.HTTP_400_BAD_REQUEST)

class CustomerNoteViewSet(CustomersBaseViewSet):
    queryset = CustomerNote.objects.all()
    serializer_class = CustomerNoteSerializer
