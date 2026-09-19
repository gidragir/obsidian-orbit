export interface HTMLRendererSettings {
  autoHeight: boolean
  defaultHeight: number
  allowScripts: boolean
  allowForms: boolean
  allowPopups: boolean
  allowModals: boolean
  inheritObsidianTheme: boolean
}

export const DEFAULT_SETTINGS: HTMLRendererSettings = {
  autoHeight: true,
  defaultHeight: 300,
  allowScripts: true,
  allowForms: true,
  allowPopups: false,
  allowModals: true,
  inheritObsidianTheme: true,
}
