export class TabsCacheService {
  private readonly cache = new Map<string, number>()

  constructor() {
    this.cache.set('/', 0)
  }

  getActiveIndex(key: string): number {
    return this.cache.get(key) ?? 0
  }

  setActiveIndex(key: string, index: number): void {
    this.cache.set(key, index)
  }

  reset(): void {
    this.cache.clear()
    this.cache.set('/', 0)
  }
}
