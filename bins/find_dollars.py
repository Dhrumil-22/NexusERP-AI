import os
import re

directories = [
    r"c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\frontend\src\components",
    r"c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\forged"
]

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.jsx', '.js', '.py')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check what would be replaced
                # Look for all matches of $ not followed by {
                matches = re.finditer(r'\$(?!\{)', content)
                for m in matches:
                    start = max(0, m.start() - 10)
                    end = min(len(content), m.end() + 10)
                    print(f"{file}: {content[start:end].replace(chr(10), ' ')}")
