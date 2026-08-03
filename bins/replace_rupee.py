import os
import re

def replace_currency_symbol():
    directories = [
        r"c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\frontend\src\components",
        r"c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp\forged"
    ]
    
    for d in directories:
        for root, _, files in os.walk(d):
            if 'node_modules' in root or '.venv' in root:
                continue
            for file in files:
                if file.endswith(('.jsx', '.py')) and 'get-pip.py' not in file:
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    
                    # 1. Replace $ followed by number or space (but not inside variable names)
                    # Like: \$([0-9]+) -> ₹\1
                    new_content = re.sub(r'\$([0-9]+(?:\.[0-9]+)?)', r'₹\1', new_content)
                    
                    # 2. Replace \${ (used in JSX for currency before template literal)
                    # Wait, in JS `${` is used for template literals. If we have `$${var}`, it's a dollar sign followed by template literal.
                    new_content = new_content.replace('$${', '₹${')
                    
                    # 3. Replace $ before { in specific React patterns like `(${` or `> $` or `>$`
                    new_content = new_content.replace('> $', '> ₹')
                    new_content = new_content.replace('>$', '>₹')
                    new_content = new_content.replace('($', '(₹')
                    new_content = new_content.replace('-$', '-₹')
                    new_content = new_content.replace(':$', ':₹')
                    new_content = new_content.replace(' $', ' ₹')
                    
                    # 4. In Python f-strings: `f"... ${"` 
                    new_content = new_content.replace('@ $', '@ ₹')
                    
                    # In table order: {p.name} (${Number(p.price)...
                    new_content = new_content.replace('(${', '(₹{')
                    
                    # specific to table order views email: was ${total...} -> actually it's ${total:.2f}. The $ here is BOTH currency AND f-string!
                    # Wait! In python f-string: `Your total bill was ${total:.2f}`
                    # The $ is just a literal, and {total:.2f} is the f-string variable!
                    # So `${` in python f-string means "Literal Dollar followed by { variable }"
                    # In python we can just replace `${` with `₹{` if it's not a JS file!
                    if file.endswith('.py'):
                        new_content = new_content.replace('${', '₹{')
                        new_content = new_content.replace('$', '₹')
                    
                    # JS specific
                    if file.endswith('.jsx'):
                        new_content = new_content.replace('+$', '+₹')
                        new_content = new_content.replace('-$', '-₹')
                        # For jsx, `${` is syntax. BUT `₹${` is what we want if they used ` $${`
                        new_content = new_content.replace('-$${', '-₹${')
                        new_content = new_content.replace('+$${', '+₹${')
                        new_content = new_content.replace(' $${', ' ₹${')
                        new_content = new_content.replace('>$${', '>₹${')
                        
                        # In JS, sometimes people do: `$` + variable. We don't have that here.
                        
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {file}")

replace_currency_symbol()
