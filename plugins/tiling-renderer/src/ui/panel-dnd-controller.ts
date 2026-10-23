import type { DropZonePosition } from '@packages/core'
import { computeDropZone2D, DndController } from '@packages/ui'

export const TILING_DND_MIME = 'application/x-orbit-tiling-panel'

const INDICATOR_CLS = 'orbit-tiling-drop-indicator'

export type PanelDndController = DndController<string, DropZonePosition>

export interface PanelDndOptions {
  readonly onMoveToPosition: (
    fromLeafId: string,
    toLeafId: string,
    position: DropZonePosition
  ) => void
}

export function createPanelDndController(options: PanelDndOptions): PanelDndController {
  return new DndController<string, DropZonePosition>({
    mime: TILING_DND_MIME,
    resolveZone: (e, panelEl) =>
      computeDropZone2D(panelEl.getBoundingClientRect(), e.clientX, e.clientY),
    showIndicator: (panelEl, zone) => {
      const indicator =
        panelEl.querySelector<HTMLElement>(`:scope > .${INDICATOR_CLS}`) ??
        panelEl.createDiv({ cls: INDICATOR_CLS })
      indicator.className = `${INDICATOR_CLS} zone-${zone}`
    },
    clearIndicator: (panelEl) => {
      panelEl.querySelector(`:scope > .${INDICATOR_CLS}`)?.remove()
    },
    onDrop: options.onMoveToPosition,
  })
}
