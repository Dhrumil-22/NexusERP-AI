from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    business_id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=255)
    role = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    hire_date = serializers.DateField(required=False, allow_null=True)

    def create(self, validated_data):
        return Employee.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
