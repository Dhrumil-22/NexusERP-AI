from django.apps import AppConfig
import sys

class InvoicingFinanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'invoicing_finance'

    def ready(self):

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "invoicing_finance",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions", "sales_orders"],
            "permissions": ["view_invoicing_finance", "edit_invoicing_finance"],
            "forms": [
                {
                    "form_id": "add_invoice",
                    "fields": [
                        { "name": "sales_order_id", "label": "Sales Order", "type": "dropdown", "required": True },
                        { "name": "subtotal", "label": "Subtotal", "type": "number", "required": True }
                    ]
                }
            ],
            "dashboard_widgets": [
                { "widget_id": "revenue_this_month", "type": "stat_card" }
            ],
            "api_routes": ["/api/invoicing_finance/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register invoicing_finance manifest: {e}")
            
        from . import signals
