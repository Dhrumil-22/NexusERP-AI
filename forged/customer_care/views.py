from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SupportTicket
from .serializers import SupportTicketSerializer
import requests
from django.conf import settings
import logging

class SupportTicketViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        return SupportTicket.objects.for_tenant(self.request.user.tenant_id).order_by('-created_at')

    def perform_create(self, serializer):
        ticket = serializer.save(
            tenant_id=self.request.user.tenant_id,
            user=self.request.user
        )
        
        # Call Express AI service to generate a growth recommendation
        try:
            express_url = f"{settings.EXPRESS_SERVICE_URL}/api/ai/growth-consultant"
            payload = {
                "message": ticket.message,
                "enabled_modules": self.request.user.business.enabled_modules
            }
            ai_response = requests.post(express_url, json=payload, timeout=10)
            if ai_response.status_code == 200:
                suggestion = ai_response.json().get('suggestion', '')
                if suggestion:
                    ticket.ai_response = suggestion
                    ticket.save()
        except Exception as e:
            logging.error(f"Failed to get AI recommendation for ticket {ticket.id}: {str(e)}")

        return ticket
