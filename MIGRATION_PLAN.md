# План миграции и рефакторинга плагинов: Obsidian Orbit

Настоящий документ является нормативным планом выполнения работ (Implementation Plan) по переносу и рефакторингу сторонних плагинов из `reference/` в монорепозиторий `obsidian-orbit`.

---

## 1. Архитектурные требования и инварианты монорепозитория

Все изменения, вносимые в рамках миграции, обязаны строго соблюдать инварианты монорепозитория:

1. **Архитектурная изоляция (Ports & Adapters):**
   - Доменное ядро (`src/utils/`, `@packages/obsidian-utils`) имеет **0% зависимостей** от Obsidian API, Electron, DOM или Node.js runtime.
   - Слой адаптеров (`src/services/`, `src/ui/`, `src/main.ts`) инкапсулирует вызовы API Obsidian и DOM.
   - Тонкий фасад `src/main.ts`: метод `onload()` не превышает **20–30 строк**.
2. **Лимиты сложности кода:**
   - Когнитивная сложность (Cognitive Complexity) $\le 15$ на функцию.
   - Цикломатическая сложность (Cyclomatic Complexity) $\le 10$ на функцию ($\le 15$ для маппингов).
   - Максимальная глубина вложенности блоков $\le 3$.
   - Длина функции/метода $\le 40$ строк.
3. **TypeScript и Biome:**
   - Полный запрет `any`, `enum`, non-null assertions `!` и Parameter Properties (`constructor(private foo: string)`).
   - Запрет относительных импортов вверх (`../../`). Использование алиасов `@ui/*`, `@settings/*`, `@services/*`, `@utils/*` и `@packages/*`.
4. **Безопасность памяти и жизненный цикл:**
   - Все DOM-слушатели регистрируются строго через `this.registerDomEvent()`.
   - Все события Obsidian регистрируются через `this.registerEvent()`.
   - Все интервалы и таймеры регистрируются через `this.registerInterval()`.
   - В CSS используются только переменные темы Obsidian (`var(--text-normal)`, `var(--interactive-accent)`), **0% hardcoded цветов**.
5. **Тестирование:**
   - 100% покрытие Vitest для всей доменной логики в `src/utils/` в рантайме Node.js без моков Obsidian.

---

## 2. Этап 0: Подготовка контрактов монорепозитория

### Задача 0.1: Добавление зависимостей CodeMirror в каталог
* **Файл:** [`pnpm-workspace.yaml`](file:///home/gidragir/projects/obsidian-orbit/pnpm-workspace.yaml)
* **Действие:** Зафиксировать точные версии пакетов CodeMirror 6 в секции `catalog:` для плагина `tabs`:
  ```yaml
  catalog:
    "@codemirror/commands": "6.10.3"
    "@codemirror/lang-html": "6.4.11"
    "@codemirror/lang-markdown": "6.2.4"
    "@codemirror/language": "6.12.3"
    "@codemirror/state": "6.5.0"
    "@codemirror/view": "6.38.6"
    "@lezer/highlight": "1.2.3"
  ```

### Задача 0.2: Расширение портов интерфейсом буфера обмена
* **Файл:** [`packages/ports/src/index.ts`](file:///home/gidragir/projects/obsidian-orbit/packages/ports/src/index.ts)
* **Действие:** Добавить контракт `IClipboardPort`:
  ```typescript
  export interface IClipboardPort {
    readText(): Promise<string>
    writeText(text: string): Promise<void>
  }
  ```

### Задача 0.3: Реализация адаптера буфера обмена
* **Файл:** `packages/adapters/src/clipboard.ts` (создать новый)
* **Действие:** Реализовать `ClipboardAdapter`, оборачивающий `navigator.clipboard` с безопасной обработкой ошибок:
  ```typescript
  import type { IClipboardPort } from '@packages/ports'

  export class ClipboardAdapter implements IClipboardPort {
    async readText(): Promise<string> {
      try {
        return await navigator.clipboard.readText()
      } catch (error) {
        console.error('[ClipboardAdapter] Failed to read from clipboard:', error)
        return ''
      }
    }

    async writeText(text: string): Promise<void> {
      try {
        await navigator.clipboard.writeText(text)
      } catch (error) {
        console.error('[ClipboardAdapter] Failed to write to clipboard:', error)
      }
    }
  }
  ```
* **Файл:** [`packages/adapters/src/index.ts`](file:///home/gidragir/projects/obsidian-orbit/packages/adapters/src/index.ts)
* **Действие:** Добавить `export * from './clipboard'`.

---

## 3. Фаза 1: Миграция `snippet-renderer` (Сложность: Низкая)
*Референс:* [`reference/snippet-templater-context.md`](file:///home/gidragir/projects/obsidian-orbit/reference/snippet-templater-context.md)

### 1.1. Инициализация плагина
* Создать директорию `plugins/snippet-renderer/`.
* Создать `package.json`:
  ```json
  {
    "name": "snippet-renderer",
    "version": "1.0.0",
    "private": true,
    "main": "main.js",
    "scripts": {
      "build": "tsx ../../scripts/build.ts",
      "dev": "tsx ../../scripts/build.ts --watch",
      "test": "vitest run",
      "typecheck": "tsc --noEmit"
    },
    "dependencies": {
      "@packages/obsidian-utils": "workspace:*",
      "@packages/ui": "workspace:*"
    },
    "devDependencies": {
      "@packages/tsconfig": "workspace:*",
      "esbuild": "catalog:",
      "obsidian": "catalog:",
      "tsx": "catalog:",
      "typescript": "catalog:",
      "vitest": "catalog:"
    }
  }
  ```
* Создать `manifest.json`:
  ```json
  {
    "id": "snippet-renderer",
    "name": "Snippet Renderer",
    "version": "1.0.0",
    "minAppVersion": "1.7.0",
    "description": "Interactive widget for script templates with live variable substitution and preview.",
    "author": "Obsidian Orbit",
    "isDesktopOnly": false
  }
  ```
* Создать `versions.json`: `{"1.0.0": "1.7.0"}`.
* Создать `tsconfig.json`:
  ```json
  {
    "extends": "@packages/tsconfig/tsconfig.plugin.json",
    "compilerOptions": {
      "paths": {
        "@ui/*": ["./src/ui/*"],
        "@utils/*": ["./src/utils/*"]
      }
    },
    "include": ["src/**/*"]
  }
  ```

### 1.2. Доменное ядро и тесты
* **Файл:** `plugins/snippet-templater/src/utils/parser.ts`
  * Устранить разделяемый `VARIABLE_REGEX` с `/g`. Создавать регулярные выражения локально внутри функций.
  * Реализовать функции:
    * `parseLanguageAndSource(source: string, fenceHeader?: string): ParsedTemplate`
    * `extractVariables(source: string): readonly string[]`
    * `substituteVariables(source: string, values: Readonly<Record<string, string>>): string`
* **Файл:** `plugins/snippet-templater/src/utils/fence.ts`
  * Реализовать чистую функцию `extractFenceHeader(sectionText: string, lineStart: number): string`.
* **Файлы тестов:**
  * `plugins/snippet-templater/src/utils/parser.test.ts`
  * `plugins/snippet-templater/src/utils/fence.test.ts`
  * Обеспечить 100% покрытие Vitest (все ветвления парсинга, краевые случаи с пустыми строками, невалидными переменными).

### 1.3. Слой UI
* **Файл:** `plugins/snippet-templater/src/ui/snippet-render-child.ts`
  * Наследуется от `MarkdownRenderChild`.
  * Разбить `renderStructure()` и `renderInputsSection()` на методы $\le 30$ строк.
  * Все слушатели ввода регистрировать строго через `this.registerDomEvent(inputEl, 'input', ...)`.
  * Использовать `MarkdownRenderer.render` с передачей `this` в качестве жизненного цикла.

### 1.4. Стили и точка входа
* **Файл:** `plugins/snippet-templater/src/styles.css`
  * Заменить `rgba(0, 0, 0, 0.06)` $\to$ `var(--shadow-s)`.
  * Заменить `#1e1e1e` $\to$ `var(--code-background)`.
* **Файл:** `plugins/snippet-templater/src/main.ts`
  * Тонкий фасад ($\le 25$ строк):
  ```typescript
  import { Plugin } from 'obsidian'
  import { extractFenceHeader } from '@utils/fence'
  import { ScriptTemplateRenderChild } from '@ui/snippet-render-child'

  export default class SnippetRendererPlugin extends Plugin {
    async onload(): Promise<void> {
      const processor = (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const sectionInfo = ctx.getSectionInfo(el)
        const fenceHeader = sectionInfo ? extractFenceHeader(sectionInfo.text, sectionInfo.lineStart) : ''
        ctx.addChild(new SnippetRenderChild(el, this.app, source, ctx.sourcePath, fenceHeader))
      }

      this.registerMarkdownCodeBlockProcessor('snippet-renderer', processor)
    }
  }
  ```

---

## 4. Фаза 2: Миграция `html-renderer` (Сложность: Средняя)
*Референс:* [`reference/html-renderer-context.md`](file:///home/gidragir/projects/obsidian-orbit/reference/html-renderer-context.md)

### 2.1. Инициализация плагина
* Создать директорию `plugins/html-renderer/`.
* Создать `package.json` (с зависимостью от `@packages/ports`), `manifest.json` (`id: "html-renderer"`), `versions.json`, `tsconfig.json` (алиасы `@ui/*`, `@services/*`, `@settings/*`, `@utils/*`).

### 2.2. Доменное ядро (0% DOM)
* **Файл:** `plugins/html-renderer/src/utils/document-builder.ts`
  * **Полная изоляция от DOM:** Исключить любые вызовы `getComputedStyle(document.body)`.
  * Добавить интерфейс токенов:
    ```typescript
    export interface ThemeTokens {
      readonly bgColor: string
      readonly textColor: string
      readonly fontFamily: string
    }
    ```
  * Метод `.withThemeTokens(tokens: ThemeTokens | null): this`.
* **Файл:** `plugins/html-renderer/src/utils/source-parser.ts`
  * Чистая функция `resolveSourceType(source: string): SourceStrategy`.
* **Файл:** `plugins/html-renderer/src/utils/sandbox.ts`
  * Чистая функция `buildSandboxFlags(settings: HTMLRendererSettings): string`.
* **Тесты:** 100% покрытие Vitest для билдера, парсера и флагов sandbox в `src/utils/*.test.ts`.

### 2.3. Слой сервисов и адаптеров
* **Файл:** `plugins/html-renderer/src/services/theme-service.ts`
  * Чтение `getComputedStyle(document.body)` в адаптерном слое с безопасными fallback-значениями.
* **Файл:** `plugins/html-renderer/src/services/content-loader.ts`
  * Принимает `IVaultPort` из `@packages/ports`. Выполняет `vault.read(filePath)` без прямого импорта `TFile`.

### 2.4. UI и безопасность памяти
* **Файл:** `plugins/html-renderer/src/ui/html-render-child.ts`
  * Создать `HTMLRenderChild extends MarkdownRenderChild`.
  * Кнопка Reload: `this.registerDomEvent(refreshBtn, 'click', ...)`.
  * Валидация `postMessage` с тайп-гардом:
    ```typescript
    interface ResizeMessage {
      type: 'html-renderer-resize'
      height: number
    }

    function isResizeMessage(data: unknown): data is ResizeMessage {
      return (
        typeof data === 'object' &&
        data !== null &&
        (data as Record<string, unknown>).type === 'html-renderer-resize' &&
        typeof (data as Record<string, unknown>).height === 'number'
      )
    }
    ```
  * Ограничение высоты: `Math.min(Math.max(msg.height, 50), 10000)` для предотвращения UI-freeze.
  * Декомпозиция `renderHTMLCodeBlock` на методы $\le 30$ строк.

### 2.5. Настройки и точка входа
* **Файлы:** `src/settings/settings.ts`, `src/settings/settings-tab.ts`, `src/main.ts`.
* Устранить `settings!` через явную инициализацию дефолтным объектом.

---

## 5. Фаза 3: Миграция и глубокий рефакторинг `tabs-renderer` (Сложность: Высокая)
*Референс:* [`reference/obsidian-tabs-context.md`](file:///home/gidragir/projects/obsidian-orbit/reference/obsidian-tabs-context.md)

### 3.1. Инициализация плагина
* Создать директорию `plugins/tabs-renderer/`.
* Создать `package.json` с зависимостями `@packages/ports`, `@packages/adapters`, `@packages/obsidian-utils`, `@packages/ui`, а также `@codemirror/*` и `@lezer/*`.
* Создать `manifest.json` (`id: "tabs-renderer"`), `versions.json`, `tsconfig.json`.

### 3.2. Доменное ядро (`src/utils/`)
Вынести всю алгоритмическую работу из UI в чистые функции:
1. **`src/utils/tabs-parser.ts`**:
   * Чистый парсинг `split` (`tab: `), заголовков и содержимого табов.
   * Корректный учет глубины вложенных табов (`innerTabs` с подсчетом длины маркеров ````tabs-renderer` и `~~~tabs-renderer`).
2. **`src/utils/config-parser.ts`**:
   * Парсинг параметров: `top`, `bottom`, `left`, `right`, `one`, `multi`, `action-add`, `action-edit`, `action-none`.
3. **`src/utils/tabs-serializer.ts`**:
   * Сериализация структуры табов обратно в Markdown-строку с тегом ````tabs-renderer```` и расчетом требуемого числа кавычек `calculateBackquoteCount`.
4. **`src/utils/reorder.ts`**:
   * Чистая функция перемещения элемента в массиве: `reorderTabs<T>(items: readonly T[], from: number, to: number): T[]`.
5. **`src/utils/text-format.ts`**:
   * Чистые утилиты `createCodeBlock` и `getFormattedContent`.
* **Тесты:** 100% покрытие Vitest всех утилитных модулей в `src/utils/*.test.ts`.

### 3.3. Сервисный слой (`src/services/`)
* **`src/services/editor-service.ts`**:
  * Инкапсулирует операции над `MarkdownView.editor`: замена строк, проверка режима `preview`.
  * **Категорический запрет:** Удалить `declare module 'obsidian'` с monkey-patching `leaf.rebuildView()` и `app.setting.onClose`.
* **`src/services/tabs-cache-service.ts`**:
  * Управление кэшем активных табов `Map<string, number>`.
* **`src/services/clipboard-service.ts`**:
  * Взаимодействие с буфером через порт `IClipboardPort`.

### 3.4. Архитектурная декомпозиция UI (`src/ui/`)
1. **`src/ui/dnd-controller.ts`**:
   * Ликвидировать 363-строчный метод `registerdndEvents()`.
   * Реализовать атомарные методы $\le 30$ строк с глубиной вложенности $\le 3$:
     * `onDragStart(e: DragEvent, tabIndex: number): void`
     * `onDragOver(e: DragEvent, tabIndex: number): void`
     * `onDragLeave(e: DragEvent): void`
     * `onDrop(e: DragEvent, targetIndex: number): void` (вызывает `reorderTabs` из домена и обновляет документ через `EditorService`).
2. **`src/ui/editor/`**:
   * Декомпозировать `TabEditor` (859 строк):
     * `src/ui/editor/keymaps.ts`: вынести все горячие клавиши в чистый массив конфигурации.
     * `src/ui/editor/toolbar.ts`: компонент панели инструментов.
     * `src/ui/editor/table-menu.ts`: генератор таблиц (слушатели регистрировать безопасно).
     * `src/ui/editor/tab-editor-modal.ts`: таймер автосохранения регистрировать строго через `this.plugin.registerInterval()`.
3. **`src/ui/tabs-view.ts`**:
   * Контейнер компонента табов, собирающий навигацию и контент.
4. **`src/ui/settings/`**:
   * Устранить дублирование в `SampleTabs`. Для предпросмотра использовать чистый компонент без утечек `addEventListener`.

### 3.5. Стили (`src/styles.css`)
* В `src/styles/tabs-nav.css` заменить:
  * `#4eb3d5` $\to$ `var(--interactive-accent)`
  * `rgba(78, 179, 213, 0.26)` $\to$ `var(--interactive-accent-hover)`

### 3.6. Точка входа `src/main.ts`
* Зарегистрировать событие смены листа безопасно:
  ```typescript
  this.registerEvent(
    this.app.workspace.on('active-leaf-change', () => {
      this.cacheService.reset()
    })
  )
  ```
* Метод `onload()` $\le 25$ строк.

---

## 6. Чеклист финальной верификации

После завершения миграции каждого плагина субагент `executor` обязан успешно выполнить проверки:

```bash
# 1. Проверка форматирования и линтинга (0 ошибок, сложность <= 15)
pnpm lint

# 2. Проверка типов TypeScript во всех пакетах
pnpm typecheck

# 3. Запуск 100% чистых юнит-тестов доменной логики
pnpm test

# 4. Сборка артефактов плагинов
pnpm build

# 5. Сквозной пайплайн проверки монорепозитория
pnpm check
```
