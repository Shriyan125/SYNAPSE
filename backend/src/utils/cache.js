import { logger } from '../config/logger.js';

class InMemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Get cached entry if present and not expired
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    logger.debug(`Cache HIT for key: ${key}`);
    return entry.value;
  }

  /**
   * Store an entry in cache with a TTL (seconds)
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   */
  set(key, value, ttlSeconds = 300) {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiry });
    logger.debug(`Cache SET for key: ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Delete specific key
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
    logger.debug(`Cache INVALIDATED for key: ${key}`);
  }

  /**
   * Invalidate all keys matching a prefix or pattern
   * @param {string} prefix
   */
  invalidatePrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    logger.info(`Cache invalidated ${count} entries with prefix: "${prefix}"`);
  }

  /**
   * Clear entire cache
   */
  flush() {
    this.store.clear();
    logger.info('Cache flushed entirely.');
  }
}

export const cache = new InMemoryCache();
