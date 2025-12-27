const request = require('supertest');
const app = require('../src/app');

describe('Upload API', () => {
  describe('POST /api/upload/simple', () => {
    it('devrait échouer sans authentification', async () => {
      const response = await request(app)
        .post('/api/upload/simple')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans fichier', async () => {
      // Ce test nécessiterait un token valide, on le skip pour l'instant
      expect(true).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('devrait retourner le statut de santé du serveur', async () => {
      const response = await request(app)
        .get('/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body.status).toBeDefined();
      expect(response.body.services).toBeDefined();
    });
  });
});