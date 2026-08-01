from django.dispatch import receiver
from core.events import order_confirmed
from .models import Invoice, InvoiceLine
from inventory.models import Product

@receiver(order_confirmed)
def draft_invoice_for_order(sender, tenant_id, order_id, customer_id=None, total=0.0, items=None, source='direct', **kwargs):
    # Auto draft an invoice when an order is confirmed
    doc_type = 'bill' if source == 'table' else 'invoice'
    invoice = Invoice.objects.create(
        tenant_id=tenant_id,
        sales_order_id=order_id,
        customer_id=customer_id,
        subtotal=total,
        total=total,
        status='draft',
        document_type=doc_type
    )
    
    if items:
        for item in items:
            product_id = item.get('product_id')
            quantity = float(item.get('quantity', 1.0))
            unit_price = float(item.get('unit_price', 0.0))
            try:
                prod = Product.objects.get(id=product_id, tenant_id=tenant_id)
                product_name = prod.name
            except Exception:
                product_name = f"Product {product_id}"
                
            InvoiceLine.objects.create(
                tenant_id=tenant_id,
                invoice=invoice,
                description=product_name,
                quantity=quantity,
                unit_price=unit_price
            )
