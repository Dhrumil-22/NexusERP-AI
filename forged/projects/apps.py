from django.apps import AppConfig
import sys

class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'projects'

    def ready(self):

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "projects",
            "version": "1.0",
            "depends_on": ["employee_hr"],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/projects/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register projects manifest: {e}")
