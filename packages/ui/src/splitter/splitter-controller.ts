import { clampRatio } from '@packages/core'

export type SplitterOrientation = 'column' | 'row' | 'horizontal' | 'vertical'

export interface SplitterDragConfig {
  readonly splitterEl: HTMLElement
  readonly orientation: SplitterOrientation | boolean
  readonly getTarget: () => {
    readonly prevEl: HTMLElement
    readonly nextEl: HTMLElement
    readonly prevWeight: number
    readonly nextWeight: number
  } | null
  readonly onResize: (newPrevWeight: number, newNextWeight: number) => void
  readonly onComplete?: () => void
  readonly minRatio?: number
  readonly maxRatio?: number
}

/**
 * Attaches pointer drag handlers to a splitter element to resize adjacent panes.
 * Returns a cleanup function to safely unbind listeners.
 */
export function attachSplitterDrag(config: SplitterDragConfig): () => void {
  const {
    splitterEl,
    orientation,
    getTarget,
    onResize,
    onComplete,
    minRatio = 0.1,
    maxRatio = 0.9,
  } = config

  const isCol = orientation === true || orientation === 'column' || orientation === 'vertical'

  let activePointerMove: ((e: PointerEvent) => void) | null = null
  let activePointerUp: (() => void) | null = null

  const cleanWindowListeners = () => {
    if (activePointerMove) {
      window.removeEventListener('pointermove', activePointerMove)
      activePointerMove = null
    }
    if (activePointerUp) {
      window.removeEventListener('pointerup', activePointerUp)
      activePointerUp = null
    }
    splitterEl.removeClass('is-dragging')
    document.body.style.cursor = ''
  }

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    cleanWindowListeners()

    const target = getTarget()
    if (!target) return

    const { prevEl, nextEl, prevWeight, nextWeight } = target
    const prevRect = prevEl.getBoundingClientRect()
    const nextRect = nextEl.getBoundingClientRect()
    const totalDimension = isCol
      ? prevRect.width + nextRect.width
      : prevRect.height + nextRect.height

    if (totalDimension <= 0) return

    splitterEl.addClass('is-dragging')
    document.body.style.cursor = isCol ? 'col-resize' : 'row-resize'

    const startCoord = isCol ? e.clientX : e.clientY
    const initialPrevDimension = isCol ? prevRect.width : prevRect.height
    const combinedWeight = prevWeight + nextWeight
    const totalWeight = combinedWeight > 0 ? combinedWeight : 2

    activePointerMove = (moveEvt: PointerEvent) => {
      const currentCoord = isCol ? moveEvt.clientX : moveEvt.clientY
      const delta = currentCoord - startCoord
      const targetDimension = initialPrevDimension + delta

      const rawRatio = targetDimension / totalDimension
      const ratio = clampRatio(rawRatio, minRatio, maxRatio)

      const newPrevWeight = totalWeight * ratio
      const newNextWeight = totalWeight * (1 - ratio)

      prevEl.style.flex = `${newPrevWeight} 1 0`
      nextEl.style.flex = `${newNextWeight} 1 0`

      onResize(newPrevWeight, newNextWeight)
    }

    activePointerUp = () => {
      cleanWindowListeners()
      onComplete?.()
    }

    window.addEventListener('pointermove', activePointerMove)
    window.addEventListener('pointerup', activePointerUp)
    window.addEventListener('pointercancel', activePointerUp)
  }

  splitterEl.addEventListener('pointerdown', onPointerDown)

  return () => {
    splitterEl.removeEventListener('pointerdown', onPointerDown)
    cleanWindowListeners()
  }
}
