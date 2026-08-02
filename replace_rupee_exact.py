import os

replacements = {
    'frontend/src/components/TableOrderDashboard.jsx': [
        ('(${Number(p.price).toFixed(2)})', '(₹{Number(p.price).toFixed(2)})')
    ],
    'frontend/src/components/InvoicingFinanceDashboard.jsx': [
        ('>$${', '>₹${'),
        ('-$${', '-₹${'),
        ('>$${parseFloat(l.unit_price).toFixed(2)}', '>₹${parseFloat(l.unit_price).toFixed(2)}'),
        ('>$${(parseFloat(l.quantity) * parseFloat(l.unit_price)).toFixed(2)}', '>₹${(parseFloat(l.quantity) * parseFloat(l.unit_price)).toFixed(2)}'),
        ('<span>$${parseFloat(selectedInvoice.total).toFixed(2)}</span>', '<span>₹${parseFloat(selectedInvoice.total).toFixed(2)}</span>'),
        ('-$${(parseFloat(selectedInvoice.total)', '-₹${(parseFloat(selectedInvoice.total)'),
        ('<span>$${calculateBalance(selectedInvoice).toFixed(2)}</span>', '<span>₹${calculateBalance(selectedInvoice).toFixed(2)}</span>'),
        ('-$${', '-₹${'),
        ('+$${', '+₹${'),
        ('                  $${parseFloat(selectedInvoice.total).toFixed(2)}\n', '                  ₹${parseFloat(selectedInvoice.total).toFixed(2)}\n'),
        ('placeholder={`Max: $${', 'placeholder={`Max: ₹${'),
        ('+$${parseFloat(p.amount).toFixed(2)}', '+₹${parseFloat(p.amount).toFixed(2)}'),
        ('                      $\n', '                      ₹\n')
    ],
    'frontend/src/components/SalesOrdersDashboard.jsx': [
        ('x $', 'x ₹'),
        ('                      $\n', '                      ₹\n'),
        ('>${parseFloat(selectedOrder.total).toFixed(2)}', '>₹{parseFloat(selectedOrder.total).toFixed(2)}'),
        ('(${p.price})', '(₹{p.price})'),
        ('>${parseFloat(order.total).toFixed(2)}', '>₹{parseFloat(order.total).toFixed(2)}')
    ],
    'frontend/src/components/PurchaseOrdersDashboard.jsx': [
        # wait, grep earlier didn't find any currency $ here except maybe inside string?
        # Let's skip PurchaseOrders since it might not have any
    ],
    'frontend/src/components/BillingDashboard.jsx': [
        ('>${parseFloat(inv.total).toFixed(2)}', '>₹{parseFloat(inv.total).toFixed(2)}'),
        ('                      $\n', '                      ₹\n'),
        ('Discount ($)', 'Discount (₹)'),
        ('>$$', '>₹$'), # >$${
        ('<span>${subtotal.toFixed(2)}</span>', '<span>₹{subtotal.toFixed(2)}</span>'),
        ('<span>${tax.toFixed(2)}</span>', '<span>₹{tax.toFixed(2)}</span>'),
        ('>${total.toFixed(2)}<', '>₹{total.toFixed(2)}<'),
        ('<span>-${Number(formData.discount).toFixed(2)}</span>', '<span>-₹{Number(formData.discount).toFixed(2)}</span>')
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

for filepath, file_replacements in replacements.items():
    full_path = os.path.join(r'c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp', filepath)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in file_replacements:
            content = content.replace(old, new)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
