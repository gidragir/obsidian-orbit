# Подсистема: Packages (L1)

## Назначение
Модуль и компоненты директории packages

## Ключевые файлы и точки входа
- Директория: `packages`

## Контракты и зависимости
- Теги: packages

## Как тестировать и проверять
- Проверьте сборку и запуск тестов для данного модуля.

## Новые функции и изменения
### Функция `reindexTreeLeaves`
- **Описание**: Переиндексирует все листья в дереве в порядке обхода, начиная с 0.
- **Использование**: Добавлена в файл `packages/core/src/tiling-tree.ts`.
- **Тестирование**: Добавлен тест в файл `packages/core/src/tiling-tree.test.ts`, который проверяет, что функция корректно переиндексирует листья после обмена их местами.

```typescript
// Пример использования функции reindexTreeLeaves
const tree = createDefaultTree(3);
const swapped = swapLeavesById(tree, 'leaf-0', 'leaf-2');
const reindexed = reindexTreeLeaves(swapped);
const leaves = getAllLeaves(reindexed);
console.log(leaves.map((l) => l.sectionIndex)); // [0, 1, 2]
```

### Функция `reconcileTreeWithSections`
- **Описание**: Согласовывает существующее дерево с целевым количеством разделов, добавляя или удаляя листья при необходимости, сохраняя геометрию и веса существующего макета.
- **Использование**: Добавлена в файл `packages/core/src/tiling-tree.ts`.
- **Тестирование**: Добавлены тесты в файл `packages/core/src/tiling-tree.test.ts`, которые проверяют добавление новых листьев при увеличении количества разделов и удаление лишних листьев при их уменьшении.

```typescript
// Пример использования функции reconcileTreeWithSections
const tree = createDefaultTree(2);
const reconciled = reconcileTreeWithSections(tree, 4);
const leaves = getAllLeaves(reconciled);
console.log(leaves.map((l) => l.sectionIndex)); // [0, 1, 2, 3]
```

### Другие изменения
- **Файл**: `packages/core/src/tiling-tree.test.ts`
  - **Изменения**: Добавлены тесты для функций `reindexTreeLeaves` и `reconcileTreeWithSections`.

- **Файл**: `packages/core/src/tiling-tree.ts`
  - **Изменения**: Добавлены функции `reindexTreeLeaves` и `reconcileTreeWithSections`.

## Архитектурные изменения
- **Файл**: `packages/core/src/tiling-tree.ts`
  - **Изменения**: Добавлены функции `reindexTreeLeaves` и `reconcileTreeWithSections`.

## Дополнительные конфигурации
- **Файл**: `packages/core/src/tiling-tree.test.ts`
  - **Изменения**: Добавлены тесты для функций `reindexTreeLeaves` и `reconcileTreeWithSections`.

## Команды
- **Команда**: `npm run build`
  - **Описание**: Собирает проект.
- **Команда**: `npm run test`
  - **Описание**: Запускает тесты.
