from django.db import models
class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Role(models.Model):
    tenant_id = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.name} ({self.tenant_id})"

class Permission(models.Model):
    # This is a global dictionary of available permissions, no tenant_id needed
    module_id = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __str__(self) -> str:
        return f"{self.module_id}.{self.codename}"

class RolePermission(models.Model):
    tenant_id = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    is_allowed = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        unique_together = ('tenant_id', 'role', 'permission')

    def __str__(self) -> str:
        return f"{self.role.name} -> {self.permission.codename}: {self.is_allowed}"

class EmployeeOverride(models.Model):
    tenant_id = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=255) # Linking by string to keep loose coupling
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    is_allowed = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        unique_together = ('tenant_id', 'employee_id', 'permission')

    def __str__(self) -> str:
        return f"{self.employee_id} -> {self.permission.codename}: {self.is_allowed}"
