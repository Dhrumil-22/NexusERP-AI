from django.apps import AppConfig
import sys

class EmployeeHrConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'employee_hr'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "employee_hr",
            "version": "1.0",
            "depends_on": [],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/hr/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register employee_hr manifest: {e}")
