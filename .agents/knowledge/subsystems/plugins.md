# Подсистема: Plugins (L1)

## Назначение
Модуль и компоненты директории plugins

## Ключевые файлы и точки входа
- Директория: `plugins`

## Контракты и зависимости
- Теги: plugins

## Как тестировать и проверять
- Проверьте сборку и запуск тестов для данного модуля.

## Новые функции и изменения
### TilingSyncService
- **Конструктор**: Теперь принимает дополнительный параметр `syncTextOrder` (по умолчанию `true`), который определяет, следует ли синхронизировать порядок секций в тексте заметки с порядком панелей в тайлинг-вью.
- **Методы**:
  - `setSyncTextOrder(syncTextOrder: boolean)`: Устанавливает значение `syncTextOrder`.
  - `getSyncTextOrder(): boolean`: Возвращает текущее значение `syncTextOrder`.
  - `syncSectionsToTree(tree: TileNode): TileNode`: Синхронизирует секции документа с деревом панелей.
  - `serialize(tree?: TileNode | null): string`: Сериализует дерево панелей в строку. Если `syncTextOrder` установлен в `false`, порядок секций в тексте сохраняется.

### Настройки
- **TilingSettings**: Добавлен новый параметр `syncTextOrder` (по умолчанию `true`), который определяет, следует ли синхронизировать порядок секций в тексте заметки с порядком панелей в тайлинг-вью.
- **Настройки интерфейса**: Добавлен новый переключатель "Sync note text order" в настройках плагина, который позволяет включать или отключать синхронизацию порядка секций.

### Обновления в плагинах
- **HTML Renderer**:
  - Обновлен `minAppVersion` до `1.13.0`.
  - Обновлены настройки, добавлен метод `getControlValue` для управления настройками.
- **Tabs Renderer**:
  - Обновлен `minAppVersion` до `1.13.0`.
  - Обновлены настройки, добавлен метод `getControlValue` для управления настройками.

### Другие изменения
- **data.json**: Обновлен параметр `panelGap` и добавлен параметр `syncTextOrder` в настройках тайлинг-рендера.
- **main.ts**: Обновлен конструктор `TilingSyncService` для использования новых настроек.
- **tiling-sync-service.test.ts**: Добавлены тесты для проверки поведения синхронизации порядка секций.

## Пример использования
```typescript
// Создание экземпляра TilingSyncService с отключенной синхронизацией порядка секций
const service = new TilingSyncService(100, false);

// Загрузка документа
service.loadDocument('Sec 1\n\n***\n\nSec 2');

// Создание дерева панелей с переставленными листьями
const tree = {
  type: 'branch' as const,
  id: 'root',
  direction: 'column' as const,
  weight: 1,
  children: [
    { type: 'leaf' as const, id: 'leaf-1', sectionIndex: 1, weight: 1 },
    { type: 'leaf' as const, id: 'leaf-0', sectionIndex: 0, weight: 1 },
  ],
};

// Сериализация дерева панелей
const serialized = service.serialize(tree);
console.log(serialized); // Выведет: 'Sec 1\n\n***\n\nSec 2'
```
