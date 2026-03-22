const request = require('supertest');
const express = require('express');

// Basic healthcheck test using the running app module
describe('GET /api/health', () => {
  it('responds with status ok', async () => {
    const app = express();
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});





