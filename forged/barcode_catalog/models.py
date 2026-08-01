import uuid
from django.db import models
from forged_auth.models import Business

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
        
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class StoreLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='store_locations')
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return str(self.name)

class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='product_variants')
    
    # Decoupled link to Core Inventory Product
    product_id = models.CharField(max_length=255, help_text="ID of the parent product in Inventory")
    product_name = models.CharField(max_length=255, blank=True, help_text="Cached name for easy display")
    
    store = models.ForeignKey(StoreLocation, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0.0)
    
    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.product_name} - {self.size}/{self.color} at {self.store.name}"

class Barcode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='barcodes')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='barcodes')
    barcode_value = models.CharField(max_length=255, unique=True)
    
    objects = TenantManager()

    def __str__(self) -> str:
        return str(self.barcode_value)
