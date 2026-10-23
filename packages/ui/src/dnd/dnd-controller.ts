export interface DndControllerOptions<TId extends string | number, TZone> {
  /** Custom MIME type so editors never treat the payload as droppable text. */
  readonly mime: string
  readonly draggingClass?: string
  readonly resolveZone: (e: DragEvent, targetEl: HTMLElement, fromId: TId, targetId: TId) => TZone
  readonly showIndicator: (targetEl: HTMLElement, zone: TZone) => void
  readonly clearIndicator: (targetEl: HTMLElement) => void
  readonly onDrop: (fromId: TId, toId: TId, zone: TZone) => void
}

/**
 * Shared drag&drop session logic: tracks the dragged item, resolves the drop zone
 * and drives the indicator. Layout specifics are injected via options.
 */
export class DndController<TId extends string | number, TZone> {
  private draggedId: TId | null = null
  private zone: TZone | null = null
  private indicatorTarget: HTMLElement | null = null
  private sourceEl: HTMLElement | null = null
  private readonly draggingClass: string
  private readonly options: DndControllerOptions<TId, TZone>

  constructor(options: DndControllerOptions<TId, TZone>) {
    this.options = options
    this.draggingClass = options.draggingClass ?? 'is-dragging'
  }

  onDragStart(e: DragEvent, id: TId, sourceEl: HTMLElement): void {
    this.draggedId = id
    this.sourceEl = sourceEl
    sourceEl.classList.add(this.draggingClass)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData(this.options.mime, String(id))
    }
  }

  onDragOver(e: DragEvent, targetId: TId, targetEl: HTMLElement): void {
    if (this.draggedId === null) {
      return
    }
    e.preventDefault()
    e.stopPropagation()

    if (this.draggedId === targetId) {
      this.clearIndicator()
      return
    }

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }

    if (this.indicatorTarget && this.indicatorTarget !== targetEl) {
      this.options.clearIndicator(this.indicatorTarget)
    }
    this.zone = this.options.resolveZone(e, targetEl, this.draggedId, targetId)
    this.indicatorTarget = targetEl
    this.options.showIndicator(targetEl, this.zone)
  }

  onDragLeave(e: DragEvent, targetEl: HTMLElement): void {
    // dragleave also fires when the pointer moves onto a child of the target
    if (e.relatedTarget instanceof Node && targetEl.contains(e.relatedTarget)) {
      return
    }
    if (this.indicatorTarget === targetEl) {
      this.clearIndicator()
    }
  }

  onDrop(e: DragEvent, targetId: TId): void {
    if (this.draggedId === null) {
      return
    }
    e.preventDefault()
    e.stopPropagation()

    const fromId = this.draggedId
    const zone = this.zone
    this.reset()

    if (fromId !== targetId && zone !== null) {
      this.options.onDrop(fromId, targetId, zone)
    }
  }

  onDragEnd(): void {
    this.reset()
  }

  private reset(): void {
    this.clearIndicator()
    this.sourceEl?.classList.remove(this.draggingClass)
    this.sourceEl = null
    this.draggedId = null
    this.zone = null
  }

  private clearIndicator(): void {
    if (this.indicatorTarget) {
      this.options.clearIndicator(this.indicatorTarget)
      this.indicatorTarget = null
    }
  }
}
