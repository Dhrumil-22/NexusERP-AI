import os

for root, _, files in os.walk(r'c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\frontend\src\components'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            for i, line in enumerate(lines):
                if '$' in line and '{' in line:
                    if '`' not in line and 'Bearer' not in line and 'API_BASE' not in line:
                        # Exclude some other obvious ones
                        if 'color:' not in line and 'className=' not in line:
                            # And skip already fixed ones with ₹
                            if '₹{' not in line:
                                print(f'{file}:{i+1}: {line.strip()}')
