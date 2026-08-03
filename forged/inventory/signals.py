from django.core.exceptions import ObjectDoesNotExist
from django.dispatch import receiver
from core.events import invoice_created, stock_low, stock_received, order_confirmed
from .models import Product, StockAdjustment

@receiver(invoice_created)
@receiver(order_confirmed)
def handle_invoice_created(sender, tenant_id, items, **kwargs):
    """
    Listens to invoice creation and deducts stock from inventory.
    items should be a list of dicts: [{'product_id': 'uuid', 'quantity': float}, ...]
    """
    from decimal import Decimal
    for item in items:
        try:
            product = Product.objects.get(id=item['product_id'], tenant_id=tenant_id)
            quantity_deducted = Decimal(str(item['quantity']))
            product.stock_quantity -= quantity_deducted
            product.save()

            StockAdjustment.objects.create(
                tenant_id=tenant_id,
                product=product,
                quantity_adjusted=-quantity_deducted,
                reason="Invoice created"
            )

            old_quantity = product.stock_quantity + quantity_deducted
            
            # Fire stock_low event if threshold met
            if product.stock_quantity <= product.reorder_threshold:
                stock_low.send(
                    sender=Product, 
                    tenant_id=tenant_id, 
                    product_id=product.id, 
                    current_stock=product.stock_quantity, 
                    threshold=product.reorder_threshold
                )
                
            # Create notification if it just hit 0
            if old_quantity > 0 and product.stock_quantity <= 0:
                from notifications.models import Notification
                Notification.objects.create(
                    tenant_id=tenant_id,
                    notification_type='stock_alert',
                    title='Product Out of Stock',
                    message=f'Product "{product.name}" has reached 0 stock.'
                )
        except (ObjectDoesNotExist, Exception):
            pass

@receiver(stock_low)
def handle_stock_low(sender, tenant_id, product_id, current_stock, threshold, **kwargs):
    """
    Placeholder for stock_low event listener within inventory itself 
    (e.g. logging or sending emails). Usually handled by notification module.
    """
    print(f"[Inventory Alert] Product {product_id} is low on stock! Current: {current_stock}, Threshold: {threshold}")

@receiver(stock_received)
def handle_stock_received(sender, tenant_id, items, **kwargs):
    """
    Listens to stock_received from purchase_orders and increments stock.
    items should be a list of dicts: [{'product_id': 'uuid', 'quantity_received': float}, ...]
    """
    for item in items:
        try:
            product = Product.objects.get(id=item['product_id'], tenant_id=tenant_id)
            quantity_added = float(item['quantity_received'])
            if quantity_added <= 0:
                continue

            product.stock_quantity += quantity_added
            product.save()

            StockAdjustment.objects.create(
                tenant_id=tenant_id,
                product=product,
                quantity_adjusted=quantity_added,
                reason="Stock received from purchase order"
            )
        except ObjectDoesNotExist:
            pass
