
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def send_mail(recipient, subject, context, template):

    html_content = render_to_string(template, context)

    email = EmailMultiAlternatives(
        subject=subject,
        body="Thank you for contacting ResolveAI. Please view this email in an HTML-compatible email client.",
        from_email=settings.EMAIL_HOST_USER,
        to=[recipient]
    )

    email.attach_alternative(
        html_content,
        mimetype="text/html"
    )

    return email.send()
