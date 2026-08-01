from django.apps import AppConfig


class RegistryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'registry'

    def ready(self):
        import sys

        from .models import ModuleManifest
        
        manifest_dict = {
            "module_id": "module_registry",
            "version": "1.0",
            "depends_on": ["auth"],
            "permissions": ["admin"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/registry/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register module_registry manifest: {e}")
