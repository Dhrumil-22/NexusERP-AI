from django.db import models
import uuid

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Table(models.Model):
    tenant_id = models.CharField(max_length=255)
    table_number = models.CharField(max_length=50)
    capacity = models.IntegerField(default=4)
    is_occupied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"Table {self.table_number}"

class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.CharField(max_length=255)
    customer_id = models.CharField(max_length=255, blank=True, null=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='orders')
    
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('served', 'Served'),
        ('paid', 'Paid'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='open')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"Order {self.id} (Table {self.table.table_number})"

class OrderItem(models.Model):
    tenant_id = models.CharField(max_length=255)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.CharField(max_length=255) # Refers to inventory product
    quantity = models.IntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True, null=True)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')

    objects = TenantManager()
