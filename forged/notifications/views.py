from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Users should only see notifications assigned directly to them, OR broadcast notifications (recipient_id is null)
        tenant_id = self.request.user.tenant_id
        employee_id = str(self.request.user.id)
        
        return Notification.objects.filter(tenant_id=tenant_id).filter(
            models.Q(recipient_id=employee_id) | models.Q(recipient_id__isnull=True)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
