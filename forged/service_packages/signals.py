from django.dispatch import receiver
from core.events import appointment_booked
# from .models import ...

@receiver(appointment_booked)
def handle_appointment_booked(sender, tenant_id, **kwargs):
    # In a full implementation, this could block calendar slots for the required staff
    # or ensure the requested staff is actually qualified (StaffServiceSkill).
    pass
