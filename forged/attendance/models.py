import uuid
from django.db import models
from forged_auth.models import Business

class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
        
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)

class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Late', 'Late'),
        ('Absent', 'Absent'),
        ('Half Day', 'Half Day'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='attendance_records')
    
    # Keeping employee decoupled as a CharField for now, 
    # to avoid strict relation to NoSQL employees app or if it hasn't been migrated yet.
    employee_id = models.CharField(max_length=100)
    employee_name = models.CharField(max_length=200, blank=True)
    
    date = models.DateField()
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    notes = models.TextField(blank=True)

    objects = TenantManager()

    def __str__(self) -> str:
        return f"{self.employee_name or self.employee_id} - {self.date}"

    class Meta:
        unique_together = ('tenant', 'employee_id', 'date')
