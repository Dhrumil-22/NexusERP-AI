from django.db import models
class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Notification(models.Model):
    tenant_id = models.CharField(max_length=255)
    recipient_id = models.CharField(max_length=255, null=True, blank=True) # If null, broadcast to all tenant admins
    notification_type = models.CharField(max_length=50) # 'stock_alert', 'reminder', 'invoice'
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_object_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"[{self.notification_type}] {self.title}"
