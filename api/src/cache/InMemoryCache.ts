import { CACHE_TTL, CACHE_SIZE } from '../config';

interface InMemoryCacheValue<V extends object> {
  addedAt: number;
  value: V;
}

export class InMemoryCache<V extends object> {
  private readonly cacheMap: Map<string, InMemoryCacheValue<V>> = new Map();
  private readonly cacheKeys: Array<string> = [];

  public get(key: string): V | null {
    const { addedAt = 0, value = null } = this.cacheMap.get(key) ?? {};

    if (Date.now() - addedAt < CACHE_TTL) {
      return value;
    }

    return null;
  }

  public set(key: string, value: V) {
    this.cacheMap.set(key, { addedAt: Date.now(), value });
    this.cacheKeys.push(key);

    this.clean();
  }

  public clean() {
    while (this.cacheKeys.length > CACHE_SIZE) {
      const key = this.cacheKeys.shift();

      key && this.cacheMap.delete(key);
    }
  }
}
