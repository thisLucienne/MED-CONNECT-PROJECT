const request = require('supertest');
const app = require('../src/app');

describe('Nouvelles Fonctionnalités Med Connect', () => {
  describe('Connexions API', () => {
    it('devrait échouer sans authentification pour POST /api/connexions/demandes', async () => {
      const response = await request(app)
        .post('/api/connexions/demandes')
        .send({
          medecinId: 'test-id',
          message: 'Test demande'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/connexions/demandes/patient', async () => {
      const response = await request(app)
        .get('/api/connexions/demandes/patient')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/connexions/demandes/medecin', async () => {
      const response = await request(app)
        .get('/api/connexions/demandes/medecin')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Santé API', () => {
    it('devrait échouer sans authentification pour GET /api/sante/tableau-de-bord', async () => {
      const response = await request(app)
        .get('/api/sante/tableau-de-bord')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/sante/parametres', async () => {
      const response = await request(app)
        .get('/api/sante/parametres')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour PUT /api/sante/parametres', async () => {
      const response = await request(app)
        .put('/api/sante/parametres')
        .send({
          groupeSanguin: 'A+',
          poids: '70kg'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/sante/medecins-connectes', async () => {
      const response = await request(app)
        .get('/api/sante/medecins-connectes')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer sans authentification pour GET /api/sante/patients-connectes', async () => {
      const response = await request(app)
        .get('/api/sante/patients-connectes')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Route principale mise à jour', () => {
    it('devrait inclure les nouveaux endpoints dans la réponse', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.connexions).toBe('/api/connexions');
      expect(response.body.endpoints.sante).toBe('/api/sante');
    });
  });

  describe('Validation des nouvelles routes', () => {
    it('devrait retourner 401 pour une route connexion sans auth', async () => {
      const response = await request(app)
        .get('/api/connexions/route-inexistante')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 401 pour une route santé sans auth', async () => {
      const response = await request(app)
        .get('/api/sante/route-inexistante')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});