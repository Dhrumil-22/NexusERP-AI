from rest_framework import serializers
from .models import Supplier

class SupplierSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    business_id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    items_supplied = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    notes = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return Supplier.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
