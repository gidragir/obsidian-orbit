export class DomInteractionAdapter {
  private readonly onActivityCallback: () => void
  private isAttached = false
  private readonly handler: (event: Event) => void

  constructor(onActivity: () => void) {
    this.onActivityCallback = onActivity
    this.handler = () => {
      this.onActivityCallback()
    }
  }

  attach(): void {
    if (this.isAttached || typeof window === 'undefined') {
      return
    }

    const options: AddEventListenerOptions = { passive: true, capture: true }
    window.addEventListener('keydown', this.handler, options)
    window.addEventListener('pointerdown', this.handler, options)
    window.addEventListener('input', this.handler, options)
    this.isAttached = true
  }

  detach(): void {
    if (!this.isAttached || typeof window === 'undefined') {
      return
    }

    window.removeEventListener('keydown', this.handler, true)
    window.removeEventListener('pointerdown', this.handler, true)
    window.removeEventListener('input', this.handler, true)
    this.isAttached = false
  }
}
