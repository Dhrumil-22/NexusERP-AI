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
            
            target_email = request.data.get('email')
            if not target_email and customer:
                target_email = customer.email
                
            if target_email:
                business_name = request.user.business.name if getattr(request.user, 'business', None) else "Nexus ERP"
                custom_from = request.data.get('from_email')
                sender_email = custom_from or request.user.email or settings.DEFAULT_FROM_EMAIL
                subject = f"Invoice {invoice.id} from {business_name}"
                
                customer_name = customer.first_name if customer else "Customer"
                
                is_bill = getattr(invoice, 'document_type', 'invoice') == 'bill'
                doc_title = "Bill Receipt" if is_bill else "Tax Invoice"
                subject = f"{doc_title} #{str(invoice.id)[:8].upper()} from {business_name}"
                
                customer_name = customer.first_name if (customer and getattr(customer, 'first_name', None)) else (customer.name if (customer and getattr(customer, 'name', None)) else "Valued Customer")
                
                # Plain Text Email Version
                text_content = f"Dear {customer_name},\n\n"
                text_content += f"Thank you for choosing {business_name}! It was a pleasure serving you.\n"
                text_content += f"We hope you had a great experience and look forward to welcoming you back again soon!\n\n"
                text_content += f"--- {doc_title.upper()} SUMMARY ---\n"
                text_content += f"Document #: {str(invoice.id)[:8].upper()}\n"
                text_content += f"Date: {invoice.created_at.strftime('%d-%m-%Y') if hasattr(invoice, 'created_at') else ''}\n"
                text_content += f"Status: {invoice.status.upper()}\n\n"
                
                for line in invoice.lines.all():
                    text_content += f"- {line.quantity}x {line.description} @ ₹{line.unit_price:.2f} = ₹{(line.quantity * line.unit_price):.2f}\n"
                    
                text_content += f"\nTotal Amount: ₹{invoice.total:.2f}\n\n"
                text_content += f"Your official PDF receipt is attached to this email.\n\n"
                text_content += f"Warm regards,\n{business_name} Team\n"
                
                # HTML Email Version (Sleek SaaS Card Design)
                lines_table_rows = ""
                for line in invoice.lines.all():
                    line_total = line.quantity * line.unit_price
                    lines_table_rows += f"""
                    <tr>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151;">{line.description}</td>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #4b5563;">{line.quantity}</td>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">₹{line.unit_price:.2f}</td>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827;">₹{line_total:.2f}</td>
                    </tr>
                    """
                
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }}
                    .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }}
                    .header {{ background: #15803d; color: #ffffff; padding: 24px 32px; text-align: left; }}
                    .body {{ padding: 32px; }}
                    .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }}
                    .th {{ background-color: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
                    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; text-transform: uppercase; }}
                    .total-box {{ background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin-top: 20px; border: 1px solid #f1f5f9; }}
                    .footer {{ padding: 24px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 13px; line-height: 1.5; }}
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h2 style="margin: 0; font-size: 22px; font-weight: 700;">{business_name}</h2>
                      <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Receipt #{str(invoice.id)[:8].upper()}</p>
                    </div>
                    
                    <div class="body">
                      <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Hello {customer_name}! 👋</h3>
                      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                        Thank you so much for visiting <strong>{business_name}</strong>! It was an absolute pleasure serving you today. We hope you had a wonderful experience, and <strong>we look forward to welcoming you back again soon!</strong>
                      </p>
                      
                      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: #374151; font-size: 14px;">Order Summary</span>
                        <span class="badge">{invoice.status}</span>
                      </div>
                      
                      <table class="table">
                        <thead>
                          <tr>
                            <th class="th">Item</th>
                            <th class="th" style="text-align: center;">Qty</th>
                            <th class="th" style="text-align: right;">Price</th>
                            <th class="th" style="text-align: right;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines_table_rows}
                        </tbody>
                      </table>
                      
                      <div class="total-box">
                        <div style="display: flex; justify-content: space-between; font-size: 14px; color: #64748b; margin-bottom: 6px;">
                          <span>Subtotal</span>
                          <span>₹{invoice.total:.2f}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #15803d; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
                          <span>Total Amount Paid</span>
                          <span>₹{invoice.total:.2f}</span>
                        </div>
                      </div>
                      
                      <p style="color: #6b7280; font-size: 13px; margin-top: 24px; text-align: center;">
                        📎 <em>A PDF copy of your official receipt is attached to this email.</em>
                      </p>
                    </div>
                    
                    <div class="footer">
                      <p style="margin: 0; font-weight: 600; color: #374151;">Thank you for choosing {business_name}!</p>
                      <p style="margin: 4px 0 0 0;">Have a wonderful day ahead! See you next time 😊</p>
                    </div>
                  </div>
                </body>
                </html>
                """
                
                import os
                import json
                import urllib.request
                import io
                import base64
                
                # Generate PDF attachment matching web design layout
                pdf_b64 = None
                filename = f"{'Bill' if is_bill else 'Invoice'}_{str(invoice.id)[:8]}.pdf"
                try:
                    from reportlab.lib.pagesizes import letter
                    from reportlab.lib import colors
                    from reportlab.pdfgen import canvas
                    
                    buffer = io.BytesIO()
                    p = canvas.Canvas(buffer, pagesize=letter)
                    width, height = letter # 612 x 792
                    
                    y = height - 50 # 742
                    
                    # Top Left: Business Info
                    p.setFont("Helvetica-Bold", 16)
                    p.setFillColor(colors.HexColor("#111827"))
                    p.drawString(50, y, str(business_name))
                    
                    if business_owner_name:
                        y -= 18
                        p.setFont("Helvetica", 10)
                        p.setFillColor(colors.HexColor("#4b5563"))
                        p.drawString(50, y, str(business_owner_name))
                        
                    if business_address:
                        p.setFont("Helvetica", 9)
                        p.setFillColor(colors.HexColor("#6b7280"))
                        for addr_line in str(business_address).split('\n'):
                            y -= 14
                            p.drawString(50, y, addr_line.strip())
                            
                    # Top Right: BILL TO
                    y_right = height - 50
                    p.setFont("Helvetica-Bold", 9)
                    p.setFillColor(colors.HexColor("#6b7280"))
                    p.drawRightString(562, y_right, "BILL TO")
                    
                    y_right -= 18
                    p.setFont("Helvetica-Bold", 14)
                    p.setFillColor(colors.HexColor("#111827"))
                    p.drawRightString(562, y_right, str(customer_name))
                    
                    # Move y down past header
                    y = min(y - 35, y_right - 35)
                    
                    # Green Title: BILL or INVOICE
                    doc_title_label = "BILL" if is_bill else "INVOICE"
                    p.setFont("Helvetica-Bold", 22)
                    p.setFillColor(colors.HexColor("#15803d")) # Emerald Green
                    p.drawString(50, y, doc_title_label)
                    
                    # Meta info
                    y -= 20
                    p.setFont("Helvetica-Bold", 9)
                    p.setFillColor(colors.HexColor("#374151"))
                    p.drawString(50, y, f"{'Bill' if is_bill else 'Invoice'} #:")
                    p.setFont("Helvetica", 9)
                    p.drawString(95, y, str(invoice.id)[:8].upper())
                    
                    y -= 15
                    p.setFont("Helvetica-Bold", 9)
                    p.drawString(50, y, "Date:")
                    p.setFont("Helvetica", 9)
                    date_str = invoice.created_at.strftime('%d-%m-%Y') if hasattr(invoice, 'created_at') and invoice.created_at else ""
                    p.drawString(95, y, date_str)
                    
                    y -= 15
                    p.setFont("Helvetica-Bold", 9)
                    p.drawString(50, y, "Status:")
                    p.setFont("Helvetica-Bold", 9)
                    p.setFillColor(colors.HexColor("#15803d") if invoice.status.lower() == 'paid' else colors.HexColor("#ef4444"))
                    p.drawString(95, y, invoice.status.upper())
                    
                    # Divider line
                    y -= 25
                    p.setStrokeColor(colors.HexColor("#e5e7eb"))
                    p.setLineWidth(1)
                    p.line(50, y, 562, y)
                    
                    # Table Header
                    y -= 25
                    p.setFont("Helvetica-Bold", 10)
                    p.setFillColor(colors.HexColor("#374151"))
                    p.drawString(50, y, "Item Description")
                    p.drawCentredString(320, y, "Qty")
                    p.drawRightString(440, y, "Unit Price")
                    p.drawRightString(562, y, "Total")
                    
                    # Items
                    for line in invoice.lines.all():
                        y -= 20
                        p.setFont("Helvetica", 10)
                        p.setFillColor(colors.HexColor("#1f2937"))
                        p.drawString(50, y, str(line.description)[:40])
                        qty_str = str(int(line.quantity)) if float(line.quantity).is_integer() else f"{float(line.quantity):.2f}"
                        p.drawCentredString(320, y, qty_str)
                        p.drawRightString(440, y, f"Rs. {line.unit_price:.2f}")
                        line_total = line.quantity * line.unit_price
                        p.drawRightString(562, y, f"Rs. {line_total:.2f}")
                        
                        # Subtle row border
                        p.setStrokeColor(colors.HexColor("#f3f4f6"))
                        p.setLineWidth(0.5)
                        p.line(50, y - 6, 562, y - 6)
                        
                        if y < 120:
                            p.showPage()
                            y = height - 50
                            
                    paid_amount = sum(float(p.amount) for p in invoice.payments.all()) if hasattr(invoice, 'payments') and invoice.payments.exists() else (float(invoice.total) if invoice.status == 'paid' else 0.0)
                    balance_due = max(0.0, float(invoice.total) - paid_amount)
                    
                    # Totals Section (Right Aligned)
                    y -= 30
                    p.setStrokeColor(colors.HexColor("#e5e7eb"))
                    p.setLineWidth(1)
                    p.line(300, y + 10, 562, y + 10)
                    
                    p.setFont("Helvetica", 10)
                    p.setFillColor(colors.HexColor("#6b7280"))
                    p.drawString(300, y, "Subtotal:")
                    p.setFillColor(colors.HexColor("#111827"))
                    p.drawRightString(562, y, f"Rs. {invoice.total:.2f}")
                    
                    y -= 25
                    p.setFont("Helvetica-Bold", 14)
                    p.setFillColor(colors.HexColor("#15803d"))
                    p.drawString(300, y, "Total Amount:")
                    p.drawRightString(562, y, f"Rs. {invoice.total:.2f}")
                    
                    if not is_bill:
                        y -= 20
                        p.setFont("Helvetica", 10)
                        p.setFillColor(colors.HexColor("#6b7280"))
                        p.drawString(300, y, "Amount Paid:")
                        p.setFillColor(colors.HexColor("#16a34a"))
                        p.drawRightString(562, y, f"Rs. {paid_amount:.2f}")
                        
                        y -= 18
                        p.setFont("Helvetica-Bold", 10)
                        p.setFillColor(colors.HexColor("#374151"))
                        p.drawString(300, y, "Balance Due:")
                        p.setFillColor(colors.HexColor("#ef4444") if balance_due > 0 else colors.HexColor("#6b7280"))
                        p.drawRightString(562, y, f"Rs. {balance_due:.2f}")
                        
                    # Footer
                    p.setFont("Helvetica", 10)
                    p.setFillColor(colors.HexColor("#6b7280"))
                    p.drawCentredString(width / 2.0, 50, "Thank you for your business!")
                    
                    p.showPage()
                    p.save()
                    
                    buffer.seek(0)
                    pdf_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                except Exception as pdf_err:
                    print(f"PDF generation warning: {pdf_err}")
                
                BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '').strip()
                RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
                
                if BREVO_API_KEY:
                    # Brevo API (Supports sending to ANY recipient with just Gmail Single Sender verification)
                    brevo_payload = {
                        "sender": {"name": business_name, "email": sender_email or "dhrumilvaghela22@gmail.com"},
                        "to": [{"email": target_email}],
                        "subject": subject,
                        "htmlContent": html_content
                    }
                    if pdf_b64:
                        brevo_payload["attachment"] = [{"name": filename, "content": pdf_b64}]
                        
                    req = urllib.request.Request(
                        'https://api.brevo.com/v3/smtp/email',
                        data=json.dumps(brevo_payload).encode('utf-8'),
                        headers={
                            'api-key': BREVO_API_KEY,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        method='POST'
                    )
                    try:
                        with urllib.request.urlopen(req) as response:
                            res_data = response.read()
                    except urllib.error.HTTPError as api_err:
                        error_body = api_err.read().decode()
                        return Response({'error': f'Brevo API Error: {error_body}'}, status=status.HTTP_400_BAD_REQUEST)
                    except Exception as api_err:
                        return Response({'error': f'Brevo API Error: {str(api_err)}'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # Fallback to Resend API
                    resend_payload = {
                        "from": f"{business_name} <onboarding@resend.dev>",
                        "to": [target_email],
                        "subject": subject,
                        "html": html_content
                    }
                    if pdf_b64:
                        resend_payload["attachments"] = [{"filename": filename, "content": pdf_b64}]
                        
                    req = urllib.request.Request(
                        'https://api.resend.com/emails',
                        data=json.dumps(resend_payload).encode('utf-8'),
                        headers={
                            'Authorization': f'Bearer {RESEND_API_KEY}',
                            'Content-Type': 'application/json',
                            'User-Agent': 'NexusERP/1.0 (Integration)'
                        },
                        method='POST'
                    )
                    try:
                        with urllib.request.urlopen(req) as response:
                            res_data = response.read()
                    except urllib.error.HTTPError as api_err:
                        error_body = api_err.read().decode()
                        return Response({'error': f'Resend API Error: {error_body}'}, status=status.HTTP_400_BAD_REQUEST)
                    except Exception as api_err:
                        return Response({'error': f'Resend API Error: {str(api_err)}'}, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({'status': 'email sent'})
            else:
                return Response({'error': 'Please provide an email address or associate a customer with one.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
