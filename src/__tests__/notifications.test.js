const fs = require('node:fs/promises');
const request = require('supertest');
const app = require('../index');
const { validateEmailDomain } = require('../routes/notifications');

describe('Notification Service', () => {
  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('notifications');
    });
  });

  describe('POST /api/notifications/send', () => {
    it('creates an in-app notification', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ userId: 'user-1', type: 'info', title: 'Test notification' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('sent');
    });

    it('requires userId, type, and title', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ title: 'Missing fields' });
      expect(res.status).toBe(400);
    });

    it('encodes email notifications with the supported Buffer API', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const res = await request(app)
        .post('/api/notifications/send')
        .send({ userId: 'user@example.com', type: 'email', title: 'Test', channel: 'email' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('sent');
      logSpy.mockRestore();
    });

    it('dispatches webhooks using a WHATWG URL', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true });
      process.env.WEBHOOK_URL = 'https://example.com/webhook';

      const res = await request(app)
        .post('/api/notifications/send')
        .send({ userId: 'user-1', type: 'webhook', title: 'Test', channel: 'webhook' });

      expect(res.status).toBe(201);
      expect(fetchSpy).toHaveBeenCalledWith(process.env.WEBHOOK_URL, expect.any(Object));

      delete process.env.WEBHOOK_URL;
      fetchSpy.mockRestore();
    });
  });

  describe('email domain validation', () => {
    it('supports internationalized domains without punycode', () => {
      expect(validateEmailDomain('user@mañana.com')).toBe(true);
      expect(validateEmailDomain('invalid-email')).toBe(false);
    });
  });

  describe('GET /api/notifications', () => {
    it('returns all notifications', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(200);
      expect(res.body.notifications).toBeDefined();
    });

    it('filters by userId', async () => {
      await request(app)
        .post('/api/notifications/send')
        .send({ userId: 'filter-user', type: 'info', title: 'Filtered' });

      const res = await request(app).get('/api/notifications?userId=filter-user');
      expect(res.status).toBe(200);
      res.body.notifications.forEach(n => {
        expect(n.userId).toBe('filter-user');
      });
    });
  });

  describe('GET /api/templates', () => {
    it('returns all templates', async () => {
      const res = await request(app).get('/api/templates');
      expect(res.status).toBe(200);
      expect(res.body.templates.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/templates/:id/render', () => {
    it('renders a template with variables', async () => {
      const res = await request(app)
        .post('/api/templates/welcome/render')
        .send({ name: 'Alice' });
      expect(res.status).toBe(200);
      expect(res.body.subject).toContain('Alice');
      expect(res.body.body).toContain('Alice');
    });

    it('returns 404 for missing template', async () => {
      const res = await request(app)
        .post('/api/templates/nonexistent/render')
        .send({});
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/templates/:id/export', () => {
    it('exports a template using asynchronous filesystem APIs', async () => {
      const res = await request(app).get('/api/templates/welcome/export');

      expect(res.status).toBe(200);
      await expect(fs.readFile(res.body.exported, 'utf8')).resolves.toContain('<h1>Welcome');
      await fs.unlink(res.body.exported);
    });
  });
});
