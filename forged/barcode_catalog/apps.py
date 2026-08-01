from django.apps import AppConfig
import sys

class BarcodeCatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'barcode_catalog'

    def ready(self):

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "barcode_catalog",
            "version": "1.0",
            "depends_on": ["inventory"],
            "permissions": ["manage_catalog"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/barcode/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            pass
