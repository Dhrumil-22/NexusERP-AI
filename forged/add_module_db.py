import os
import django
import sys
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "forged.settings")
# Mock the DATABASE_URL so it connects to the production Neon DB
os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_j6gGZEK2Fdkz@ep-winter-flower-ax4kw0g0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

django.setup()

from forged_auth.models import Business

try:
    business = Business.objects.get(name="The Permian")
    
    enabled = business.enabled_modules
    if isinstance(enabled, str):
        enabled = json.loads(enabled)
        
    if not enabled:
        enabled = []
        
    added = False
    if "table_order_mgmt" not in enabled:
        enabled.append("table_order_mgmt")
        added = True
    if "kitchen_kot" not in enabled:
        enabled.append("kitchen_kot")
        added = True
        
    if added:
        business.enabled_modules = enabled
        business.save()
        
        # update TenantModules
        from module_registry.models import TenantModule
        TenantModule.objects.filter(tenant_id=business.business_id).update(is_enabled=False)
        for mod in enabled:
            tm, created = TenantModule.objects.get_or_create(tenant_id=business.business_id, module_id=mod)
            tm.is_enabled = True
            tm.save()
            
        print("Updated modules successfully for", business.name)
        print("Enabled modules:", business.enabled_modules)
    else:
        print("Modules were already enabled.")
        print("Enabled modules:", business.enabled_modules)
        
except Business.DoesNotExist:
    print("Could not find business 'The Permian'")
    for b in Business.objects.all():
        print(f"Found business: {b.name}")
except Exception as e:
    print("Error:", e)
