from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from forged_permissions.permissions import HasModulePermission
from django.utils import timezone
from .models import AvailabilitySlot, Appointment
from .serializers import AvailabilitySlotSerializer, AppointmentSerializer

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "booking_scheduler"
    required_permission = "manage_bookings"

    serializer_class = AvailabilitySlotSerializer

    def get_queryset(self):
        return AvailabilitySlot.objects.for_tenant(self.request.user.business_id)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "booking_scheduler"
    required_permission = "manage_bookings"

    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.for_tenant(self.request.user.business_id)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

    @action(detail=False, methods=['post'])
    def book(self, request):
        slot_id = request.data.get('slot_id')
        customer_id = request.data.get('customer_id')
        customer_name = request.data.get('customer_name', '')
        
        if not slot_id or not customer_id:
            return Response({"error": "slot_id and customer_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            slot = AvailabilitySlot.objects.get(
                id=slot_id, 
                tenant=request.user.business,
                is_booked=False
            )
            
            # Create the appointment
            appointment = Appointment.objects.create(
                tenant=request.user.business,
                customer_id=customer_id,
                customer_name=customer_name,
                employee_id=slot.employee_id,
                employee_name=slot.employee_name,
                slot=slot,
                date=slot.date,
                start_time=slot.start_time,
                end_time=slot.end_time,
                status='Scheduled',
                notes=request.data.get('notes', '')
            )
            
            # Mark slot as booked
            slot.is_booked = True
            slot.save()
            
            # Fire event
            from core.events import appointment_booked
            appointment_booked.send(
                sender=self.__class__,
                tenant_id=request.user.business_id,
                appointment_id=appointment.id,
                customer_id=customer_id,
                employee_id=slot.employee_id
            )
            
            serializer = self.get_serializer(appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ObjectDoesNotExist:
            return Response({"error": "Slot not found or already booked"}, status=status.HTTP_404_NOT_FOUND)
