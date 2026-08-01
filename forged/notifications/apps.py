from django.apps import AppConfig
import sys

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'notifications'

    def ready(self):

        import notifications.signals

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "notifications",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions"],
            "permissions": ["view_notifications"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/notifications/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register notifications manifest: {e}")
