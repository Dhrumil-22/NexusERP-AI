from django.apps import AppConfig
import sys

class SuppliersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'suppliers'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "suppliers",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions"],
            "permissions": ["view_suppliers", "edit_suppliers"],
            "forms": [
                {
                    "form_id": "add_supplier",
                    "fields": [
                        { "name": "name", "label": "Name", "type": "text", "required": True },
                        { "name": "phone", "label": "Phone", "type": "text", "required": False },
                        { "name": "notes", "label": "Notes", "type": "textarea", "required": False }
                    ]
                }
            ],
            "dashboard_widgets": [
                { "widget_id": "active_suppliers", "type": "stat_card" }
            ],
            "api_routes": ["/api/suppliers/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register suppliers manifest: {e}")
