import urllib.request
import json

base_url = "https://nexuserp-ai.onrender.com"
access_token = None

for username in ["ceotp", "admin", "ceotp2", "testuser123"]:
    print(f"Trying to login as {username}...")
    req = urllib.request.Request(
        f"{base_url}/api/auth/login/",
        data=json.dumps({"username": username, "password": "password123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    try:
        res = urllib.request.urlopen(req)
        tokens = json.loads(res.read().decode())
        access_token = tokens.get("access")
        print(f"Success! Logged in as {username}")
        break
    except Exception as e:
        print(f"Failed to login as {username}")

if not access_token:
    print("Could not log in with any known username.")
    exit(1)

# 2. Get current business setup
req2 = urllib.request.Request(
    f"{base_url}/api/business_setup/onboarding/",
    headers={"Authorization": f"Bearer {access_token}"}
)
try:
    res2 = urllib.request.urlopen(req2)
    business_data = json.loads(res2.read().decode())
    print("Business data:", business_data)
except Exception as e:
    print("Failed to get business data:", e)
    exit(1)

# 3. Add table_order_mgmt
enabled = business_data.get("enabled_modules", [])
if isinstance(enabled, str):
    enabled = json.loads(enabled)

if "table_order_mgmt" not in enabled:
    enabled.append("table_order_mgmt")
if "kitchen_kot" not in enabled:
    enabled.append("kitchen_kot")

print("New enabled modules:", enabled)

# 4. POST updated setup
post_data = {
    "business_name": business_data.get("business_name") or "Nexus ERP",
    "industry": business_data.get("industry") or "",
    "address": business_data.get("address") or "",
    "owner_name": business_data.get("owner_name") or "",
    "enabled_modules": json.dumps(enabled),
    "theme_color": business_data.get("theme_color") or "#3b82f6"
}

req3 = urllib.request.Request(
    f"{base_url}/api/business_setup/onboarding/",
    data=json.dumps(post_data).encode(),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)
try:
    res3 = urllib.request.urlopen(req3)
    print("Successfully updated modules:", res3.read().decode())
except Exception as e:
    print("Failed to update modules:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
