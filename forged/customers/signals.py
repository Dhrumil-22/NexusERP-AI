from django.dispatch import receiver
from core.events import invoice_created
from .models import Customer, CustomerNote

@receiver(invoice_created)
def handle_invoice_created(sender, tenant_id, items, **kwargs):
    """
    Listens to invoice creation and optionally adds loyalty points.
    We assume sender or kwargs might have customer_id or total_amount.
    For demonstration, we check if customer_id and total amount are passed.
    """
    customer_id = kwargs.get('customer_id')
    total_amount = kwargs.get('total_amount', 0)
    
    if customer_id and total_amount > 0:
        try:
            customer = Customer.objects.get(id=customer_id, tenant_id=tenant_id)
            # Example rule: 1 point per $10 spent
            points_earned = int(float(total_amount) / 10)
            if points_earned > 0:
                customer.loyalty_points += points_earned
                customer.save()
                
                CustomerNote.objects.create(
                    tenant_id=tenant_id,
                    customer=customer,
                    note=f"Earned {points_earned} loyalty points from invoice."
                )
        except Customer.DoesNotExist:
            pass
