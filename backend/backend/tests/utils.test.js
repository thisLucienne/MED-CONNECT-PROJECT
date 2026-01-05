const CryptoUtils = require('../src/utils/crypto');
const JWTUtils = require('../src/utils/jwt');
const { ValidationService } = require('../src/utils/validators');

describe('Essential Tests', () => {
  describe('Password Security', () => {
    it('should hash and verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await CryptoUtils.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(await CryptoUtils.verifyPassword(password, hash)).toBe(true);
      expect(await CryptoUtils.verifyPassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('2FA Code Generation', () => {
    it('should generate valid 4-digit codes', () => {
      const code = CryptoUtils.generate2FACode();
      
      expect(code).toBeDefined();
      expect(code.length).toBe(4);
      expect(/^\d{4}$/.test(code)).toBe(true);
    });

    it('should handle expiry dates correctly', () => {
      const expiryDate = CryptoUtils.get2FAExpiryDate();
      const pastDate = new Date(Date.now() - 1000);
      const futureDate = new Date(Date.now() + 1000);
      
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now());
      expect(CryptoUtils.is2FACodeExpired(pastDate)).toBe(true);
      expect(CryptoUtils.is2FACodeExpired(futureDate)).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'PATIENT',
      status: 'ACTIVE'
    };

    it('should generate and verify JWT tokens', () => {
      const token = JWTUtils.generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(3); // JWT structure
      
      const decoded = JWTUtils.verifyToken(token);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should generate token pairs', () => {
      const tokens = JWTUtils.generateTokenPair(mockUser);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(JWTUtils.isAccessToken(tokens.accessToken)).toBe(true);
      expect(JWTUtils.isRefreshToken(tokens.refreshToken)).toBe(true);
    });

    it('should extract tokens from headers', () => {
      const token = 'test-token-123';
      const authHeader = `Bearer ${token}`;
      
      expect(JWTUtils.extractTokenFromHeader(authHeader)).toBe(token);
      expect(JWTUtils.extractTokenFromHeader('Invalid')).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should validate emails correctly', () => {
      const schema = require('joi').object({
        email: require('../src/utils/validators').customValidators.email
      });
      
      const validResult = ValidationService.validate({ email: 'test@example.com' }, schema);
      const invalidResult = ValidationService.validate({ email: 'invalid-email' }, schema);
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should validate passwords correctly', () => {
      const schema = require('joi').object({
        password: require('../src/utils/validators').customValidators.password
      });
      
      const strongResult = ValidationService.validate({ password: 'StrongPass123!' }, schema);
      const weakResult = ValidationService.validate({ password: 'weak' }, schema);
      
      expect(strongResult.isValid).toBe(true);
      expect(weakResult.isValid).toBe(false);
    });

    it('should validate Cameroonian phone numbers', () => {
      const schema = require('joi').object({
        phone: require('../src/utils/validators').customValidators.phone
      });
      
      const validResult = ValidationService.validate({ phone: '6 12 34 56 78' }, schema);
      const invalidResult = ValidationService.validate({ phone: '712345678' }, schema);
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should validate license numbers with letters and numbers', () => {
      const schema = require('joi').object({
        licenseNumber: require('../src/utils/validators').customValidators.licenseNumber
      });
      
      const validResult = ValidationService.validate({ licenseNumber: 'MED-2024/001' }, schema);
      const invalidResult = ValidationService.validate({ licenseNumber: 'AB' }, schema); // Trop court
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should validate file uploads', () => {
      const validFile = { mimetype: 'image/jpeg', size: 1024 * 1024 };
      const oversizedFile = { mimetype: 'image/jpeg', size: 10 * 1024 * 1024 };
      const invalidFile = { mimetype: 'application/pdf', size: 1024 };
      
      expect(ValidationService.validateFile(validFile).isValid).toBe(true);
      expect(ValidationService.validateFile(oversizedFile).isValid).toBe(false);
      expect(ValidationService.validateFile(invalidFile).isValid).toBe(false);
    });

    it('should sanitize search terms', () => {
      const dangerous = '<script>alert("xss")</script>';
      const sanitized = ValidationService.sanitizeSearchTerm(dangerous);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('(');
      expect(sanitized).not.toContain(')');
    });
  });
});