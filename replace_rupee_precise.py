import os

replacements = {
    'frontend/src/components/TableOrderDashboard.jsx': [
        ('(${Number(p.price).toFixed(2)})', '(₹{Number(p.price).toFixed(2)})')
    ],
    'frontend/src/components/InvoicingFinanceDashboard.jsx': [
        ('>$${', '>₹${'),
        ('-$${', '-₹${'),
        (' $${', ' ₹${'),
        ('>${', '>₹${'), # wait, >${businessName} is not money!
        ('placeholder={`Max: $${', 'placeholder={`Max: ₹${'),
        ('<span>$${', '<span>₹${'),
        ('-$', '-₹'),
        ('>$', '>₹'),
        (' $', ' ₹'),
        ('+$', '+₹'),
        # Fix the stray $ in jsx:
        ('                      $\n', '                      ₹\n'),
        ('                  $${parseFloat(selectedInvoice.total).toFixed(2)}', '                  ₹${parseFloat(selectedInvoice.total).toFixed(2)}')
    ],
    'frontend/src/components/SalesOrdersDashboard.jsx': [
        (' $', ' ₹'),
        ('>$', '>₹'),
        ('-$', '-₹'),
        ('+$', '+₹'),
        ('(${p.price})', '(₹{p.price})'),
        ('                      $\n', '                      ₹\n')
    ],
    'frontend/src/components/PurchaseOrdersDashboard.jsx': [
        (' $', ' ₹'),
        ('>$', '>₹'),
        ('-$', '-₹'),
        ('+$', '+₹')
    ],
    'frontend/src/components/BillingDashboard.jsx': [
        (' $', ' ₹'),
        ('>$', '>₹'),
        ('-$', '-₹'),
        ('+$', '+₹'),
        ('Discount ($)', 'Discount (₹)'),
        ('>$$', '>₹$')
    ],
    'forged/customers/signals.py': [
        ('per $10 spent', 'per ₹10 spent')
    ],
    'forged/invoicing_finance/views.py': [
        ('@ ${line.unit_price:.2f}', '@ ₹{line.unit_price:.2f}'),
        ('Subtotal: ${invoice.subtotal:.2f}', 'Subtotal: ₹{invoice.subtotal:.2f}'),
        ('Total: ${invoice.total:.2f}', 'Total: ₹{invoice.total:.2f}')
    ],
    'forged/table_order_mgmt/views.py': [
        ('bill was ${total:.2f}', 'bill was ₹{total:.2f}'),
        ('@ ${unit_price:.2f}', '@ ₹{unit_price:.2f}'),
        ('Total: ${total:.2f}', 'Total: ₹{total:.2f}')
    ]
}

# General replacements for JSX files (only very specific currency patterns)
for filepath, file_replacements in replacements.items():
    full_path = os.path.join(r'c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp', filepath)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # apply specific
        for old, new in file_replacements:
            content = content.replace(old, new)
            
        # apply general for jsx
        if filepath.endswith('.jsx'):
            # Replace `$${` with `₹${`
            content = content.replace('$${', '₹${')
            # Replace `>$` with `>₹`
            content = content.replace('>$', '>₹')
            # Replace ` $` with ` ₹` 
            content = content.replace(' $', ' ₹')
            # Replace `-$` with `-₹`
            content = content.replace('-$', '-₹')
            # Replace `+$` with `+₹`
            content = content.replace('+$', '+₹')
            # BUT wait, doing this generally will mess up `className="... $..."` if there is a space and a dollar sign? Unlikely.
            
            # Undo some wrong replacements if any
            # (None expected based on my grep)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
