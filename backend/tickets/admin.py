from django.contrib import admin
from .models import Ticket
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display=("subject","customer_name","customer_email","category","priority","status","created_at")
    list_filter=("category","priority","status","sentiment")
    search_fields=("subject","customer_name","customer_email","description")
    readonly_fields=("id","created_at","updated_at")
