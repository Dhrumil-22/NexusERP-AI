from rest_framework import serializers

class BusinessSetupSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=255)
    industry = serializers.CharField(max_length=100)
    owner_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    gst_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    theme_color = serializers.CharField(max_length=7, required=False, allow_blank=True)
    logo = serializers.ImageField(required=False, allow_null=True)
    currency = serializers.CharField(max_length=10, required=False, allow_blank=True)
    timezone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    default_tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    working_hours = serializers.CharField(max_length=255, required=False, allow_blank=True)
