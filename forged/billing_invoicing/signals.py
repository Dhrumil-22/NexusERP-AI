from django.dispatch import receiver
from core.events import order_created
from .models import Invoice, InvoiceLine

@receiver(order_created)
def handle_order_created(sender, tenant_id, order_id, customer_id, items, subtotal, **kwargs):
    """
    Listens to order creation from the sales module to automatically draft an invoice.
    items: [{'product_id': 'uuid', 'quantity': 5, 'unit_price': 10}, ...]
    """
    invoice = Invoice.objects.create(
        tenant_id=tenant_id,
        customer_id=customer_id,
        status='Draft',
        subtotal=subtotal,
        total=subtotal # without tax/discount initially
    )
    
    for item in items:
        InvoiceLine.objects.create(
            tenant_id=tenant_id,
            invoice=invoice,
            product_id=item.get('product_id'),
            description=item.get('description', 'Order item'),
            quantity=item.get('quantity', 1),
            unit_price=item.get('unit_price', 0),
            line_total=float(item.get('quantity', 1)) * float(item.get('unit_price', 0))
        )
