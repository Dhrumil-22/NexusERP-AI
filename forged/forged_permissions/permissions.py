from rest_framework.permissions import BasePermission
from forged_permissions.models import Role, RolePermission, EmployeeOverride

class HasModulePermission(BasePermission):
    """
    Checks:
    1. Is the module enabled for the user's business?
    2. Does the user have a specific EmployeeOverride for this permission?
    3. If not, does the user's Role have this permission allowed?
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        required_module = getattr(view, 'required_module', None)
        required_permission = getattr(view, 'required_permission', None)

        if not required_module or not required_permission:
            return False

        business = request.user.business
        if not business:
            return False
            
        from module_registry.models import TenantModule
        if not TenantModule.objects.filter(tenant_id=business.business_id, module_id=required_module, is_enabled=True).exists():
            return False

        # Admin super-access
        user_role = request.user.role
        if user_role.lower() == 'admin':
            return True

        tenant_id = request.user.tenant_id
        employee_id = str(request.user.id) # Depending on how employee maps to auth user

        # 1. Check Employee Overrides
        override = EmployeeOverride.objects.filter(
            tenant_id=tenant_id,
            employee_id=employee_id,
            permission__codename=required_permission
        ).first()

        if override:
            return override.is_allowed

        # 2. Check Role Permissions
        # We assume the user's role string matches a Role name in this tenant
        role_obj = Role.objects.filter(tenant_id=tenant_id, name__iexact=user_role).first()
        if not role_obj:
            # Fallback: if they have the module assigned in their user profile, grant access
            if hasattr(request.user, 'assigned_modules') and required_module in request.user.assigned_modules:
                return True
            return False

        role_perm = RolePermission.objects.filter(
            tenant_id=tenant_id,
            role=role_obj,
            permission__codename=required_permission
        ).first()

        if role_perm:
            return role_perm.is_allowed

        # Fallback even if role exists but permission is not explicitly defined
        if hasattr(request.user, 'assigned_modules') and required_module in request.user.assigned_modules:
            return True

        return False
