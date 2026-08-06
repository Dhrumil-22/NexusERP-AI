from rest_framework import serializers
from .models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ['id', 'message', 'ai_response', 'status', 'created_at']
        read_only_fields = ['id', 'ai_response', 'status', 'created_at']
