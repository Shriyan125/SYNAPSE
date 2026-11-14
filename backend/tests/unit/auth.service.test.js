import { jest } from '@jest/globals';
import { authService } from '../../src/services/auth.service.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { providerRepository } from '../../src/repositories/provider.repository.js';
import { refreshTokenRepository } from '../../src/repositories/refreshToken.repository.js';
import { passwordUtils } from '../../src/utils/password.js';

describe('AuthService (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictError if email is already in use', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({ id: 1, email: 'taken@example.com' });

      await expect(
        authService.register({
          fullName: 'Test User',
          email: 'taken@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('An account with this email address already exists.');
    });

    it('should successfully register a patient and return user with tokens', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce({
        id: 42,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        phone: null,
        avatar_url: null,
      });
      jest.spyOn(refreshTokenRepository, 'create').mockResolvedValueOnce({ id: 1 });

      const result = await authService.register({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('john@example.com');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should register a provider and create a provider profile', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce({
        id: 50,
        full_name: 'Dr. Test',
        email: 'doc@example.com',
        role: 'provider',
      });
      const providerCreateSpy = jest.spyOn(providerRepository, 'create').mockResolvedValueOnce({ id: 10 });
      jest.spyOn(refreshTokenRepository, 'create').mockResolvedValueOnce({ id: 1 });

      const result = await authService.register({
        fullName: 'Dr. Test',
        email: 'doc@example.com',
        password: 'Password123!',
        role: 'provider',
        specialty: 'Pediatrics',
        consultationFee: 120,
      });

      expect(providerCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 50,
          specialty: 'Pediatrics',
          consultationFee: 120,
        })
      );
      expect(result.user.role).toBe('provider');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError when user is not found', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: 'ghost@example.com', password: 'Password123!' })
      ).rejects.toThrow('Invalid email or password.');
    });

    it('should throw UnauthorizedError when password does not match', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: 1,
        email: 'valid@example.com',
        password_hash: 'hashed',
      });
      jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValueOnce(false);

      await expect(
        authService.login({ email: 'valid@example.com', password: 'WrongPassword!' })
      ).rejects.toThrow('Invalid email or password.');
    });

    it('should successfully log in with valid credentials', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: 1,
        full_name: 'Alice',
        email: 'alice@example.com',
        password_hash: 'hashed',
        role: 'user',
      });
      jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValueOnce(true);
      jest.spyOn(refreshTokenRepository, 'create').mockResolvedValueOnce({ id: 1 });

      const result = await authService.login({
        email: 'alice@example.com',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('alice@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
