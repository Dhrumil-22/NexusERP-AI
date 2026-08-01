from django.apps import AppConfig
import sys

class PurchaseOrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'purchase_orders'

    def ready(self):

        import purchase_orders.signals

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "purchase_orders",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions", "suppliers", "inventory"],
            "permissions": ["view_purchase_orders", "edit_purchase_orders"],
            "forms": [
                {
                    "form_id": "add_purchase_order",
                    "fields": [
                        { "name": "supplier_id", "label": "Supplier", "type": "dropdown", "required": True },
                        { "name": "status", "label": "Status", "type": "dropdown", "options": ["draft", "sent", "received"], "required": True }
                    ]
                }
            ],
            "dashboard_widgets": [
                { "widget_id": "pending_purchase_orders", "type": "list" }
            ],
            "api_routes": ["/api/purchase_orders/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register purchase_orders manifest: {e}")
