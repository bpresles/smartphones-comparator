import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "../../config/configuration";
import { CacheEntry, CacheStats } from "../interfaces/smartphone.interface";

@Injectable()
export class CacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cacheTtl: number;

  constructor(private readonly configService: ConfigService<Configuration>) {
    this.cacheTtl = this.configService.get("cache")?.ttl * 1000 || 300000; // Convert to milliseconds
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.cacheTtl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.cacheTtl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    // Clean expired entries before getting stats
    this.cleanExpiredEntries();

    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get cache size
   */
  size(): number {
    this.cleanExpiredEntries();
    return this.cache.size;
  }

  /**
   * Clean expired entries from cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTtl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache TTL in milliseconds
   */
  getTtl(): number {
    return this.cacheTtl;
  }

  /**
   * Get or set cached data with a fallback function
   */
  async getOrSet<T>(key: string, fallbackFn: () => Promise<T>): Promise<T> {
    const cachedData = this.get<T>(key);

    if (cachedData !== null) {
      return cachedData;
    }

    const freshData = await fallbackFn();
    this.set(key, freshData);
    return freshData;
  }
}
