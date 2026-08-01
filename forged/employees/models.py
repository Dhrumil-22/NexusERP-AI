from mongoengine import Document, StringField, DateField

class Employee(Document):
    business_id = StringField(required=True)
    name = StringField(required=True, max_length=255)
    role = StringField(required=True, max_length=100)
    phone = StringField(max_length=50)
    hire_date = DateField()

    meta = {'collection': 'employees'}
