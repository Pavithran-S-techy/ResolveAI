import uuid
from django.db import models
class Ticket(models.Model):
    CATEGORIES=[(x,x.replace("_"," ").title()) for x in ["uncategorized","payment","refund","order","delivery","return","product","account","technical","subscription","security","service","other"]]
    PRIORITIES=[("low","Low"),("medium","Medium"),("high","High")]
    STATUSES=[("open","Open"),("in_progress","In Progress"),("resolved","Resolved"),("closed","Closed")]
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    customer_name=models.CharField(max_length=120)
    customer_email=models.EmailField()
    subject=models.CharField(max_length=200)
    description=models.TextField()
    category=models.CharField(max_length=30,choices=CATEGORIES,default="uncategorized")
    intent=models.CharField(max_length=120,blank=True)
    summary=models.TextField(blank=True)
    sentiment=models.CharField(max_length=20,blank=True)
    priority=models.CharField(max_length=10,choices=PRIORITIES,default="medium")
    status=models.CharField(max_length=20,choices=STATUSES,default="open")
    suggested_response=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["-created_at"]
    def __str__(self): return f"{self.subject} ({self.customer_email})"
