import { jest } from '@jest/globals';
import { userService } from '../../src/services/user.service.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { cloudinaryService } from '../../src/config/cloudinary.js';
import { BadRequestError, NotFoundError } from '../../src/utils/errors.js';

describe('UserService (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadAvatar', () => {
    it('should throw BadRequestError if file is missing', async () => {
      await expect(userService.uploadAvatar(1, null)).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(null);

      await expect(
        userService.uploadAvatar(999, { buffer: Buffer.from('fake image') })
      ).rejects.toThrow(NotFoundError);
    });

    it('should upload avatar to Cloudinary and update user profile', async () => {
      const mockUser = {
        id: 1,
        full_name: 'Dr. Sarah Smith',
        email: 'sarah@example.com',
        avatar_url: null,
      };

      const mockCloudinaryResult = {
        secure_url: 'https://res.cloudinary.com/synapse/image/upload/v12345/avatar_1.jpg',
        public_id: 'avatar_1_12345',
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(cloudinaryService, 'uploadToCloudinary').mockResolvedValueOnce(mockCloudinaryResult);
      jest.spyOn(userRepository, 'update').mockResolvedValueOnce({
        id: 1,
        full_name: 'Dr. Sarah Smith',
        email: 'sarah@example.com',
        avatar_url: mockCloudinaryResult.secure_url,
      });

      const result = await userService.uploadAvatar(1, {
        buffer: Buffer.from('image buffer content'),
      });

      expect(result.avatarUrl).toBe(mockCloudinaryResult.secure_url);
      expect(result.publicId).toBe(mockCloudinaryResult.public_id);
      expect(result.user.avatarUrl).toBe(mockCloudinaryResult.secure_url);
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        avatarUrl: mockCloudinaryResult.secure_url,
      });
    });
  });
});
