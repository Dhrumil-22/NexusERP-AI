
import os
import re

src_dir = r"c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\frontend\src\components"

files_to_patch = []
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".jsx"):
            files_to_patch.append(os.path.join(root, f))

def patch_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "alert(" not in content:
        return
        
    auth_match = re.search(r"const\s+\{\s*([^}]+)\s*\}\s*=\s*useAuth\(\);", content)
    if auth_match:
        vars_str = auth_match.group(1)
        if "showStatus" not in vars_str:
            new_vars = vars_str + ", showStatus"
            content = content.replace(auth_match.group(0), f"const {{ {new_vars} }} = useAuth();")
    else:
        # Check if we have const currentUser = useCurrentUser(...) instead of useAuth in some files
        pass

    def alert_replacer(m):
        msg = m.group(1)
        if "Fail" in msg or "error" in msg or "not" in msg.lower() or "Please" in msg:
            return f'showStatus("Error", {msg}, "error")'
        else:
            return f'showStatus("Success", {msg}, "success")'
    
    content = re.sub(r'alert\((.*?)\)', alert_replacer, content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched {filepath}")

for filepath in files_to_patch:
    patch_file(filepath)
print("Done patching.")
