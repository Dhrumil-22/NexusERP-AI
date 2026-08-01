from django.dispatch import receiver
from core.events import stock_low, appointment_reminder_due, invoice_overdue, user_logged_in, customer_added, invoice_created, employee_added
from .models import Notification

@receiver(stock_low)
def handle_stock_low(sender, tenant_id, product_id, product_name=None, **kwargs):
    if not product_name:
        try:
            from inventory.models import Product
            # Fallback for tenant querying if tenant_id is used as direct string
            prod = Product.objects.filter(id=product_id).first()
            product_name = prod.name if prod else f"Product {product_id}"
        except Exception:
            product_name = f"Product {product_id}"

    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='stock_alert',
        title='Low Stock Alert',
        message=f'Product "{product_name}" is running low on stock.',
        related_object_id=product_id
    )

@receiver(appointment_reminder_due)
def handle_appointment_reminder(sender, tenant_id, appointment_id, details, **kwargs):
    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='reminder',
        title='Upcoming Appointment',
        message=f'Reminder: {details}',
        related_object_id=appointment_id
    )

@receiver(invoice_overdue)
def handle_invoice_overdue(sender, tenant_id, invoice_id, amount, **kwargs):
    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='invoice',
        title='Overdue Invoice',
        message=f'Invoice {invoice_id} for amount {amount} is overdue.',
        related_object_id=invoice_id
    )

@receiver(user_logged_in)
def handle_user_logged_in(sender, tenant_id, user_id, **kwargs):
    if not tenant_id: return
    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='security',
        title='New Login',
        message=f'User logged in to the system.',
        related_object_id=str(user_id)
    )

@receiver(customer_added)
def handle_customer_added(sender, tenant_id, customer_id, **kwargs):
    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='customer',
        title='New Customer Added',
        message=f'A new customer profile was created.',
        related_object_id=str(customer_id)
    )

@receiver(invoice_created)
def handle_invoice_created(sender, tenant_id, items, **kwargs):
    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='invoice',
        title='New Invoice Generated',
        message=f'An invoice was successfully created.',
    )

@receiver(employee_added)
def handle_employee_added(sender, tenant_id, **kwargs):
    Notification.objects.create(
        tenant_id=tenant_id,
        notification_type='system',
        title='Employee Onboarded',
        message=f'A new employee account was created.',
    )
