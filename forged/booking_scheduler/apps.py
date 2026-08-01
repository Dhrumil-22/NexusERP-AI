from django.apps import AppConfig
import sys

class BookingSchedulerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'booking_scheduler'

    def ready(self):

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "booking_scheduler",
            "version": "1.0",
            "depends_on": ["employees", "customers"],
            "permissions": ["manage_bookings"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/booking/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            pass
