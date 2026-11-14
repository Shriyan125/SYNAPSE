import { userRepository } from '../repositories/user.repository.js';
import { providerRepository } from '../repositories/provider.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { passwordUtils } from '../utils/password.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/tokens.js';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../utils/errors.js';
import { cache } from '../utils/cache.js';

export const authService = {
  /**
   * Register a new user (patient or provider)
   */
  async register(params) {
    const fullName = params.fullName || params.full_name;
    const email = params.email;
    const password = params.password;
    const role = params.role || 'user';
    const phone = params.phone || null;
    const avatarUrl = params.avatarUrl || params.avatar_url || null;
    const specialty = params.specialty || null;
    const bio = params.bio || null;
    const experienceYears = params.experienceYears ?? params.experience_years ?? 0;
    const consultationFee = params.consultationFee ?? params.consultation_fee ?? 0;

    // Check if email already registered
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await passwordUtils.hashPassword(password);
    const user = await userRepository.create({
      fullName,
      email,
      passwordHash,
      role,
      phone,
      avatarUrl,
    });

    // If role is provider, create the provider profile
    if (role === 'provider') {
      await providerRepository.create({
        userId: user.id,
        bio: bio || '',
        specialty: specialty || 'General Practice',
        experienceYears: Number(experienceYears) || 0,
        consultationFee: Number(consultationFee) || 0,
      });
      // Invalidate providers cache
      cache.del('providers:list');
    }

    // Generate tokens
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  /**
   * Login user with email & password
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await passwordUtils.comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // If provider, fetch provider details
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await providerRepository.findByUserId(user.id);
    }

    // Generate tokens
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        provider: providerProfile,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  /**
   * Rotate refresh token and issue new access token
   */
  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token was not provided.');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await refreshTokenRepository.findValid(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token is invalid, expired, or has been revoked.');
    }

    const user = await userRepository.findById(storedToken.user_id);
    if (!user) {
      throw new UnauthorizedError('Associated user account no longer exists.');
    }

    // Revoke old refresh token (token rotation)
    await refreshTokenRepository.revoke(tokenHash);

    // Issue new pair
    const newAccessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  },

  /**
   * Revoke token upon user logout
   */
  async logout(rawRefreshToken, userId) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await refreshTokenRepository.revoke(tokenHash);
    } else if (userId) {
      await refreshTokenRepository.revokeAllForUser(userId);
    }
  },
};
