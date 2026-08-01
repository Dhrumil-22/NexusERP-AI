from django.dispatch import receiver
from core.events import stock_low
from .models import PurchaseOrder, PurchaseOrderLine

@receiver(stock_low)
def handle_stock_low(sender, tenant_id, product_id, current_stock, threshold, **kwargs):
    """
    Listens to stock_low from inventory.
    If stock is low, auto-suggests a Purchase Order (creates a draft).
    Ideally it looks up the supplier for the product, but without a direct
    product->supplier map, we might assign it to a default supplier or leave supplier_id blank.
    """
    # Create a draft purchase order for the tenant
    po = PurchaseOrder.objects.create(
        tenant_id=tenant_id,
        supplier_id="pending_assignment", # Needs manual assignment if product lacks supplier link
        status="draft"
    )
    
    # Calculate order amount based on threshold, for instance: order enough to reach 2x threshold
    order_qty = max(1.0, (float(threshold) * 2) - float(current_stock))
    
    PurchaseOrderLine.objects.create(
        tenant_id=tenant_id,
        purchase_order=po,
        product_id=product_id,
        quantity_ordered=order_qty,
        quantity_received=0.0
    )
    print(f"[Purchase Orders] Auto-drafted PO {po.id} for low stock product {product_id}")
