from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Role, Employee, Shift, Attendance
from .serializers import RoleSerializer, EmployeeSerializer, ShiftSerializer, AttendanceSerializer
from core.events import employee_added, attendance_marked

class RoleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RoleSerializer

    def get_queryset(self):
        return Role.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        username = serializer.validated_data.pop('username', None)
        password = serializer.validated_data.pop('password', None)
        assigned_modules = serializer.validated_data.pop('assigned_modules', [])
        
        if username:
            from forged_auth.models import User
            if User.objects.filter(username=username).exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'username': 'This username is already taken.'})
        
        employee = serializer.save(tenant_id=self.request.user.tenant_id)
        
        if username and password:
            from forged_auth.models import User, Business
            business = Business.objects.get(business_id=self.request.user.tenant_id)
            User.objects.create_user(
                username=username,
                password=password,
                email=employee.email,
                first_name=employee.first_name,
                last_name=employee.last_name,
                business=business,
                role='Staff',
                assigned_modules=assigned_modules
            )
            
        employee_added.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            employee_id=str(employee.id)
        )

    def perform_update(self, serializer):
        username = serializer.validated_data.pop('username', None)
        password = serializer.validated_data.pop('password', None)
        assigned_modules = serializer.validated_data.pop('assigned_modules', None)
        
        from forged_auth.models import User, Business
        
        if username:
            existing_user = User.objects.filter(username=username).first()
            # If the username exists and it does not belong to this employee, raise error
            if existing_user and existing_user.email != serializer.instance.email:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'username': 'This username is already taken.'})
        
        employee = serializer.save()
        
        user = User.objects.filter(email=employee.email).first()
        if user:
            needs_save = False
            if assigned_modules is not None:
                user.assigned_modules = assigned_modules
                needs_save = True
            if username:
                user.username = username
                needs_save = True
            if password:
                user.set_password(password)
                needs_save = True
            if needs_save:
                user.save()
        elif username and password:
            business = Business.objects.get(business_id=self.request.user.tenant_id)
            User.objects.create_user(
                username=username,
                password=password,
                email=employee.email,
                first_name=employee.first_name,
                last_name=employee.last_name,
                business=business,
                role='Staff',
                assigned_modules=assigned_modules or []
            )

class ShiftViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ShiftSerializer

    def get_queryset(self):
        return Shift.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

class AttendanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        return Attendance.objects.for_tenant(self.request.user.tenant_id).order_by('-date')

    def perform_create(self, serializer):
        attendance = serializer.save(tenant_id=self.request.user.tenant_id)
        attendance_marked.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            employee_id=str(attendance.employee.id),
            date=attendance.date
        )

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        employee_id = request.data.get('employee') or request.data.get('employee_id')
        if not employee_id:
            return Response({'error': 'employee id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        attendance, created = Attendance.objects.get_or_create(
            tenant_id=self.request.user.tenant_id,
            employee_id=employee_id,
            date=timezone.now().date(),
            defaults={'clock_in': timezone.now()}
        )
        if not created and not attendance.clock_in:
            attendance.clock_in = timezone.now()
            attendance.save()
            
        attendance_marked.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            employee_id=str(employee_id),
            date=attendance.date
        )
        return Response(AttendanceSerializer(attendance).data)

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        employee_id = request.data.get('employee') or request.data.get('employee_id')
        if not employee_id:
            return Response({'error': 'employee id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            attendance = Attendance.objects.get(
                tenant_id=self.request.user.tenant_id,
                employee_id=employee_id,
                date=timezone.now().date()
            )
            attendance.clock_out = timezone.now()
            attendance.save()
            
            attendance_marked.send(
                sender=self.__class__,
                tenant_id=self.request.user.tenant_id,
                employee_id=str(employee_id),
                date=attendance.date
            )
            return Response(AttendanceSerializer(attendance).data)
        except ObjectDoesNotExist:
            return Response({'error': 'No clock-in record found for today'}, status=status.HTTP_404_NOT_FOUND)
