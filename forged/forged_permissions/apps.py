from django.apps import AppConfig
import sys

class ForgedPermissionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'forged_permissions'

    def ready(self):

        import forged_permissions.signals

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "permissions",
            "version": "1.0",
            "depends_on": ["auth", "module_registry"],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": []
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register permissions manifest: {e}")
