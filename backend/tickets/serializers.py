from rest_framework import serializers
from .models import Ticket
class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model=Ticket
        fields=["id","customer_name","customer_email","subject","description","category","intent","summary","sentiment","priority","status","suggested_response","created_at","updated_at"]
        read_only_fields=["id","category","intent","summary","sentiment","priority","suggested_response","created_at","updated_at"]
    def validate_customer_name(self,v):
        if not v.strip(): raise serializers.ValidationError("Customer name is required.")
        return v.strip()
    def validate_subject(self,v):
        if not v.strip(): raise serializers.ValidationError("Subject is required.")
        return v.strip()
    def validate_description(self,v):
        if not v.strip(): raise serializers.ValidationError("Description is required.")
        return v.strip()
