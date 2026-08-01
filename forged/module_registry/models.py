from django.db import models
import uuid

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class ModuleDefinition(models.Model):
    module_id = models.CharField(max_length=255, primary_key=True)
    version = models.CharField(max_length=50)
    manifest_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def register_manifest(cls, manifest_dict):
        module_id = manifest_dict.get('module_id')
        obj, created = cls.objects.update_or_create(
            module_id=module_id,
            defaults={
                'version': manifest_dict.get('version', '1.0'),
                'manifest_json': manifest_dict
            }
        )
        return obj

    def __str__(self) -> str:
        return str(self.module_id)

class TenantModule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    module_id = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True)
    
    objects = TenantManager()

    class Meta:
        unique_together = ('tenant_id', 'module_id')

    def __str__(self) -> str:
        return f"{self.tenant_id} - {self.module_id} ({'Enabled' if self.is_enabled else 'Disabled'})"
