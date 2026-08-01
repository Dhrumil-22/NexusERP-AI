import uuid
from django.db import models
from forged_auth.models import Business

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
        
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class AvailabilitySlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='availability_slots')
    
    # Decoupled link to Employee
    employee_id = models.CharField(max_length=255, help_text="ID of the staff member")
    employee_name = models.CharField(max_length=255, blank=True)
    
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    is_booked = models.BooleanField(default=False)
    
    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.employee_name} on {self.date} {self.start_time}-{self.end_time}"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('No-Show', 'No-Show'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='appointments')
    
    # Decoupled links
    customer_id = models.CharField(max_length=255, help_text="ID of the customer")
    customer_name = models.CharField(max_length=255, blank=True)
    employee_id = models.CharField(max_length=255, help_text="ID of the staff member")
    employee_name = models.CharField(max_length=255, blank=True)
    
    slot = models.ForeignKey(AvailabilitySlot, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    notes = models.TextField(blank=True)
    
    objects = TenantManager()

    def __str__(self) -> str:
        return f"Appointment: {self.customer_name} with {self.employee_name} on {self.date}"
