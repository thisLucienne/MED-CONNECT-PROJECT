const request = require('supertest');
const app = require('../src/app');

describe('API Routes Tests', () => {
  describe('Messages API', () => {
    it('devrait échouer sans authentification pour POST /api/messages', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          destinataireId: 'test-id',
          contenu: 'Test message'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/messages/conversations', async () => {
      const response = await request(app)
        .get('/api/messages/conversations')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour la recherche de médecins', async () => {
      const response = await request(app)
        .get('/api/messages/medecins/recherche')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Notifications API', () => {
    it('devrait échouer sans authentification pour GET /api/notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/notifications/count', async () => {
      const response = await request(app)
        .get('/api/notifications/count')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour marquer comme lue', async () => {
      const response = await request(app)
        .patch('/api/notifications/test-id/lu')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Dossiers API', () => {
    it('devrait échouer sans authentification pour POST /api/dossiers', async () => {
      const response = await request(app)
        .post('/api/dossiers')
        .send({
          titre: 'Test dossier',
          type: 'CONSULTATION'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/dossiers', async () => {
      const response = await request(app)
        .get('/api/dossiers')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour accéder à un dossier', async () => {
      const response = await request(app)
        .get('/api/dossiers/dossier/test-id')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Upload API', () => {
    it('devrait échouer sans authentification pour upload simple', async () => {
      const response = await request(app)
        .post('/api/upload/simple')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour upload avec progression', async () => {
      const response = await request(app)
        .post('/api/upload/progress')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin API', () => {
    it('devrait échouer sans authentification admin pour les statistiques', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification admin pour les médecins en attente', async () => {
      const response = await request(app)
        .get('/api/admin/doctors/pending')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('devrait retourner le statut de santé', async () => {
      const response = await request(app)
        .get('/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body.status).toBeDefined();
      expect(response.body.services).toBeDefined();
    });
  });

  describe('Route principale', () => {
    it('devrait retourner les informations de l\'API', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Med Connect API');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.messages).toBe('/api/messages');
      expect(response.body.endpoints.notifications).toBe('/api/notifications');
      expect(response.body.endpoints.dossiers).toBe('/api/dossiers');
      expect(response.body.endpoints.upload).toBe('/api/upload');
    });
  });

  describe('Routes non trouvées', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      const response = await request(app)
        .get('/api/route-inexistante')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});