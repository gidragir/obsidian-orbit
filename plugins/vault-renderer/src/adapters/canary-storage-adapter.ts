import { CANARY_STORAGE_KEY, type CanaryRecord, parseCanaryRecord } from '@core/crash-canary'

export class CanaryStorageAdapter {
  private readonly storageKey: string

  constructor(storageKey = CANARY_STORAGE_KEY) {
    this.storageKey = storageKey
  }

  getCanary(): CanaryRecord {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return parseCanaryRecord(null)
      }
      const raw = window.localStorage.getItem(this.storageKey)
      if (!raw) {
        return parseCanaryRecord(null)
      }
      return parseCanaryRecord(JSON.parse(raw))
    } catch {
      return parseCanaryRecord(null)
    }
  }

  setCanary(record: CanaryRecord): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(record))
      }
    } catch (error) {
      console.warn('[vault-renderer] Could not write canary to localStorage:', error)
    }
  }

  clearCanary(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey)
      }
    } catch (error) {
      console.warn('[vault-renderer] Could not clear canary from localStorage:', error)
    }
  }
}
