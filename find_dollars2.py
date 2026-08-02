import os
import re

for d in ['frontend/src/components', 'forged']:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.jsx', '.py')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Special cases where $ is followed by { but we still want to replace it:
                # Actually, in JSX, if we have {product.name} (${Number...})
                # The $ is followed by {. But wait, in python we can just check if the string contains $
                # Let's replace $ with ₹ everywhere EXCEPT where it's part of a template literal `${`
                
                # A template literal is `${`
                # So we want to replace `$` that is NOT followed by `{`
                # And what about `$${`? We want to replace the first `$` and keep `${`
                
                # regex logic: replace all `$` not followed by `{`
                # and also replace `$` that is followed by `{` ONLY IF it's preceded by `>` or `(` or ` ` or `"` or `'`
                
                # But it's easier to just do a simple search and replace where needed.
                # Let's see all lines with `$`
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if '$' in line:
                        # Print only if it has a $ that is not part of `${` OR if it has `$${` OR if it's `(${` or `> $`
                        # This will help me see where they are
                        if re.search(r'\$(?!\{)', line) or re.search(r'[\s>\(]\$\{', line) or '$${' in line:
                            print(f"{filepath}:{i+1}: {line.strip()}")
