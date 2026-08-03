import os

files_to_check = [
    'frontend/src/components/TableOrderDashboard.jsx',
    'frontend/src/components/InvoicingFinanceDashboard.jsx',
    'frontend/src/components/SalesOrdersDashboard.jsx',
    'frontend/src/components/PurchaseOrdersDashboard.jsx',
    'frontend/src/components/BillingDashboard.jsx',
    'forged/customers/signals.py',
    'forged/invoicing_finance/views.py',
    'forged/table_order_mgmt/views.py'
]

for filepath in files_to_check:
    full_path = os.path.join(r'c:\Users\91940\Downloads\@ COLLAGE\LJIET\CASE1_Project\anti_nexuserp', filepath)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if '$' in line and 'Bearer ${' not in line and '`$' not in line:
                if '${API_BASE}' not in line and '${token}' not in line and '${themeColor}' not in line:
                    if '`px-4' not in line and '`w-full' not in line and '${isActive' not in line:
                        if '${table.is_occupied' not in line and '${activeTable' not in line:
                            print(f'{filepath}:{i+1}: {line.strip()}')
