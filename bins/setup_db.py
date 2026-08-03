import os
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forged.settings')
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_j6gGZEK2Fdkz@ep-winter-flower-ax4kw0g0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'

import django
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model

print("Running migrations on the cloud PostgreSQL database...")
try:
    call_command('migrate')
except Exception as e:
    print(f"Migration failed: {e}")

User = get_user_model()
username = 'admin'
email = 'admin@nexuserp.com'
password = 'password123'

if not User.objects.filter(username=username).exists():
    print("Creating default admin account...")
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Success! Admin created.\nUsername: {username}\nPassword: {password}")
else:
    print("Admin user already exists.")
