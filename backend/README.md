# ResolveAI backend reconstruction

Django REST Framework + MySQL + Gemini. Customer ticket submission is public; ticket management and dashboard require JWT authentication.

## Setup
1. Open terminal in backend folder.
2. `python -m venv env`
3. `env\\Scripts\\activate`
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env`; fill MySQL credentials and Gemini API key. Never share or commit `.env`.
6. Ensure MySQL database `resolveai_db` exists with utf8mb4.
7. Run:
   `python manage.py makemigrations tickets authentication`
   `python manage.py migrate`
   `python manage.py createsuperuser`
   `python manage.py runserver`

If reusing your old database, back it up first. This is a clean reconstruction and its migrations differ from the deleted project. Do not drop the database or delete migration records to fix migration errors.

## Endpoints
Public: `POST /api/tickets/` with customer_name, customer_email, subject, description.

Authenticated (header `Authorization: Bearer <access>`):
- `GET /api/tickets/`
- `GET /api/tickets/<uuid>/`
- `PATCH /api/tickets/<uuid>/`
- `PUT /api/tickets/<uuid>/`
- `DELETE /api/tickets/<uuid>/`
- `POST /api/tickets/<uuid>/generate-reply/`
- `GET /api/dashboard/`

Auth:
- `POST /api/auth/login/` body username/password; returns access, refresh and user role.
- `POST /api/auth/logout/` client should discard tokens.
- `GET /api/auth/profile/`
- `POST /api/auth/create-agent/` admin only; username/email/password.
- `POST /api/auth/token/refresh/`

Gemini analysis runs at ticket creation; if unavailable, ticket is still saved for manual review. Suggested replies are drafts only. Email sending is not implemented in this reconstruction.
