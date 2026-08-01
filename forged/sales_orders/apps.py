from django.apps import AppConfig
import sys

class SalesOrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'sales_orders'

    def ready(self):
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "sales_orders",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions", "customers", "inventory"],
            "permissions": ["view_sales_orders", "edit_sales_orders"],
            "forms": [
                {
                    "form_id": "add_sales_order",
                    "fields": [
                        { "name": "customer_id", "label": "Customer", "type": "dropdown", "required": False },
                        { "name": "status", "label": "Status", "type": "dropdown", "options": ["placed", "preparing", "ready", "served", "paid", "closed"], "required": True },
                        { "name": "total", "label": "Total", "type": "number", "required": False }
                    ]
                }
            ],
            "dashboard_widgets": [
                { "widget_id": "orders_today", "type": "stat_card" },
                { "widget_id": "revenue", "type": "line_chart" }
            ],
            "api_routes": ["/api/sales_orders/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register sales_orders manifest: {e}")
