from rest_framework.test import APIClient
from typing import Any
client = APIClient()
response: Any = client.get('/')
print(response.data)
