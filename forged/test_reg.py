import urllib.request
import json
import re

req = urllib.request.Request(
    'https://nexuserp-ai.onrender.com/api/auth/register/', 
    data=json.dumps({'username': 'ceotp', 'password': 'password123', 'business_name': 'TestBiz'}).encode(), 
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print(res.read())
except urllib.error.HTTPError as e:
    html = e.read().decode()
    match = re.search(r'<textarea id="traceback_area".*?>(.*?)</textarea>', html, re.DOTALL)
    if match:
        tb = match.group(1).replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')
        print(tb)
    else:
        print('No traceback found', html)
