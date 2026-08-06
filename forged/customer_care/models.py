import uuid
from django.db import models
from forged_auth.models import Business, User, TenantManager

class SupportTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='support_tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    message = models.TextField()
    ai_response = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='open', choices=(('open', 'Open'), ('resolved', 'Resolved')))
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantManager()

    def __str__(self):
        return f"Ticket {self.id} by {self.user.username}"
