from rest_framework import serializers
from .models import Role, Permission, RolePermission, EmployeeOverride

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'created_at']

class RolePermissionSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(read_only=True)
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), source='permission', write_only=True
    )
    
    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'permission', 'permission_id', 'is_allowed']

class EmployeeOverrideSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(read_only=True)
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), source='permission', write_only=True
    )

    class Meta:
        model = EmployeeOverride
        fields = ['id', 'employee_id', 'permission', 'permission_id', 'is_allowed']
