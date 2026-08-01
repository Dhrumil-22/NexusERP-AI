from django.apps import AppConfig
import sys

class PurchaseSupplierConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'purchase_supplier'

    def ready(self):

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "purchase_supplier",
            "version": "1.0",
            "depends_on": ["inventory"],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/purchase/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register purchase_supplier manifest: {e}")
            
        from . import signals
