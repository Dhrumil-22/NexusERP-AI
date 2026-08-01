from django.apps import AppConfig
import sys

class BillingInvoicingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore
    name = 'billing_invoicing'

    def ready(self):
        import billing_invoicing.signals
        
        if 'runserver' not in sys.argv and 'test' not in sys.argv:
            return

        from module_registry.models import ModuleDefinition as ModuleManifest
        
        manifest_dict = {
            "module_id": "billing_invoicing",
            "version": "1.0",
            "depends_on": ["auth", "module_registry", "permissions", "inventory_core", "customers"],
            "permissions": ["view_billing", "edit_billing"],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": ["/api/billing/invoices/", "/api/billing/payments/"]
        }
        try:
            ModuleManifest.register_manifest(manifest_dict)
        except Exception as e:
            print(f"Failed to register billing_invoicing manifest: {e}")
