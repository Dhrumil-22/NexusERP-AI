from mongoengine import Document, EmbeddedDocument, StringField, ListField, BooleanField, EmbeddedDocumentListField

FIELD_TYPES = ('text', 'number', 'dropdown', 'date', 'boolean', 'textarea')
WIDGET_TYPES = ('bar_chart', 'line_chart', 'stat_card', 'list', 'table')

class FormField(EmbeddedDocument):
    name = StringField(required=True)
    label = StringField(required=True)
    type = StringField(required=True, choices=FIELD_TYPES)
    required = BooleanField(default=False)
    options = ListField(StringField())  # For dropdown options

class FormDefinition(EmbeddedDocument):
    form_id = StringField(required=True)
    fields = EmbeddedDocumentListField(FormField)

class DashboardWidget(EmbeddedDocument):
    widget_id = StringField(required=True)
    type = StringField(required=True, choices=WIDGET_TYPES)

class ModuleManifest(Document):
    module_id = StringField(required=True, unique=True)
    version = StringField(required=True)
    depends_on = ListField(StringField())
    permissions = ListField(StringField())
    forms = EmbeddedDocumentListField(FormDefinition)
    dashboard_widgets = EmbeddedDocumentListField(DashboardWidget)
    api_routes = ListField(StringField())

    meta = {'collection': 'module_registry'}

    @classmethod
    def register_manifest(cls, manifest_dict):
        """
        Validates a manifest dict against these models and saves it.
        """
        manifest = cls(**manifest_dict)
        manifest.validate()
        
        # Replace if exists
        existing = cls.objects(module_id=manifest.module_id).first()
        if existing:
            existing.delete()
            
        manifest.save()
        return manifest
