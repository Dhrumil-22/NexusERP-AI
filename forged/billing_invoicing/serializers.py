from rest_framework import serializers
from .models import Invoice, InvoiceLine, Payment
from customers.serializers import CustomerSerializer

class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = ['id', 'product', 'description', 'quantity', 'unit_price', 'line_total']
        read_only_fields = ['id', 'line_total']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'amount', 'mode', 'transaction_id', 'payment_date']
        read_only_fields = ['id', 'payment_date']

class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'customer', 'customer_details', 'invoice_number', 'status',
            'subtotal', 'tax_rate', 'tax_amount', 'discount', 'total',
            'created_at', 'due_date', 'lines', 'payments'
        ]
        read_only_fields = ['id', 'created_at', 'subtotal', 'tax_amount', 'total']
