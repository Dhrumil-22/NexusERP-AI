from django.apps import AppConfig
import sys

class KitchenKotConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'kitchen_kot'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        import kitchen_kot.signals

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "kitchen_kot",
            "version": "1.0",
            "depends_on": ["table_order_mgmt"],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/kot/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register kitchen_kot manifest: {e}")
