from django.dispatch import receiver
from core.events import stock_low
from .models import SupplierProductMap, PurchaseOrder, PurchaseOrderLine

@receiver(stock_low)
def handle_stock_low(sender, tenant_id, product_id, current_stock, threshold, **kwargs):
    # Find a supplier for this product
    mapping = SupplierProductMap.objects.filter(tenant_id=tenant_id, product_id=product_id).first()
    if not mapping:
        return
        
    supplier = mapping.supplier
    
    # Check if a draft PO already exists for this supplier to append to
    po = PurchaseOrder.objects.filter(tenant_id=tenant_id, supplier=supplier, status='draft').first()
    if not po:
        po = PurchaseOrder.objects.create(tenant_id=tenant_id, supplier=supplier, status='draft')
        
    # Check if line item already exists
    line = PurchaseOrderLine.objects.filter(tenant_id=tenant_id, purchase_order=po, product_id=product_id).first()
    if not line:
        # Auto suggest ordering enough to get back above threshold (e.g. order 10)
        PurchaseOrderLine.objects.create(
            tenant_id=tenant_id,
            purchase_order=po,
            product_id=product_id,
            quantity_ordered=float(threshold) * 2, # naive reorder amount
            unit_price=mapping.cost_price
        )
