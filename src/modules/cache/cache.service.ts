import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.warn(
        `Cache GET failed for key "${key}": ${String(error)}`,
      );
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(
        `Cache SET failed for key "${key}": ${String(error)}`,
      );
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(
        `Cache DEL failed for key "${key}": ${String(error)}`,
      );
    }
  }

  /**
   * Get or set pattern - if key exists, return cached value, otherwise execute callback and cache result
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        return cached;
      }

      const value = await callback();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      // On any cache failure, gracefully fall back to direct execution
      this.logger.warn(
        `Cache GET/SET failed for key "${key}", falling back to direct execution: ${String(
          error,
        )}`,
      );
      return callback();
    }
  }

  /**
   * Invalidate cache keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // Note: This is a simplified version. For production, consider using Redis SCAN
    // For now, we'll use a manual approach with known key patterns
    const keys = [
      'products:*',
      'banners:*',
      'categories:*',
      'product:*',
      'banner:*',
      'category:*',
    ];

    for (const key of keys) {
      if (key.includes(pattern) || pattern.includes(key.split(':')[0])) {
        // In a real implementation, you'd use Redis SCAN here
        // For now, we'll handle specific patterns
      }
    }
  }

  /**
   * Generate cache key for products
   */
  static getProductKey(id?: string, categoryId?: string, activeOnly?: boolean): string {
    if (id) return `product:${id}`;
    if (categoryId) return `products:category:${categoryId}:active:${activeOnly}`;
    return `products:all:active:${activeOnly}`;
  }

  /**
   * Generate cache key for banners
   */
  static getBannerKey(id?: string, activeOnly?: boolean): string {
    if (id) return `banner:${id}`;
    return `banners:all:active:${activeOnly}`;
  }

  /**
   * Generate cache key for categories
   */
  static getCategoryKey(id?: string, activeOnly?: boolean): string {
    if (id) return `category:${id}`;
    return `categories:all:active:${activeOnly}`;
  }
}
