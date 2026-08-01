from django.apps import AppConfig
import sys

class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'attendance'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "attendance",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions"],
            "permissions": ["view_attendance", "edit_attendance"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/attendance/records/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register attendance manifest: {e}")
