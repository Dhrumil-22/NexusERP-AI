from rest_framework import serializers
from .models import StoreLocation, ProductVariant, Barcode

class StoreLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreLocation
        fields = '__all__'
        read_only_fields = ['id', 'tenant']

class BarcodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barcode
        fields = '__all__'
        read_only_fields = ['id', 'tenant']

class ProductVariantSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    barcodes = BarcodeSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product_id', 'product_name', 'store', 'store_name', 'size', 'color', 'stock_quantity', 'barcodes']
        read_only_fields = ['id', 'tenant']
