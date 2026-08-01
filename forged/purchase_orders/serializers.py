from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderLine

class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderLine
        fields = ['id', 'product_id', 'quantity_ordered', 'quantity_received', 'unit_price']
        read_only_fields = ['id']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier_id', 'status', 'created_at', 'updated_at', 'lines']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        for line_data in lines_data:
            PurchaseOrderLine.objects.create(
                purchase_order=purchase_order, 
                tenant=purchase_order.tenant,
                **line_data
            )
            
        return purchase_order

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if lines_data is not None:
            # We don't support full nested updates easily here, but we can clear and recreate if needed.
            # Usually for this level, just recreate or handle separately.
            pass
            
        return instance
