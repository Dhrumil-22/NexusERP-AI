from rest_framework import serializers
from .models import Role, Employee, Shift, Attendance

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['tenant_id']

class EmployeeSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    # Fields for creating/updating the User account alongside the Employee
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    assigned_modules = serializers.JSONField(required=False, default=list)
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['tenant_id']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        from forged_auth.models import User
        user = User.objects.filter(email=instance.email).first()
        if user:
            ret['username'] = user.username
            ret['assigned_modules'] = user.assigned_modules
        else:
            ret['username'] = None
            ret['assigned_modules'] = []
        return ret

class ShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ['tenant_id']

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['tenant_id']
        
    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
