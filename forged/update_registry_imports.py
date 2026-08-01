import os
import glob

def run():
    app_files = glob.glob('*/apps.py')
    for file in app_files:
        with open(file, 'r') as f:
            content = f.read()
            
        if 'from registry.models import ModuleManifest' in content:
            new_content = content.replace(
                'from registry.models import ModuleManifest', 
                'from module_registry.models import ModuleDefinition as ModuleManifest'
            )
            with open(file, 'w') as f:
                f.write(new_content)
            print(f"Updated {file}")

if __name__ == '__main__':
    run()
