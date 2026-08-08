from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from forged_permissions.permissions import HasModulePermission
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer
from employee_hr.models import Employee
from notifications.models import Notification

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "attendance"

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.required_permission = 'view_attendance'
        else:
            self.required_permission = 'edit_attendance'
        return super().get_permissions()

    def get_queryset(self):
        return AttendanceRecord.objects.for_tenant(self.request.user.business_id)

    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.business)

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        employee_id = request.data.get('employee_id')
        employee_name = request.data.get('employee_name', '')
        date = request.data.get('date', timezone.now().date())
        
        if not employee_id:
            return Response({"error": "employee_id required"}, status=status.HTTP_400_BAD_REQUEST)
            
        record, created = AttendanceRecord.objects.get_or_create(
            tenant=request.user.business,
            employee_id=employee_id,
            date=date,
            defaults={
                'employee_name': employee_name,
                'status': 'Present'
            }
        )

        now = timezone.now()
        is_late = False

        if not record.clock_in:
            record.clock_in = now
            try:
                emp = Employee.objects.get(id=employee_id)
                local_now_time = timezone.localtime(now).time()
                if emp.shift_start_time and local_now_time > emp.shift_start_time:
                    record.status = 'Late'
                    is_late = True
            except ObjectDoesNotExist:
                pass
            record.save()
            
            if is_late:
                Notification.objects.create(
                    tenant_id=request.user.business_id,
                    notification_type='attendance_alert',
                    title='Late Arrival',
                    message=f'{employee_name} clocked in late at {now.strftime("%H:%M")}.'
                )
        

        serializer = self.get_serializer(record)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        employee_id = request.data.get('employee_id')
        date = request.data.get('date', timezone.now().date())
        
        if not employee_id:
            return Response({"error": "employee_id required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            record = AttendanceRecord.objects.get(
                tenant=request.user.business,
                employee_id=employee_id,
                date=date
            )
            record.clock_out = timezone.now()
            record.save()
            serializer = self.get_serializer(record)
            return Response(serializer.data)
        except ObjectDoesNotExist:
            return Response({"error": "No clock-in record found for today."}, status=status.HTTP_404_NOT_FOUND)
