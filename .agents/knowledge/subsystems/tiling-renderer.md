# Подсистема: tiling-renderer (L1)

> **Идентификатор:** `tiling-renderer`
> **Теги:** plugins, tiling, obsidian, hyprland | **Объем:** ~12000 токенов BPE

## 🎯 Назначение и роль
Плагин Obsidian для плиточного отображения Markdown-заметок (Tiling Layout) с возможностью двухмерного сплита, Drag & Drop, навигацией и ресайзом в стиле Hyprland / i3wm.

## 📁 Точки входа и структура файлов

| Файл | Описание |
| :--- | :--- |
| `plugins/tiling-renderer/package.json` | Манифест пакета плагина |
| `plugins/tiling-renderer/manifest.json` | Манифест плагина для Obsidian |
| `plugins/tiling-renderer/src/main.ts` | Точка входа плагина, команды Hyprland навигации, регистрация представления |
| `plugins/tiling-renderer/src/ui/tiling-view.ts` | Основное интерактивное представление плиточного лейаута (`ItemView`) |
| `plugins/tiling-renderer/src/ui/tiling-panel-renderer.ts` | Рендерер DOM-дерева ветвей, панелей и действий разделения/закрытия |
| `plugins/tiling-renderer/src/ui/panel-dnd-controller.ts` | Контроллер перетаскивания и сброса панелей |
| `plugins/tiling-renderer/src/services/tiling-sync-service.ts` | Доменный менеджер секций заметки (`TilingDocumentStore`) |
| `plugins/tiling-renderer/src/settings/types.ts` | Интерфейс настроек и значения по умолчанию `DEFAULT_SETTINGS` |
| `plugins/tiling-renderer/src/settings/settings-tab.ts` | Декларативная панель настроек плагина (`DeclarativePluginSettingTab`) |
| `plugins/tiling-renderer/src/styles.css` | Стили плагина с подключением общих переменных `@packages/ui` |

## 🔑 Ключевой контракт и зависимости
- `@packages/core`: Структура дерева `TileNode`, геометрия сплитов, нормализованные прямоугольники и пространственная навигация.
- `@packages/adapters`: `DebouncedWorkspaceFileAdapter` для отложенного сохранения и синхронизации с открытыми `MarkdownView`, `DeclarativePluginSettingTab` для настроек.
- `@packages/ui`: `CodeEditor` для редактирования Markdown в панелях, `attachSplitterDrag` для разделителей, `attachInternalLinkHandler` для ссылок, `computeDropZone2D` для зон сброса DND.
- `@packages/ports`: `TilingLayoutHost`, интерфейсы секций документа `DocumentSection`.

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter obsidian-tiling-renderer build
```
