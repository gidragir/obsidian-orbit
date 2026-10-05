# Подсистема: Packages (L1)

## Назначение
Модуль и компоненты директории packages

## Ключевые файлы и точки входа
- Директория: `packages`

## Контракты и зависимости
- Теги: packages

## Как тестировать и проверять
- Проверьте сборку и запуск тестов для данного модуля.

## Недавние изменения

### Изменения в `packages/ui/package.json`
- Добавлены зависимости:
  - `@codemirror/commands`
  - `@codemirror/lang-html`
  - `@codemirror/lang-markdown`
  - `@codemirror/language`
  - `@codemirror/state`
  - `@codemirror/view`
  - `@lezer/highlight`

### Изменения в `packages/ui/src/index.ts`
- Добавлены экспортные модули:
  - `./editor/code-editor`
  - `./editor/editor-toolbar`
  - `./editor/split-editor-modal`

### Изменения в `packages/ui/src/styles.css`
- Добавлены стили для:
  - `.orbit-split-editor-modal`
  - `.orbit-editor-top-bar`
  - `.orbit-editor-mode-switcher`
  - `.orbit-editor-mode-switcher button.clickable-icon`
  - `.orbit-editor-mode-switcher button.clickable-icon.is-active`
