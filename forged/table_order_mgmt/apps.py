from django.apps import AppConfig
import sys

class TableOrderMgmtConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'table_order_mgmt'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "table_order_mgmt",
            "version": "1.0",
            "depends_on": ["inventory", "billing_invoicing"],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/tables/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register table_order_mgmt manifest: {e}")
            
        import table_order_mgmt.signals
