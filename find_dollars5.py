import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for root, _, files in os.walk(r'c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\frontend\src\components'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            for i, line in enumerate(lines):
                if '$' in line:
                    if '`' not in line:
                        print(f'{file}:{i+1}: {line.strip()}')
