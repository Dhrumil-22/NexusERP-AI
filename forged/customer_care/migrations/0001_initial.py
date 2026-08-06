import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('forged_auth', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportTicket',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('message', models.TextField()),
                ('ai_response', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('open', 'Open'), ('resolved', 'Resolved')], default='open', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='support_tickets', to='forged_auth.business')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
