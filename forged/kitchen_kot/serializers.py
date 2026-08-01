from rest_framework import serializers
from .models import KitchenTicket, KitchenTicketItem

class KitchenTicketItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = KitchenTicketItem
        fields = '__all__'
        read_only_fields = ['tenant_id', 'ticket']

class KitchenTicketSerializer(serializers.ModelSerializer):
    items = KitchenTicketItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = KitchenTicket
        fields = '__all__'
        read_only_fields = ['tenant_id']
