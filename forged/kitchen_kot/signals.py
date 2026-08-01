from django.dispatch import receiver
from core.events import order_created
from .models import KitchenTicket, KitchenTicketItem

@receiver(order_created)
def handle_order_created(sender, tenant_id, order_id, table_number, items, **kwargs):
    ticket = KitchenTicket.objects.create(
        tenant_id=tenant_id,
        order_id=order_id,
        table_number=table_number,
        status='pending'
    )
    
    for item in items:
        KitchenTicketItem.objects.create(
            tenant_id=tenant_id,
            ticket=ticket,
            product_id=item['product_id'],
            quantity=item['quantity'],
            notes=item.get('notes', ''),
            status='pending'
        )
