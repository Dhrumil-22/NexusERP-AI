from django.apps import AppConfig
import sys

class BusinessSetupConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'business_setup'

    def ready(self):
        if 'runserver' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "business_setup",
            "version": "1.0",
            "depends_on": ["auth"],
            "permissions": ["admin"], # Assuming role=Admin has "admin" permission
            "forms": [{
                "form_id": "onboarding_form",
                "fields": [
                    {"name": "business_name", "label": "Business Name", "type": "text", "required": True},
                    {"name": "industry", "label": "Industry", "type": "text", "required": True},
                    {"name": "address", "label": "Address", "type": "textarea", "required": False},
                    {"name": "gst_number", "label": "GST Number", "type": "text", "required": False},
                    {"name": "currency", "label": "Currency", "type": "text", "required": False},
                    {"name": "timezone", "label": "Timezone", "type": "text", "required": False},
                    {"name": "default_tax_rate", "label": "Default Tax Rate (%)", "type": "number", "required": False},
                    {"name": "working_hours", "label": "Working Hours", "type": "text", "required": False}
                ]
            }],
            "dashboard_widgets": [],
            "api_routes": ["/api/business_setup/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register business_setup manifest: {e}")
