import { redo, undo } from '@codemirror/commands'
import type { EditorView } from '@codemirror/view'
import { getFormattedContent } from '@utils/text-format'
import { ButtonComponent } from 'obsidian'
import { generateMarkdownTable, TableMenu } from './table-menu'

export class EditorToolbar {
  private readonly toolbarEl: HTMLElement
  private readonly view: EditorView

  constructor(containerEl: HTMLElement, view: EditorView) {
    this.view = view
    this.toolbarEl = containerEl.createDiv({ cls: 'tabs-editor-toolbar' })
    this.buildTools()
  }

  private buildTools(): void {
    const historyGroup = this.toolbarEl.createDiv({ cls: 'toolbar-group' })
    this.createHistoryButtons(historyGroup)

    this.toolbarEl.createDiv({ cls: 'toolbar-divider' })

    const formatGroup = this.toolbarEl.createDiv({ cls: 'toolbar-group' })
    this.createFormatButtons(formatGroup)

    this.toolbarEl.createDiv({ cls: 'toolbar-divider' })

    const insertGroup = this.toolbarEl.createDiv({ cls: 'toolbar-group' })
    this.createInsertButtons(insertGroup)
  }

  private createHistoryButtons(parentEl: HTMLElement): void {
    new ButtonComponent(parentEl)
      .setIcon('undo')
      .setTooltip('Undo')
      .setClass('clickable-icon')
      .onClick(() => undo(this.view))

    new ButtonComponent(parentEl)
      .setIcon('redo')
      .setTooltip('Redo')
      .setClass('clickable-icon')
      .onClick(() => redo(this.view))
  }

  private createFormatButtons(parentEl: HTMLElement): void {
    new ButtonComponent(parentEl)
      .setIcon('bold')
      .setTooltip('Bold')
      .setClass('clickable-icon')
      .onClick(() => this.wrapSelection('**'))

    new ButtonComponent(parentEl)
      .setIcon('italic')
      .setTooltip('Italic')
      .setClass('clickable-icon')
      .onClick(() => this.wrapSelection('*'))

    new ButtonComponent(parentEl)
      .setIcon('strikethrough')
      .setTooltip('Strikethrough')
      .setClass('clickable-icon')
      .onClick(() => this.wrapSelection('~~'))
  }

  private createInsertButtons(parentEl: HTMLElement): void {
    new ButtonComponent(parentEl)
      .setIcon('code')
      .setTooltip('Code Block')
      .setClass('clickable-icon')
      .onClick(() => this.wrapSelection('`'))

    new ButtonComponent(parentEl)
      .setIcon('table')
      .setTooltip('Insert Table')
      .setClass('clickable-icon')
      .onClick((e: MouseEvent) => {
        const menu = new TableMenu((rows, cols) => {
          const tableMarkdown = generateMarkdownTable(rows, cols)
          const { from, to } = this.view.state.selection.main
          this.view.dispatch({
            changes: { from, to, insert: tableMarkdown },
          })
        })
        menu.showAtMouseEvent(e)
      })
  }

  private wrapSelection(format: string): void {
    const { from, to } = this.view.state.selection.main
    const text = this.view.state.doc.sliceString(from, to)
    const formatted = getFormattedContent(text, format)
    this.view.dispatch({
      changes: { from, to, insert: formatted },
    })
  }
}
