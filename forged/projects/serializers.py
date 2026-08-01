from rest_framework import serializers
from .models import Project, Task, TimeEntry

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['tenant_id', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['tenant_id', 'created_at']

class TimeEntrySerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source='task.name', read_only=True)
    project_name = serializers.CharField(source='task.project.name', read_only=True)

    class Meta:
        model = TimeEntry
        fields = '__all__'
        read_only_fields = ['tenant_id', 'created_at']
