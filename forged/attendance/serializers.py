from rest_framework import serializers
from .models import AttendanceRecord

class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee_id', 'employee_name', 'date',
            'clock_in', 'clock_out', 'status', 'notes'
        ]
        read_only_fields = ['id']
