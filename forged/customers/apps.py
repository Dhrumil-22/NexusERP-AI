from django.apps import AppConfig
import sys

class CustomersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'customers'

    def ready(self):
        import customers.signals
        

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "customers",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions"],
            "permissions": ["view_customers", "edit_customers"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/customers/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register customers manifest: {e}")
