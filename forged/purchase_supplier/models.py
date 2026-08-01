import uuid
from django.db import models

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    payment_terms = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return str(self.name)

class SupplierProductMap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='product_mappings')
    product_id = models.CharField(max_length=255) # decoupled from inventory_core
    supplier_product_code = models.CharField(max_length=100, blank=True, null=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    lead_time_days = models.IntegerField(default=0)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.supplier.name} - Product {self.product_id}"

class PurchaseOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('confirmed', 'Confirmed'),
        ('received', 'Received'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    expected_delivery = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"PO {self.id} ({self.status})"

class PurchaseOrderLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    
    product_id = models.CharField(max_length=255) # decoupled from inventory
    quantity_ordered = models.DecimalField(max_digits=12, decimal_places=3, default=1.0)
    quantity_received = models.DecimalField(max_digits=12, decimal_places=3, default=0.0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.product_id} (Ordered: {self.quantity_ordered})"
