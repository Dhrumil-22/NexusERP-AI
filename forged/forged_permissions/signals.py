from django.dispatch import receiver
from core.events import role_created
from .models import Role, Permission, RolePermission

@receiver(role_created)
def handle_role_created(sender, tenant_id, role_name, default_permissions=None, **kwargs):
    # Retrieve or create the role
    role, created = Role.objects.get_or_create(
        tenant_id=tenant_id,
        name=role_name,
        defaults={'description': 'Auto-created role via signal'}
    )
    
    # If a list of codenames was provided, grant them to the new role
    if default_permissions:
        for codename in default_permissions:
            perm = Permission.objects.filter(codename=codename).first()
            if perm:
                RolePermission.objects.get_or_create(
                    tenant_id=tenant_id,
                    role=role,
                    permission=perm,
                    defaults={'is_allowed': True}
                )
