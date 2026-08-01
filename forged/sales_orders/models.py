import uuid
from django.db import models

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    customer_id = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=50, default='direct')
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"Order {self.id} - {self.status}"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=1.0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.product_id} x {self.quantity}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        total = sum([item.quantity * item.unit_price for item in self.order.items.all()])
        self.order.total = total
        self.order.save()

    def delete(self, *args, **kwargs):
        order = self.order
        super().delete(*args, **kwargs)
        total = sum([item.quantity * item.unit_price for item in order.items.all()])
        order.total = total
        order.save()
