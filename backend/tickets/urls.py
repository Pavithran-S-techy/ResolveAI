
from django.urls import path

from .views import (
    TicketListCreateView,
    TicketDetailView,
    GenerateReplyView,
    DashboardView,
    SendReplyView
)


urlpatterns = [

    # List all tickets and create a ticket
    path(
        "tickets/",
        TicketListCreateView.as_view(),
        name="ticket-list-create"
    ),

    # Retrieve, update and delete a ticket
    path(
        "tickets/<uuid:pk>/",
        TicketDetailView.as_view(),
        name="ticket-detail"
    ),

    # Generate a suggested reply
    path(
        "tickets/<uuid:pk>/generate-reply/",
        GenerateReplyView.as_view(),
        name="generate-reply"
    ),

    # Dashboard statistics
    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard"
    ),

    path(
    "tickets/<uuid:pk>/send-reply/",
    SendReplyView.as_view(),
    name="send-reply"
),

]
