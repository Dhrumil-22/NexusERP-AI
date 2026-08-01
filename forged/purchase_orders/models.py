import uuid
from django.db import models
from forged_auth.models import Business

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
        
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class PurchaseOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='purchase_orders')
    
    # Decoupled from suppliers module
    supplier_id = models.CharField(max_length=255)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('confirmed', 'Confirmed'),
        ('received', 'Received'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"PO {self.id} ({self.status})"

class PurchaseOrderLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='purchase_order_lines')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    
    # Decoupled from inventory module
    product_id = models.CharField(max_length=255)
    
    quantity_ordered = models.DecimalField(max_digits=12, decimal_places=3, default=1.0)
    quantity_received = models.DecimalField(max_digits=12, decimal_places=3, default=0.0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.product_id} (Ordered: {self.quantity_ordered}, Received: {self.quantity_received})"
