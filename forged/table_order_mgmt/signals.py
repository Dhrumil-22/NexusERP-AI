from django.dispatch import receiver
from core.events import kot_ready
from .models import Order

@receiver(kot_ready)
def handle_kot_ready(sender, tenant_id, ticket_id, order_id, table_number, items=None, **kwargs):
    try:
        order = Order.objects.for_tenant(tenant_id).get(id=order_id)
        if items:
            for kot_item in items:
                # Find exactly ONE matching order item that is 'preparing'
                match = order.items.filter(
                    product_id=kot_item['product_id'], 
                    quantity=kot_item['quantity'], 
                    status='preparing'
                ).first()
                if match:
                    match.status = 'ready'
                    match.save()
        else:
            # Fallback for old KOTs
            order_items = order.items.filter(status='preparing')
            for item in order_items:
                item.status = 'ready'
                item.save()
    except Order.DoesNotExist:
        pass
