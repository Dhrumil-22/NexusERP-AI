from rest_framework import serializers
from .models import Customer, CustomerNote

class CustomerNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerNote
        fields = ['id', 'customer', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']

class CustomerSerializer(serializers.ModelSerializer):
    notes = CustomerNoteSerializer(many=True, read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'name', 'email', 'phone', 'company', 'loyalty_points', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
