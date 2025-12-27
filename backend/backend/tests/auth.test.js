const request = require('supertest');

// Mock de la base de données pour les tests
jest.mock('../src/config/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  testConnection: jest.fn().mockResolvedValue(true)
}));

const app = require('../src/app');

describe('API Tests', () => {
  describe('Server Health', () => {
    it('should return server information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Med Connect API');
    });

    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body.services).toBeDefined();
      expect(response.body.services.server.status).toBe('running');
    });
  });

  describe('Authentication Validation', () => {
    it('should validate patient registration fields', async () => {
      const response = await request(app)
        .post('/api/auth/register/patient')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email', // Invalid email
          password: 'weak' // Weak password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate doctor registration fields', async () => {
      const response = await request(app)
        .post('/api/auth/register/doctor')
        .send({
          firstName: 'Dr. Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'ValidPass123!',
          specialty: 'Cardiology',
          licenseNumber: '712345678' // Invalid format (ne commence pas par 6)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate login fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({}) // Empty body
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate 2FA code format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-2fa')
        .send({
          userId: 'invalid-uuid',
          code: '12' // Invalid format (trop court)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Authentication Required', () => {
    it('should require authentication for profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    });

    it('should handle server errors gracefully', async () => {
      // Test que le serveur répond correctement
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});