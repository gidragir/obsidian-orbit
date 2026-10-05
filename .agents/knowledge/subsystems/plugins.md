# Подсистема: Plugins (L1)

## Назначение
Модуль и компоненты директории plugins

## Ключевые файлы и точки входа
- Директория: `plugins`

## Контракты и зависимости
- Теги: plugins

## Как тестировать и проверять
- Проверьте сборку и запуск тестов для данного модуля.

## Недавние изменения

### Плагин `html-renderer`
- **package.json**: Добавлены зависимости `@codemirror/state` и `@codemirror/view`.
- **src/main.ts**: Обновлен метод `registerMarkdownCodeBlockProcessor` для передачи дополнительных параметров в `HTMLRenderChild`.
- **src/styles.css**: Импортирован файл стилей из `@packages/ui`.
- **src/ui/html-render-child.ts**: Добавлены новые импорты и параметры конструктора, включая `app`, `plugin`, `sectionInfo`, и другие зависимости.

### Плагин `snippet-renderer`
- **package.json**: Добавлены зависимости `@codemirror/state` и `@codemirror/view`.
