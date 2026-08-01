from django.apps import AppConfig
import sys

class EmployeesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'employees'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "employees",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions"],
            "permissions": ["view_employees", "edit_employees"],
            "forms": [
                {
                    "form_id": "add_employee",
                    "fields": [
                        { "name": "name", "label": "Name", "type": "text", "required": True },
                        { "name": "role", "label": "Role", "type": "text", "required": True },
                        { "name": "phone", "label": "Phone", "type": "text", "required": False },
                        { "name": "hire_date", "label": "Hire Date", "type": "date", "required": False }
                    ]
                }
            ],
            "dashboard_widgets": [
                { "widget_id": "employee_count", "type": "stat_card" }
            ],
            "api_routes": ["/api/employees/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register employees manifest: {e}")
