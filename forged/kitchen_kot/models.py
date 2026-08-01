from django.db import models
import uuid

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class KitchenTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    order_id = models.CharField(max_length=255)
    table_number = models.CharField(max_length=50)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"KOT {self.id} for Table {self.table_number}"

class KitchenTicketItem(models.Model):
    tenant_id = models.CharField(max_length=255)
    ticket = models.ForeignKey(KitchenTicket, on_delete=models.CASCADE, related_name='items')
    product_id = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True, null=True)

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')

    objects = TenantManager()
