import django.dispatch

# Fired when an invoice is created. Other modules (like inventory) can listen to this and deduct stock.
# Provided arguments:
# - sender: Usually the invoice model or module
# - tenant_id: The Business ID
# - items: A list of dicts: [{'product_id': 'uuid', 'quantity': 10}, ...]
# - customer_id: UUID string (optional)
# - total_amount: float (optional)
invoice_created = django.dispatch.Signal()

# Fired when a product's stock drops below its reorder threshold.
# Provided arguments:
# - sender: Usually the Product instance or Inventory module
# - tenant_id: The Business ID
# - product_id: The UUID of the product
# - current_stock: Float
# - threshold: Float
stock_low = django.dispatch.Signal()

# Fired when a new customer profile is created
# Provided arguments:
# - sender: Usually the CustomerViewSet or module
# - tenant_id: The Business ID
# - customer_id: The UUID of the newly created customer
customer_added = django.dispatch.Signal()

# Fired when an order is created. Billing listens to this to draft an invoice.
order_created = django.dispatch.Signal()

# Fired when an invoice is fully paid.
order_paid = django.dispatch.Signal()

# Fired when a user logs in successfully
user_logged_in = django.dispatch.Signal()

# Fired when a barcode is scanned
product_scanned = django.dispatch.Signal()

# Fired when an appointment is booked
appointment_booked = django.dispatch.Signal()

# Fired when an appointment reminder is due
appointment_reminder_due = django.dispatch.Signal()

# Fired when a purchase order is created
purchase_order_created = django.dispatch.Signal()

# Fired when stock is received from a purchase order
# Provided arguments:
# - tenant_id: The Business ID
# - items: A list of dicts: [{'product_id': 'uuid', 'quantity_received': float}, ...]
stock_received = django.dispatch.Signal()
# Fired when an invoice becomes overdue
invoice_overdue = django.dispatch.Signal()

# Fired when a new permission role is created
role_created = django.dispatch.Signal()

# Fired when a Kitchen Order Ticket is marked as ready
kot_ready = django.dispatch.Signal()

# Fired when a new employee is added to the system
employee_added = django.dispatch.Signal()

# Fired when an employee clocks in or out
attendance_marked = django.dispatch.Signal()

# Fired when a project is completed
project_completed = django.dispatch.Signal()

# Fired when a service package or service is completed
service_completed = django.dispatch.Signal()

# Billing/Invoicing signals
order_confirmed = django.dispatch.Signal()
invoice_created = django.dispatch.Signal()
order_paid = django.dispatch.Signal()
