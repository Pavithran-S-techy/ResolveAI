from django.db.models import Count
from rest_framework import viewsets,status
from rest_framework.decorators import api_view,permission_classes,action
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializer
from .services.gemini_service import analyze_ticket,generate_reply,GeminiServiceError
class TicketViewSet(viewsets.ModelViewSet):
    queryset=Ticket.objects.all()
    serializer_class=TicketSerializer
    def get_permissions(self):
        return [AllowAny()] if self.action=="create" else [IsAuthenticated()]
    def perform_create(self,serializer):
        ticket=serializer.save()
        try:
            result=analyze_ticket(ticket.subject,ticket.description)
            for key,value in result.items(): setattr(ticket,key,value)
            ticket.save()
        except GeminiServiceError:
            ticket.summary="AI analysis unavailable. Please review this ticket manually."
            ticket.save(update_fields=["summary","updated_at"])
    @action(detail=True,methods=["post"],url_path="generate-reply")
    def generate_reply_action(self,request,pk=None):
        ticket=self.get_object()
        try:
            ticket.suggested_response=generate_reply(ticket)
            ticket.save(update_fields=["suggested_response","updated_at"])
            return Response({"suggested_response":ticket.suggested_response})
        except GeminiServiceError as e:
            return Response({"error":str(e)},status=status.HTTP_503_SERVICE_UNAVAILABLE)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    qs=Ticket.objects.all()
    statuses={x["status"]:x["count"] for x in qs.values("status").annotate(count=Count("id"))}
    return Response({"total_tickets":qs.count(),"open_tickets":statuses.get("open",0),
    "in_progress_tickets":statuses.get("in_progress",0),"resolved_tickets":statuses.get("resolved",0),
    "closed_tickets":statuses.get("closed",0),"high_priority_tickets":qs.filter(priority="high").count(),
    "status_stats":[{"status":k,"count":v} for k,v in statuses.items()],
    "category_stats":list(qs.values("category").annotate(count=Count("id")).order_by("-count")),
    "priority_stats":list(qs.values("priority").annotate(count=Count("id")).order_by("-count")),
    "recent_tickets":TicketSerializer(qs[:5],many=True).data})
