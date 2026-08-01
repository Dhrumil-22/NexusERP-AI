from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from forged_permissions.permissions import HasModulePermission
from django.db import transaction
from decimal import Decimal
from .models import Invoice, InvoiceLine, Payment
from .serializers import InvoiceSerializer, PaymentSerializer

class BillingBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = "billing"

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.required_permission = 'view_billing'
        else:
            self.required_permission = 'edit_billing'
        return super().get_permissions()

    def get_queryset(self):
        return self.queryset.model.objects.for_tenant(self.request.user.business_id)  # type: ignore

class InvoiceViewSet(BillingBaseViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):  # type: ignore
        data = request.data
        lines_data = data.pop('lines', [])
        
        # Calculate totals
        subtotal = Decimal('0.00')
        for line in lines_data:
            qty = Decimal(str(line.get('quantity', 1)))
            price = Decimal(str(line.get('unit_price', 0)))
            subtotal += (qty * price)
            
        tax_rate = Decimal(str(data.get('tax_rate', 0)))
        discount = Decimal(str(data.get('discount', 0)))
        
        tax_amount = (subtotal - discount) * (tax_rate / Decimal('100.0'))
        total = subtotal - discount + tax_amount

        invoice = Invoice.objects.create(
            tenant=request.user.business,
            customer_id=data.get('customer'),
            invoice_number=data.get('invoice_number', ''),
            status='Unpaid',
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount=discount,
            total=total,
            due_date=data.get('due_date')
        )

        # Create lines
        line_items_for_signal = []
        for line in lines_data:
            qty = Decimal(str(line.get('quantity', 1)))
            price = Decimal(str(line.get('unit_price', 0)))
            line_total = qty * price
            
            InvoiceLine.objects.create(
                tenant=request.user.business,
                invoice=invoice,
                product_id=line.get('product'),
                description=line.get('description', ''),
                quantity=qty,
                unit_price=price,
                line_total=line_total
            )
            if line.get('product'):
                line_items_for_signal.append({
                    'product_id': line.get('product'),
                    'quantity': float(qty)
                })

        # Fire signal
        from core.events import invoice_created
        invoice_created.send(
            sender=self.__class__, 
            tenant_id=request.user.business_id, 
            items=line_items_for_signal,
            customer_id=invoice.customer_id,
            total_amount=float(invoice.total)
        )

        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        amount = Decimal(str(request.data.get('amount', 0)))
        mode = request.data.get('mode', 'Cash')
        transaction_id = request.data.get('transaction_id', '')

        if amount <= 0:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():  # type: ignore
            payment = Payment.objects.create(
                tenant=request.user.business,
                invoice=invoice,
                amount=amount,
                mode=mode,
                transaction_id=transaction_id
            )
            
            # Check if fully paid
            total_paid = sum(p.amount for p in invoice.payments.all())
            if total_paid >= invoice.total:
                invoice.status = 'Paid'
                invoice.save()
                
                from core.events import order_paid
                order_paid.send(
                    sender=self.__class__,
                    tenant_id=request.user.business_id,
                    invoice_id=invoice.id
                )

        return Response({"status": "payment recorded", "invoice_status": invoice.status})

class PaymentViewSet(BillingBaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
