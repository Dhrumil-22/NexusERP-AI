from django.apps import AppConfig
import sys

class ServicePackagesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'service_packages'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "service_packages",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions", "employees", "booking_scheduler"],
            "permissions": ["view_service_packages", "edit_service_packages"],
            "forms": [
                {
                    "form_id": "add_service",
                    "fields": [
                        { "name": "name", "label": "Service Name", "type": "text", "required": True },
                        { "name": "price", "label": "Price", "type": "number", "required": True }
                    ]
                }
            ],
            "dashboard_widgets": [
                { "widget_id": "popular_services", "type": "list" }
            ],
            "api_routes": ["/api/service_packages/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register service_packages manifest: {e}")
            
        from . import signals
