export interface TabsSettings {
  split: string
  defaultTabNavItem: string
  defaultTabContent: string
  actionButtonType: 'action-none' | 'action-add' | 'action-edit'
  ignoreNotice: boolean
  autorefreshMarkdownView: boolean
  dragAndDrop: boolean

  // default editor settings
  doubleClickToEdit: boolean
  showToolbar: boolean
  tabSize: number
  editorAutoSaveInterval: number

  // default style settings
  defaultTabsBorder: 'border-none' | 'border-hover' | 'border-always'
  defaultTabsBorderColor: string
  hideTabsEditBlockButton: boolean

  defaultTitlePosition: 'top' | 'bottom' | 'left' | 'right'
  defaultTitleLineClamp: 'one' | 'multi'
  defaultTitleLimited: boolean

  defaultTabsContentsPadding: string
  defaultTabsContentsMaxHeight: string
}

export const DEFAULT_SETTINGS: TabsSettings = {
  split: 'tab: ',
  defaultTabNavItem: 'New tab',
  defaultTabContent: 'New tab content',
  actionButtonType: 'action-add',
  ignoreNotice: false,
  autorefreshMarkdownView: true,
  dragAndDrop: false,

  doubleClickToEdit: false,
  showToolbar: true,
  tabSize: 4,
  editorAutoSaveInterval: 5000,

  defaultTabsBorder: 'border-hover',
  defaultTabsBorderColor: 'var(--background-modifier-border)',
  hideTabsEditBlockButton: true,

  defaultTitleLineClamp: 'one',
  defaultTitlePosition: 'top',
  defaultTitleLimited: false,

  defaultTabsContentsPadding: '1em 2em',
  defaultTabsContentsMaxHeight: 'none',
}
