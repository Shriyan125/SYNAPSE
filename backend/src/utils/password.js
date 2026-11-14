import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash plain text password using bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password with hashed password
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const passwordUtils = {
  hashPassword,
  comparePassword,
};
