const request = require('supertest');
const app = require('../index');

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
});
