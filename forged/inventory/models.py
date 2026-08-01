import uuid
from django.db import models
from forged_auth.models import Business

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
        
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='inventory_categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    objects = TenantManager()

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self) -> str:
        return str(self.name)

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='inventory_products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    sku = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    unit_of_measure = models.CharField(max_length=50, default='unit', help_text="e.g., unit, kg, l")
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0.0)
    reorder_threshold = models.DecimalField(max_digits=12, decimal_places=3, default=0.0)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    objects = TenantManager()

    def __str__(self) -> str:
        return str(self.name)

class StockAdjustment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='inventory_adjustments')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='adjustments')
    
    quantity_adjusted = models.DecimalField(max_digits=12, decimal_places=3)
    reason = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return str(f"{self.product.name} adjusted by {self.quantity_adjusted}")
