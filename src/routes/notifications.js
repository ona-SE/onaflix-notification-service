const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

const router = express.Router();

// In-memory notification store
const notifications = [];

router.post('/send', async (req, res) => {
  const { userId, type, title, body, channel } = req.body;

  if (!userId || !type || !title) {
    return res.status(400).json({ error: 'userId, type, and title are required' });
  }

  const notification = {
    id: uuidv4(),
    userId,
    type,
    title,
    body: body || '',
    channel: channel || 'in-app',
    status: 'pending',
    createdAt: new Date().toISOString(),
    sentAt: null,
  };

  notifications.push(notification);

  // Dispatch based on channel
  try {
    switch (notification.channel) {
      case 'email':
        await sendEmail(notification);
        break;
      case 'push':
        await sendPush(notification);
        break;
      case 'webhook':
        await sendWebhook(notification);
        break;
      default:
        // in-app: just store it
        break;
    }
    notification.status = 'sent';
    notification.sentAt = new Date().toISOString();
  } catch (err) {
    console.error('Failed to send notification:', err.message);
    notification.status = 'failed';
  }

  res.status(201).json(notification);
});

router.get('/', (req, res) => {
  const { userId, status } = req.query;
  let result = [...notifications];

  if (userId) {
    result = result.filter(n => n.userId === userId);
  }
  if (status) {
    result = result.filter(n => n.status === status);
  }

  res.json({ notifications: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const notification = notifications.find(n => n.id === req.params.id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json(notification);
});

// Uses URL constructor instead of removed punycode module
function validateEmailDomain(email) {
  const domain = email.split('@')[1];
  if (!domain) return false;
  try {
    const parsed = new URL(`https://${domain}`);
    return parsed.hostname.length > 0;
  } catch (err) {
    return false;
  }
}

async function sendWebhook(notification) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  const parsed = new URL(webhookUrl);
  if (parsed.protocol !== 'https:') {
    console.warn('Webhook URL is not HTTPS');
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'notification',
      data: notification,
    }),
  });
}

async function sendEmail(notification) {
  const emailPayload = {
    to: notification.userId,
    subject: notification.title,
    html: notification.body,
  };

  const encoded = Buffer.from(JSON.stringify(emailPayload)).toString('base64');
  console.log(`Email queued: ${encoded.substring(0, 20)}...`);
}

async function sendPush(notification) {
  console.log(`Push notification sent to ${notification.userId}: ${notification.title}`);
}

module.exports = router;
module.exports.validateEmailDomain = validateEmailDomain;
