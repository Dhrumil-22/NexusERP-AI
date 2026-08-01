import os

target_dir = r'c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\frontend\src'

replacements = {
    'http://127.0.0.1:8000': 'https://nexuserp-ai.onrender.com',
    'http://127.0.0.1:3001': 'https://nexuserp-ai-express.onrender.com'
}

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for old, new in replacements.items():
                content = content.replace(old, new)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {file_path}")
