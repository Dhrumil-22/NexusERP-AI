from django.apps import AppConfig
import sys

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'inventory'

    def ready(self):
        import inventory.signals
        
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "inventory",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions"],
            "permissions": ["view_inventory", "edit_inventory"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/inventory/categories/", "/api/inventory/products/", "/api/inventory/adjustments/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register inventory manifest: {e}")
