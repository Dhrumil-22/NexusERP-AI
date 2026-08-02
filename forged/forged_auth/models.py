import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

ROLE_CHOICES = (
    ('Admin', 'Admin'),
    ('Manager', 'Manager'),
    ('Staff', 'Staff'),
)

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
        
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(business_id=tenant_id)

class Business(models.Model):
    business_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    industry_tag = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    owner_name = models.CharField(max_length=255, blank=True)
    gst_number = models.CharField(max_length=50, blank=True)
    enabled_modules = models.JSONField(default=list, blank=True)
    logo = models.ImageField(upload_to='business_logos/', blank=True, null=True)
    logo_base64 = models.TextField(blank=True, null=True)
    theme_color = models.CharField(max_length=7, default='#3b82f6')
    currency = models.CharField(max_length=10, default='USD')
    timezone = models.CharField(max_length=50, default='UTC')
    default_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    working_hours = models.CharField(max_length=255, blank=True, null=True, default='9 AM - 5 PM')
    ai_prompt = models.TextField(blank=True)
    
    objects = models.Manager()

    def __str__(self) -> str:
        return str(self.name)

class User(AbstractUser):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Staff')
    two_factor_enabled = models.BooleanField(default=False)
    assigned_modules = models.JSONField(default=list, blank=True)
    avatar = models.ImageField(upload_to='user_avatars/', blank=True, null=True)
    avatar_base64 = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return str(self.username)

    @property
    def tenant_id(self):
        return self.business_id

class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='auth_sessions', null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    
    ip_address = models.CharField(max_length=50, blank=True)
    device_info = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"Session for {self.user.username} from {self.ip_address}"
