import { Menu } from 'obsidian'

export function generateMarkdownTable(rows: number, cols: number): string {
  let header = '|'
  let separator = '|'
  for (let j = 0; j < cols; j++) {
    header += ' Header |'
    separator += ' --- |'
  }
  let body = ''
  for (let i = 0; i < rows; i++) {
    let row = '|'
    for (let j = 0; j < cols; j++) {
      row += '  |'
    }
    body += `${row}\n`
  }
  return `\n${header}\n${separator}\n${body}`
}

export class TableMenu extends Menu {
  private readonly onSelectTable: (rows: number, cols: number) => void

  constructor(onSelectTable: (rows: number, cols: number) => void) {
    super()
    this.onSelectTable = onSelectTable
    this.addItem((item) => item.setDisabled(true))
  }

  onload(): void {
    super.onload()
    const menuEl = (this as unknown as { dom?: HTMLElement }).dom
    if (!menuEl) {
      return
    }

    const containerEl = menuEl.createDiv({
      cls: 'table-generator-container',
    })
    const counter = menuEl.createDiv({
      cls: 'table-generator-counter menu-item',
    })

    this.buildGrid(containerEl, counter)
  }

  private buildGrid(containerEl: HTMLElement, counter: HTMLElement): void {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const gridEl = containerEl.createDiv({
          cls: 'table-generator-grid',
        })
        gridEl.addEventListener('click', () => {
          this.onSelectTable(i + 1, j + 1)
          this.hide()
        })
        gridEl.addEventListener('mouseenter', () => {
          counter.textContent = `${i + 1} rows ${j + 1} columns`
        })
      }
    }
  }
}
