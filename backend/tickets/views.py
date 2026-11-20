
from django.db.models import Count

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Ticket
from .serializers import TicketSerializer

from .services.gemini_service import (
    analyze_ticket,
    generate_reply as create_suggested_reply,
    GeminiServiceError
)

from authentication.permissions import IsAdminRole,IsSupportRole

from . utils import send_mail

# 1. List all tickets and create a new ticket
class TicketListCreateView(generics.ListCreateAPIView):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def get_permissions(self):

        permissions = []

        if self.request.method == "POST":
            return [AllowAny()]

        else:

            permissions = [IsAdminRole|IsSupportRole]

        return [permission() for permission in permissions]

    def perform_create(self, serializer):

        # Save the ticket first
        ticket = serializer.save()

        # Analyse the ticket using Gemini
        try:
            result = analyze_ticket(
                ticket.subject,
                ticket.description
            )

            ticket.category = result["category"]
            ticket.intent = result["intent"]
            ticket.sentiment = result["sentiment"]
            ticket.priority = result["priority"]
            ticket.summary = result["summary"]

            ticket.save()

        except GeminiServiceError:

            ticket.summary = (
                "AI analysis unavailable. "
                "Please review this ticket manually."
            )

            ticket.save(update_fields=["summary", "updated_at"])


# 2. Retrieve, update and delete a ticket
class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAdminRole|IsSupportRole]


# 3. Generate a suggested reply using Gemini
class GenerateReplyView(generics.GenericAPIView):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAdminRole|IsSupportRole]

    def post(self, request, *args, **kwargs):

        # Get the ticket using its ID
        ticket = self.get_object()

        try:

            # Generate the suggested reply
            suggested_response = create_suggested_reply(ticket)

            # Save the suggested reply
            ticket.suggested_response = suggested_response

            ticket.save(
                update_fields=["suggested_response", "updated_at"]
            )

            return Response({
                "suggested_response": suggested_response
            })

        except GeminiServiceError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


# 4. Dashboard statistics
class DashboardView(generics.GenericAPIView):

    permission_classes = [IsAdminRole|IsSupportRole]

    def get(self, request):

        tickets = Ticket.objects.all()

        # Count tickets by status
        statuses = {
            item["status"]: item["count"]
            for item in tickets.values("status").annotate(
                count=Count("id")
            )
        }

        # Count tickets by category
        category_statistics = list(
            tickets.values("category").annotate(
                count=Count("id")
            ).order_by("-count")
        )

        # Count tickets by priority
        priority_statistics = list(
            tickets.values("priority").annotate(
                count=Count("id")
            ).order_by("-count")
        )

        return Response({

            "total_tickets": tickets.count(),

            "high_priority_tickets": tickets.filter(
                priority="high"
            ).count(),

            "status_statistics": {
                "open": statuses.get("open", 0),
                "in_progress": statuses.get("in_progress", 0),
                "resolved": statuses.get("resolved", 0),
                "closed": statuses.get("closed", 0),
            },

            "category_statistics": category_statistics,

            "priority_statistics": priority_statistics,

        })


class SendReplyView(generics.GenericAPIView):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAdminRole | IsSupportRole]

    def post(self, request, *args, **kwargs):

        ticket = self.get_object()

        customer_name = ticket.customer_name
        ticket_subject = ticket.subject
        reply_content = ticket.suggested_response

        if not reply_content or not reply_content.strip():

            return Response(
                {"error": "Please generate a reply before sending."},
                status=status.HTTP_400_BAD_REQUEST
            )

        recipient = ticket.customer_email
        subject = f"Re: {ticket.subject}"

        context = {
            "customer_name": customer_name,
            "ticket_subject": ticket_subject,
            "reply_content": reply_content
        }

        template = "emails/reply_email.html"

        try:

            # Send email to customer
            email_sent = send_mail(
                recipient,
                subject,
                context,
                template
            )

            if email_sent:

                return Response(
                    {"msg": "Response sent successfully."},
                    status=status.HTTP_200_OK
                )

            return Response(
                {"error": "Unable to send the email."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except Exception:

            return Response(
                {"error": "An error occurred while sending the email."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
