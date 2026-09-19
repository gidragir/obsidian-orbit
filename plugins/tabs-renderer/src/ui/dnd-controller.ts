export interface DndControllerOptions {
  readonly onReorder: (fromIndex: number, toIndex: number) => void
}

export class DndController {
  private draggedIndex: number | null = null
  private readonly onReorder: (fromIndex: number, toIndex: number) => void

  constructor(options: DndControllerOptions) {
    this.onReorder = options.onReorder
  }

  onDragStart(e: DragEvent, tabIndex: number, el: HTMLElement, tabText: string): void {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', tabText)
      e.dataTransfer.effectAllowed = 'copy'
    }
    this.draggedIndex = tabIndex
    el.style.opacity = '0.9'
  }

  onDragOver(e: DragEvent, tabIndex: number, el: HTMLElement): void {
    e.preventDefault()
    if (this.draggedIndex === null || this.draggedIndex === tabIndex) {
      return
    }

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }

    el.classList.add('tabs-nav-item-dragover')
    const rect = el.getBoundingClientRect()
    const isAfter = e.clientX - rect.left > el.clientWidth * 0.5

    el.classList.toggle('tabs-nav-item-dragover-after', isAfter)
    el.classList.toggle('tabs-nav-item-dragover-before', !isAfter)
  }

  onDragLeave(el: HTMLElement): void {
    this.cleanupItemStyles(el)
  }

  onDrop(e: DragEvent, targetIndex: number, el: HTMLElement): void {
    e.preventDefault()
    this.cleanupItemStyles(el)
    el.style.opacity = ''

    if (this.draggedIndex === null || this.draggedIndex === targetIndex) {
      this.draggedIndex = null
      return
    }

    const rect = el.getBoundingClientRect()
    const isAfter = e.clientX - rect.left > el.clientWidth * 0.5
    let toIndex = isAfter ? targetIndex + 1 : targetIndex

    if (targetIndex > this.draggedIndex) {
      toIndex -= 1
    }

    const fromIndex = this.draggedIndex
    this.draggedIndex = null

    if (fromIndex !== toIndex) {
      this.onReorder(fromIndex, toIndex)
    }
  }

  private cleanupItemStyles(el: HTMLElement): void {
    el.classList.remove('tabs-nav-item-dragover')
    el.classList.remove('tabs-nav-item-dragover-before')
    el.classList.remove('tabs-nav-item-dragover-after')
  }
}
