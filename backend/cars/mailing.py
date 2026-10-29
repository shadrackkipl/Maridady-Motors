# cars/mailing.py
from django.conf import settings
from django.core.mail import EmailMessage

# Backends that do not really deliver email
TEST_BACKENDS = ("console", "locmem", "dummy", "filebased")


def email_delivery_is_real():
    """False while the project only prints emails to the console (development)."""
    mailers = getattr(settings, "MAILERS", None)
    if mailers:
        backend = mailers.get("default", {}).get("BACKEND", "")
    else:
        backend = getattr(settings, "EMAIL_BACKEND", "")
    return not any(name in backend for name in TEST_BACKENDS)


def _first_name(full_name):
    parts = (full_name or "").split()
    return parts[0] if parts else "there"


def send_announcement(subject, message, reps, sender):
    """
    Emails each representative separately, so one bad address does not stop
    the rest. Returns (sent_count, failures, recipient_lines).
    """
    sender_name = sender.get_full_name() or sender.get_username()
    reply_to = [sender.email] if sender.email else None

    sent = 0
    failures = []
    recipients = []

    for rep in reps:
        recipients.append(f"{rep.name} <{rep.email}>")
        body = (
            f"Hi {_first_name(rep.name)},\n\n"
            f"{message}\n\n"
            f"{sender_name}\n"
            "Maridady Motors"
        )
        email = EmailMessage(
            subject=subject, body=body, to=[rep.email], reply_to=reply_to
        )
        try:
            email.send()
            sent += 1
        except Exception as error:  # one failure must not stop the others
            failures.append(f"{rep.name} <{rep.email}>: {error}")

    return sent, failures, recipients