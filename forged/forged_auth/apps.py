from django.apps import AppConfig
import sys

class ForgedAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'forged_auth'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "auth",
            "version": "1.0",
            "depends_on": [],
            "permissions": ["admin"], 
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/auth/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register auth manifest: {e}")
