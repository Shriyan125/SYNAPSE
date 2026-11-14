import { userRepository } from '../repositories/user.repository.js';
import { providerRepository } from '../repositories/provider.repository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { cache } from '../utils/cache.js';
import { cloudinaryService } from '../config/cloudinary.js';

export const userService = {
  /**
   * Get currently authenticated user profile
   */
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let provider = null;
    if (user.role === 'provider') {
      provider = await providerRepository.findByUserId(userId);
    }

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      provider,
    };
  },

  /**
   * Update current user profile
   */
  async updateMe(userId, { fullName, phone, avatarUrl, bio, specialty, consultationFee, experienceYears }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.update(userId, {
      fullName,
      phone,
      avatarUrl,
    });

    let updatedProvider = null;
    if (user.role === 'provider') {
      const currentProvider = await providerRepository.findByUserId(userId);
      if (currentProvider) {
        updatedProvider = await providerRepository.update(currentProvider.id, {
          bio,
          specialty,
          consultationFee: consultationFee !== undefined ? Number(consultationFee) : undefined,
          experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
        });
        // Invalidate providers cache
        cache.del('providers:list');
      }
    }

    return {
      id: updatedUser.id,
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatarUrl: updatedUser.avatar_url,
      updatedAt: updatedUser.updated_at,
      provider: updatedProvider,
    };
  },

  /**
   * Upload user avatar to Cloudinary and update profile
   */
  async uploadAvatar(userId, file) {
    if (!file || !file.buffer) {
      throw new BadRequestError('No image file provided. Please attach an image under field "avatar".');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Upload buffer to Cloudinary
    const result = await cloudinaryService.uploadToCloudinary(file.buffer, {
      public_id: `avatar_${userId}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    const updatedUser = await userRepository.update(userId, {
      avatarUrl: result.secure_url,
    });

    return {
      avatarUrl: result.secure_url,
      publicId: result.public_id,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatar_url,
      },
    };
  },
};
