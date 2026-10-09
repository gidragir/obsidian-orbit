import type { DropZonePosition } from '@packages/core'

export const TILING_DND_MIME = 'application/x-orbit-tiling-panel'

export interface PanelDndOptions {
  readonly onMoveToPosition: (
    fromLeafId: string,
    toLeafId: string,
    position: DropZonePosition
  ) => void
}

export class PanelDndController {
  private draggedLeafId: string | null = null
  private currentDropZone: DropZonePosition = 'center'
  private indicatorEl: HTMLElement | null = null
  private readonly onMoveToPosition: (
    fromLeafId: string,
    toLeafId: string,
    position: DropZonePosition
  ) => void

  constructor(options: PanelDndOptions) {
    this.onMoveToPosition = options.onMoveToPosition
  }

  onDragStart(e: DragEvent, leafId: string, panelEl: HTMLElement): void {
    this.draggedLeafId = leafId
    panelEl.addClass('is-dragging')
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      // Use custom MIME type instead of 'text/plain' to prevent browsers/editors from inserting leafId into text
      e.dataTransfer.setData(TILING_DND_MIME, leafId)
    }
  }

  onDragOver(e: DragEvent, targetLeafId: string, panelEl: HTMLElement): void {
    e.preventDefault()
    e.stopPropagation()
    if (this.draggedLeafId === null || this.draggedLeafId === targetLeafId) {
      return
    }

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }

    const rect = panelEl.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height

    let zone: DropZonePosition = 'center'
    if (relY < 0.25) {
      zone = 'top'
    } else if (relY > 0.75) {
      zone = 'bottom'
    } else if (relX < 0.25) {
      zone = 'left'
    } else if (relX > 0.75) {
      zone = 'right'
    }

    this.currentDropZone = zone
    this.showIndicator(panelEl, zone)
  }

  onDragLeave(_panelEl: HTMLElement): void {
    this.hideIndicator()
  }

  onDrop(e: DragEvent, targetLeafId: string, _panelEl: HTMLElement): void {
    e.preventDefault()
    e.stopPropagation()
    this.hideIndicator()

    if (this.draggedLeafId === null || this.draggedLeafId === targetLeafId) {
      this.draggedLeafId = null
      return
    }

    const fromId = this.draggedLeafId
    const zone = this.currentDropZone
    this.draggedLeafId = null

    this.onMoveToPosition(fromId, targetLeafId, zone)
  }

  onDragEnd(panelEl: HTMLElement): void {
    panelEl.removeClass('is-dragging')
    this.hideIndicator()
    this.draggedLeafId = null
  }

  private showIndicator(panelEl: HTMLElement, zone: DropZonePosition): void {
    if (!this.indicatorEl) {
      this.indicatorEl = panelEl.createDiv({
        cls: 'orbit-tiling-drop-indicator',
      })
    } else if (this.indicatorEl.parentElement !== panelEl) {
      panelEl.appendChild(this.indicatorEl)
    }

    this.indicatorEl.className = `orbit-tiling-drop-indicator zone-${zone}`
  }

  private hideIndicator(): void {
    if (this.indicatorEl) {
      this.indicatorEl.remove()
      this.indicatorEl = null
    }
  }
}
