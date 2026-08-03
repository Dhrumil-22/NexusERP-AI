import os
import glob
import re

def run():
    app_files = glob.glob('*/apps.py')
    for file in app_files:
        with open(file, 'r') as f:
            content = f.read()
            
        new_content = re.sub(r"        if 'runserver' not in sys\.argv.*?\n            return\n", "", content)
        if new_content != content:
            with open(file, 'w') as f:
                f.write(new_content)
            print(f"Updated {file}")

if __name__ == '__main__':
    run()
