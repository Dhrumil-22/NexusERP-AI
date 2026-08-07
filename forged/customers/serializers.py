from rest_framework import serializers
from .models import Customer, CustomerNote
from django.apps import apps

class CustomerNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerNote
        fields = ['id', 'customer', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']

class CustomerSerializer(serializers.ModelSerializer):
    notes = CustomerNoteSerializer(many=True, read_only=True)
    name = serializers.SerializerMethodField()
    latest_order_status = serializers.SerializerMethodField()
    visits = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'name', 'email', 'phone', 'company', 'loyalty_points', 'notes', 'created_at', 'latest_order_status', 'visits']
        read_only_fields = ['id', 'created_at']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_latest_order_status(self, obj):
        try:
            Order = apps.get_model('table_order_mgmt', 'Order')
            latest_order = Order.objects.filter(customer_id=str(obj.id)).order_by('-created_at').first()
            return latest_order.status if latest_order else None
        except Exception:
            return None

    def get_visits(self, obj):
        try:
            Order = apps.get_model('table_order_mgmt', 'Order')
            return Order.objects.filter(customer_id=str(obj.id), status='paid').count()
        except Exception:
            return 0
