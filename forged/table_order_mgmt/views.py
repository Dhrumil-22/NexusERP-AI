from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Table, Order, OrderItem
from .serializers import TableSerializer, OrderSerializer, OrderItemSerializer
from core.events import order_created, order_paid

class TableViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TableSerializer

    def get_queryset(self):
        return Table.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        order = serializer.save(tenant_id=self.request.user.tenant_id)
        # Update table occupancy
        table = order.table
        table.is_occupied = True
        table.save()

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        order = self.get_object()
        serializer = OrderItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tenant_id=self.request.user.tenant_id, order=order, status='pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def send_to_kitchen(self, request, pk=None):
        order = self.get_object()
        pending_items = order.items.filter(status='pending')
        
        if not pending_items.exists():
            return Response({'error': 'No pending items to send'}, status=status.HTTP_400_BAD_REQUEST)
        
        items_data = []
        for item in pending_items:
            items_data.append({
                'product_id': item.product_id,
                'quantity': item.quantity,
                'notes': item.notes
            })
            item.status = 'preparing'
            item.save()
            
        order_created.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            order_id=str(order.id),
            table_number=order.table.table_number,
            items=items_data
        )
        return Response({'status': 'sent to kitchen'})

    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data.get('item_id')
        try:
            item = order.items.get(id=item_id, status='pending')
            item.delete()
            return Response({'status': 'item removed'})
        except Exception:
            return Response({'error': 'Item not found or already preparing'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.status == 'paid':
            return Response({'error': 'Order is already paid'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = 'paid'
        order.save()
        
        # Free up table
        table = order.table
        table.is_occupied = False
        table.save()
        
        # Generate SalesOrder if there's a customer
        if order.customer_id:
            from sales_orders.models import Order as SalesOrder, OrderItem as SalesOrderItem
            from inventory.models import Product
            sales_order = SalesOrder.objects.create(
                tenant_id=order.tenant_id,
                customer_id=order.customer_id,
                status='confirmed',
                source='table'
            )
            
            items_for_signal = []
            total = 0.0
            
            for item in order.items.all():
                product = Product.objects.for_tenant(order.tenant_id).filter(name=item.product_id).first()
                unit_price = product.price if product else 0.00
                actual_product_id = str(product.id) if product else item.product_id
                
                SalesOrderItem.objects.create(
                    tenant_id=order.tenant_id,
                    order=sales_order,
                    product_id=actual_product_id,
                    quantity=item.quantity,
                    unit_price=unit_price
                )
                
                items_for_signal.append({
                    'product_id': actual_product_id,
                    'quantity': float(item.quantity),
                    'unit_price': float(unit_price)
                })
                total += float(item.quantity) * float(unit_price)
                
            from core.events import order_confirmed
            order_confirmed.send(
                sender=self.__class__,
                tenant_id=order.tenant_id,
                order_id=str(sales_order.id),
                customer_id=order.customer_id,
                total=total,
                source='table',
                items=items_for_signal
            )
        
        # Send email if requested
        send_email = request.data.get('send_email', False)
        target_email = request.data.get('email')
        
        if send_email:
            try:
                from django.core.mail import EmailMultiAlternatives
                from django.conf import settings
                from customers.models import Customer
                
                customer = Customer.objects.for_tenant(order.tenant_id).filter(id=order.customer_id).first() if order.customer_id else None
                
                if not target_email and customer:
                    target_email = customer.email
                    
                if target_email:
                    business_name = request.user.business.name
                    sender_email = request.user.email or settings.DEFAULT_FROM_EMAIL
                    subject = f"Receipt from {business_name}"
                    
                    customer_name = customer.first_name if customer else "Customer"
                    
                    text_content = f"Thank you for your visit, {customer_name}!\n\nYour total bill was ₹{total:.2f}.\n\n"
                    html_content = f"<h3>Thank you for your visit, {customer_name}!</h3><p>Your total bill was <b>₹{total:.2f}</b>.</p><table style='width:100%; border-collapse: collapse; margin-bottom: 20px;'><tr style='border-bottom: 2px solid #ddd; text-align: left;'><th>Item</th><th>Qty</th><th>Price</th></tr>"
                    
                    for item in order.items.all():
                        product = Product.objects.for_tenant(order.tenant_id).filter(name=item.product_id).first()
                        unit_price = product.price if product else 0.00
                        text_content += f"- {item.quantity}x {item.product_id} @ ₹{unit_price:.2f} each\n"
                        html_content += f"<tr style='border-bottom: 1px solid #eee;'><td>{item.product_id}</td><td>{item.quantity}</td><td>₹{unit_price:.2f}</td></tr>"
                        
                    text_content += f"\nTotal: ₹{total:.2f}\n"
                    text_content += f"\nThank you for choosing {business_name}!\n"
                    
                    html_content += f"</table><p><b>Total:</b> <span style='font-size: 18px; color: #3b82f6;'>₹{total:.2f}</span></p>"
                    html_content += f"<br><p>Thank you for choosing <b>{business_name}</b>!</p>"
                    
                    from_header = f"{business_name} <{settings.DEFAULT_FROM_EMAIL}>"
                    msg = EmailMultiAlternatives(
                        subject,
                        text_content,
                        from_header,
                        [target_email],
                        reply_to=[sender_email]
                    )
                    msg.attach_alternative(html_content, "text/html")
                    msg.send(fail_silently=True)
            except Exception as e:
                import logging
                logging.error(f"Failed to send email: {e}")
                
        # Fire event for Invoicing
        order_paid.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            order_id=str(order.id)
        )
        return Response({'status': 'order paid'})

    @action(detail=True, methods=['post'])
    def close_empty(self, request, pk=None):
        order = self.get_object()
        if order.items.exists():
            return Response({'error': 'Cannot close table with items'}, status=status.HTTP_400_BAD_REQUEST)
        
        table = order.table
        table.is_occupied = False
        table.save()
        order.delete()
        
        return Response({'status': 'table closed'})

    @action(detail=True, methods=['post'])
    def change_customer(self, request, pk=None):
        order = self.get_object()
        customer_id = request.data.get('customer_id')
        if not customer_id:
            return Response({'error': 'Customer ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.customer_id = customer_id
        order.save()
        return Response({'status': 'customer updated'})
