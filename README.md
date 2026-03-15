# OnaFlix Notification Service

Notification service for the OnaFlix platform. Handles email, push, webhook, and in-app notifications with Handlebars templates.

## Stack

- **Runtime:** Node.js 20
- **Framework:** Express 4
- **Templates:** Handlebars
- **HTTP Client:** node-fetch 2
- **Email:** nodemailer

## Setup

```bash
nvm use 20
npm install
npm run dev
```

## API Endpoints

- `POST /api/notifications/send` -- Send a notification
- `GET /api/notifications` -- List notifications (filter by userId, status)
- `GET /api/notifications/:id` -- Get notification by ID
- `GET /api/templates` -- List notification templates
- `GET /api/templates/:id` -- Get template by ID
- `POST /api/templates/:id/render` -- Render template with variables
- `GET /api/templates/:id/export` -- Export template as HTML file
- `GET /health` -- Health check

## Testing

```bash
npm test
```
