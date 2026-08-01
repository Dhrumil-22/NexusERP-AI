from rest_framework import serializers
from .models import Category, Product, StockAdjustment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'sku', 'name', 'description', 
            'unit_of_measure', 'stock_quantity', 'reorder_threshold', 'price'
        ]

class StockAdjustmentSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = ['id', 'product', 'product_name', 'quantity_adjusted', 'reason', 'date']
