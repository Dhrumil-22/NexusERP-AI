from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Invoice, InvoiceLine, Payment
from .serializers import InvoiceSerializer, InvoiceLineSerializer, PaymentSerializer
from core.events import invoice_created, order_paid
import decimal

class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return Invoice.objects.for_tenant(self.request.user.tenant_id).order_by('-created_at')

    def perform_create(self, serializer):
        invoice = serializer.save(tenant_id=self.request.user.tenant_id)
        # Send invoice created event
        invoice_created.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            invoice_id=str(invoice.id)
        )

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'paid':
            return Response({'error': 'Invoice is already paid'}, status=status.HTTP_400_BAD_REQUEST)
            
        invoice.status = 'paid'
        invoice.save()
        
        # Fire order_paid event
        if invoice.sales_order_id:
            order_paid.send(
                sender=self.__class__,
                tenant_id=self.request.user.tenant_id,
                order_id=invoice.sales_order_id
            )
            
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        invoice = self.get_object()
        
        if not invoice.customer_id:
            return Response({'error': 'No customer associated with this invoice'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from django.core.mail import EmailMultiAlternatives
            from django.conf import settings
            from customers.models import Customer
            
            customer = Customer.objects.for_tenant(invoice.tenant_id).filter(id=invoice.customer_id).first()
            if customer and customer.email:
                business_name = request.user.business.name
                sender_email = request.user.email or settings.DEFAULT_FROM_EMAIL
                subject = f"Invoice {invoice.id} from {business_name}"
                
                # Plain text version
                text_content = f"Hello {customer.first_name},\n\nHere is your invoice/receipt for your recent visit.\n\n"
                html_content = f"<h3>Hello {customer.first_name},</h3><p>Here is your invoice/receipt for your recent visit.</p><table style='width:100%; border-collapse: collapse; margin-bottom: 20px;'><tr style='border-bottom: 2px solid #ddd; text-align: left;'><th>Item</th><th>Qty</th><th>Price</th></tr>"
                
                for line in invoice.lines.all():
                    text_content += f"- {line.quantity}x {line.description} @ ₹{line.unit_price:.2f} each\n"
                    html_content += f"<tr style='border-bottom: 1px solid #eee;'><td>{line.description}</td><td>{line.quantity}</td><td>₹{line.unit_price:.2f}</td></tr>"
                    
                text_content += f"\nSubtotal: ₹{invoice.subtotal:.2f}\n"
                text_content += f"Total: ₹{invoice.total:.2f}\n"
                text_content += f"Status: {invoice.status.capitalize()}\n"
                text_content += f"\nThank you for your business!\n"
                
                html_content += f"</table><p><b>Subtotal:</b> ₹{invoice.subtotal:.2f}</p>"
                html_content += f"<p><b>Total:</b> <span style='font-size: 18px; color: #3b82f6;'>₹{invoice.total:.2f}</span></p>"
                html_content += f"<p><b>Status:</b> {invoice.status.capitalize()}</p>"
                html_content += f"<br><p>Thank you for choosing <b>{business_name}</b>!</p>"
                
                from_header = f"{business_name} <{settings.DEFAULT_FROM_EMAIL}>"
                msg = EmailMultiAlternatives(
                    subject,
                    text_content,
                    from_header,
                    [customer.email],
                    reply_to=[sender_email]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send(fail_silently=False)
                
                return Response({'status': 'email sent'})
            else:
                return Response({'error': 'Customer has no email address on file.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class InvoiceLineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceLineSerializer

    def get_queryset(self):
        return InvoiceLine.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        payment = serializer.save(tenant_id=self.request.user.tenant_id)
        
        # Check if invoice is fully paid
        invoice = payment.invoice
        total_paid = sum(p.amount for p in invoice.payments.all())
        if total_paid >= invoice.total:
            invoice.status = 'paid'
            invoice.save()
            if invoice.sales_order_id:
                order_paid.send(
                    sender=self.__class__,
                    tenant_id=self.request.user.tenant_id,
                    order_id=invoice.sales_order_id
                )
