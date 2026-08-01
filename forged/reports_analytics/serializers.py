from rest_framework import serializers

class KeyValueSerializer(serializers.Serializer):
    key = serializers.CharField()
    value = serializers.FloatField()

class StatusCountSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()

class LowStockItemSerializer(serializers.Serializer):
    item_id = serializers.CharField()
    item_name = serializers.CharField()
    current_stock = serializers.FloatField()
    threshold = serializers.FloatField()

class GenericAnalyticsResponseSerializer(serializers.Serializer):
    data = serializers.ListField(child=serializers.DictField())
