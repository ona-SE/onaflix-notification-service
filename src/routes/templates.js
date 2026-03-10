const express = require('express');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// In-memory template store
const templates = new Map([
  ['welcome', {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to OnaFlix, {{name}}!',
    body: '<h1>Welcome, {{name}}!</h1><p>Start exploring movies today.</p>',
  }],
  ['new-release', {
    id: 'new-release',
    name: 'New Release Alert',
    subject: 'New on OnaFlix: {{movieTitle}}',
    body: '<h1>{{movieTitle}}</h1><p>{{movieDescription}}</p><p>Rating: {{rating}}/10</p>',
  }],
  ['password-reset', {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset your OnaFlix password',
    body: '<p>Click <a href="{{resetUrl}}">here</a> to reset your password. This link expires in {{expiryHours}} hours.</p>',
  }],
]);

router.get('/', (req, res) => {
  res.json({ templates: Array.from(templates.values()) });
});

router.get('/:id', (req, res) => {
  const template = templates.get(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

router.post('/:id/render', (req, res) => {
  const template = templates.get(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  try {
    const subjectTemplate = Handlebars.compile(template.subject);
    const bodyTemplate = Handlebars.compile(template.body);

    res.json({
      subject: subjectTemplate(req.body),
      body: bodyTemplate(req.body),
    });
  } catch (err) {
    res.status(400).json({ error: 'Template rendering failed: ' + err.message });
  }
});

// Deprecated: fs.exists (should use fs.access or fs.stat)
router.get('/:id/export', (req, res) => {
  const template = templates.get(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const exportDir = path.join('/tmp', 'template-exports');
  fs.exists(exportDir, (exists) => {
    if (!exists) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${template.id}.html`);
    fs.writeFileSync(filePath, template.body);
    res.json({ exported: filePath });
  });
});

module.exports = router;
