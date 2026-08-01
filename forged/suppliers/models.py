from mongoengine import Document, StringField, ListField

class Supplier(Document):
    business_id = StringField(required=True)
    name = StringField(required=True, max_length=255)
    phone = StringField(max_length=50)
    items_supplied = ListField(StringField())
    notes = StringField()

    meta = {'collection': 'suppliers'}
