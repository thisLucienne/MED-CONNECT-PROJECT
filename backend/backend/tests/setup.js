// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'xwXn2A9Ruqf9tQv1iQ1l1aKu94zNnczE3PHuU9E0M9x1wZqFfZc8VnM7yX8JYJfP'
process.env.BCRYPT_ROUNDS = '4'; // Réduire pour les tests (plus rapide)
process.env['2FA_CODE_EXPIRY_MINUTES'] = '10';
process.env.MAX_LOGIN_ATTEMPTS = '3';
process.env.LOCKOUT_TIME_MINUTES = '30';

// Configuration DB pour les tests (utiliser une DB de test ou mock)
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'test_db';

// Désactiver les logs pendant les tests
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Restaurer les logs après les tests si nécessaire
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
});