from rest_framework import serializers
from .models import Table, Order, OrderItem
from core.events import order_created, order_paid

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'
        read_only_fields = ['tenant_id']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['tenant_id', 'order']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'status', 'customer_id', 'items', 'created_at', 'updated_at']
        read_only_fields = ['tenant_id']
