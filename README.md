# Obsidian Orbit (`obsidian-orbit`)

Централизованный монорепозиторий (Single Source of Truth, SSOT) для проектирования, разработки, тестирования, сборки и независимого распространения плагинов экосистемы Obsidian.md, а также сопутствующих разделяемых библиотек.

## 🚀 Архитектурные принципы

1. **Единый источник правды (SSOT):** Вся разработка, типизация, документация и история версий плагинов сосредоточены в монорепозитории. Сателлитные репозитории (`obsidian-<plugin-id>`) выступают исключительно downstream-зеркалами релизов.
2. **Direct TS Source:** Пакеты `@packages/*` не имеют фазы предварительной сборки и каталогов `dist/`. Бандлер `esbuild` инлайнит чистый TypeScript напрямую в монолитный `main.js` каждого плагина.
3. **Pinpoint-версионирование:** Категорический запрет плавающих версий (`^`, `~`) через `save-exact=true`. Все внешние зависимости зафиксированы через секцию `catalog:` в `pnpm-workspace.yaml`, а локальные связи — через `workspace:*`.
4. **Порты и Адаптеры (Hexagonal Architecture):**
   - **Доменные типы (`@packages/types`):** Чистые структуры данных, контракт `Result<T, E>`, метаданные без внешних рантайм-зависимостей.
   - **Контракты портов (`@packages/ports`):** Интерфейсы `IVaultPort`, `ICommandPort`, `ISettingsPort`, `INoticePort`, `IClipboardPort` с 0% связности с Obsidian API и DOM.
   - **Доменное ядро (`@packages/core`, `src/utils/`):** Чистые алгоритмы парсинга Markdown, нормализации путей и валидации настроек. 100% покрытие Vitest.
   - **Адаптеры реализации (`@packages/adapters`, `src/services/`):** Конкретные реализации портов поверх `app.vault`, `navigator.clipboard`, `Notice` и команд Obsidian.
5. **Нормативный контроль сложности кода:**
   - Когнитивная сложность (Cognitive Complexity): $\le 15$ на функцию.
   - Цикломатическая сложность (Cyclomatic Complexity): $\le 10$ на функцию ($\le 15$ для структурных маппингов).
   - Глубина вложенности блоков: $\le 3$.
   - Размер функции/метода: $\le 40$ строк.
   - Тонкий фасад `main.ts` (запрет God-класса): `onload()` не превышает 20–30 строк.
6. **Строгие стандарты TypeScript и Biome:** Полный запрет `any`, `enum`, non-null assertion (`!`) и Parameter Properties.
7. **Чистые юнит-тесты Vitest:** Тестирование доменной логики исключительно в рантайме Node.js (`environment: 'node'`) без эмуляторов браузера (`happy-dom`, `jsdom`) и моков классов Obsidian.
8. **Zero-copy контур (`.vault/`):** Плагины подключаются в локальное тестовое хранилище через кроссплатформенные символические ссылки (`pnpm vault:link`).
9. **Контекстный протокол OpenViking и среда Antigravity 2.0:** Трехуровневая база знаний (`.agents/knowledge/`: L0 ментальная карта, L1 подсистемы, L2 ADR и CLI) и тандем ролевых субагентов (`executor`, `verifier`, `researcher`, `reviewer`).

---

## 📦 Разделяемые пакеты (`packages/*`)

Архитектура `@packages/*` построена по принципу модульного разделения ответственности:

| Пакет | Область ответственности | Зависимости |
|---|---|---|
| [`@packages/tsconfig`](file:///data/projects/obsidian-orbit/packages/tsconfig) | Базовые конфигурации компилятора TypeScript (`base`, `plugin`, `library`). | — |
| [`@packages/types`](file:///data/projects/obsidian-orbit/packages/types) | Доменные типы, контракты `Result<T, E>`, `IFileMeta`, интерфейсы команд и горячих клавиш. | 0% runtime deps |
| [`@packages/ports`](file:///data/projects/obsidian-orbit/packages/ports) | Порты гексагональной архитектуры (`IVaultPort`, `ICommandPort`, `ISettingsPort`, `INoticePort`, `IClipboardPort`). | `@packages/types` |
| [`@packages/core`](file:///data/projects/obsidian-orbit/packages/core) | Чистая доменная логика: парсинг блоков/фенсов Markdown, работа с путями, валидация настроек. 100% unit-тесты. | `@packages/types` |
| [`@packages/adapters`](file:///data/projects/obsidian-orbit/packages/adapters) | Адаптеры к Obsidian API и браузерному окружению, реализующие контракты портов. | `obsidian`, `@packages/ports`, `@packages/types` |
| [`@packages/obsidian-utils`](file:///data/projects/obsidian-orbit/packages/obsidian-utils) | Утилиты для работы с Markdown и MetadataCache в Obsidian. | 0% DOM/Obsidian runtime |
| [`@packages/ui`](file:///data/projects/obsidian-orbit/packages/ui) | Общие UI-компоненты (`Badge`, `Modal`, `Setting`, Split-Editor, CodeEditor) и глобальные CSS-токены темы. | `obsidian`, `@packages/ports` |

---

## 🔌 Семейство плагинов (`plugins/*`)

Каждый плагин представляет собой независимый модуль с собственным манифестом `manifest.json`, историей `versions.json`, юнит-тестами и downstream-сателлитом:

| Плагин | Назначение | Тег кодблока | Сателлитный репозиторий |
|---|---|---|---|
| [`html-renderer`](file:///data/projects/obsidian-orbit/plugins/html-renderer) | Изолированный рендеринг HTML, CSS и JavaScript внутри песочницы iframe с поддержкой тем оформления. | ```` ```html-renderer ```` | `obsidian-html-renderer` |
| [`snippet-renderer`](file:///data/projects/obsidian-orbit/plugins/snippet-renderer) | Интерактивный виджет для шаблонов скриптов с динамической подстановкой переменных и живым предпросмотром. | ```` ```snippet-renderer ```` | `obsidian-snippet-renderer` |
| [`tabs-renderer`](file:///data/projects/obsidian-orbit/plugins/tabs-renderer) | Вкладки для структурирования заметок, модальный редактор вкладок на CodeMirror 6, Drag-and-Drop и кэш. | ```` ```tabs ```` / ```` ```tabs-renderer ```` | `obsidian-tabs-renderer` |

---

## 🛠️ Команды тулчейна

```bash
# 1. Установка зависимостей с проверкой каталога
pnpm install

# 2. Комплексная верификация качества кода (Biome + Typecheck + Test + Build)
pnpm check

# 3. Линтинг и автоформатирование Biome
pnpm lint && pnpm format

# 4. Строгая проверка типов во всех пакетах и плагинах
pnpm typecheck

# 5. Запуск чистых юнит-тестов Vitest в среде Node.js
pnpm test

# 6. Сборка всех плагинов через Turborepo и esbuild
pnpm build

# 7. Режим разработки с watch-сборкой и автолинковкой
pnpm dev

# 8. Создание кроссплатформенных симлинков в тестовое хранилище .vault/
pnpm vault:link

# 9. Создание ченджсета накопительных изменений
pnpm change

# 10. Бамп версий, синхронизация manifest.json / versions.json и pnpm lock
pnpm version:bump

# 11. CLI-слияние релизного PR через GitHub CLI и pull в локальный main
pnpm release:merge

# 12. Сборка и доставка релизных артефактов в downstream-сателлиты
pnpm release

# 13. Упаковка стороннего плагина-референса через Repomix в Markdown-снимок
pnpm ai:context <plugin-name>

# 14. Упаковка всех референсов из reference/
pnpm ai:context:all
```

---

## 🧠 ИИ-архитектура и контекст (Antigravity 2.0 & OpenViking)

Монорепозиторий оптимизирован для работы тандема моделей **Gemini Pro (Оркестратор)** и **Gemini Flash (Исполнение и верификация)**:

* **Иерархия каталога `.agents/`** (хранилище с `s` на конце; каталог `.agent/` упразднен):
  * `.agents/rules/` — гранулярные правила с селективными glob-триггерами (инварианты архитектуры, стандарты Biome, лимиты сложности).
  * `.agents/skills/` — специализированные навыки (`obsidian-architect`, `complexity-guard`, `biome-refactor`, `reference-migrator`, `semver-changeset`, `subagent-driven-development` и др.).
  * `.agents/agents/` — спецификации ролевых субагентов (`executor.md`, `verifier.md`, `researcher.md`, `reviewer.md`).
  * `.agents/workflows/` — регламентированные сценарии по slash-командам (`/new-plugin`, `/refactor-reference`, `/verify`, `/prepare-release`).
  * `.agents/mcp.json` — конфигурация MCP-серверов (`fetch` для чтения актуальной документации Obsidian API).
* **Протокол OpenViking:**
  * **L0 (Ментальная карта):** [`.agents/knowledge/L0_index.json`](file:///data/projects/obsidian-orbit/.agents/knowledge/L0_index.json).
  * **L1 (Подсистемы):** [`.agents/knowledge/subsystems/*.md`](file:///data/projects/obsidian-orbit/.agents/knowledge/subsystems).
  * **L2 (ADR и CLI):** [`.agents/knowledge/adr/`](file:///data/projects/obsidian-orbit/.agents/knowledge/adr) и [`.agents/knowledge/cli/commands.md`](file:///data/projects/obsidian-orbit/.agents/knowledge/cli/commands.md).
  * **Синхронизация:** `sync-knowledge .` для актуализации документации подсистем.

---

## 📁 Структура монорепозитория

```
.
├── .agents/                      # ИИ-контекст Antigravity 2.0 и OpenViking
│   ├── agents/                   # Спецификации субагентов (executor, verifier, etc.)
│   ├── knowledge/                # База знаний OpenViking (L0, L1, L2)
│   ├── mcp.json                  # Конфигурация MCP-серверов (fetch)
│   ├── rules/                    # Гранулярные правила для контекстного окна
│   ├── skills/                   # On-demand навыки и процедуры
│   └── workflows/                # Исполняемые сценарии (/verify, /new-plugin, etc.)
├── .changeset/                   # Конфигурация и накопительные ченджсеты
├── .github/                      # CI/CD пайплайны GitHub Actions
│   └── workflows/
│       ├── ci.yml                # PR-пайплайн: Biome, Typecheck, Vitest, Build
│       └── release.yml           # Релизный пайплайн: Version PR и Downstream Deploy
├── .vault/                       # Локальное хранилище Obsidian (в .gitignore)
├── packages/                     # Разделяемые TS-библиотеки (Direct TS Source)
│   ├── adapters/                 # @packages/adapters: адаптеры портов к Obsidian API
│   ├── core/                     # @packages/core: чистая доменная логика и парсеры
│   ├── obsidian-utils/           # @packages/obsidian-utils: доменные утилиты Obsidian
│   ├── ports/                    # @packages/ports: порты гексагональной архитектуры
│   ├── tsconfig/                 # @packages/tsconfig: базовые настройки tsc
│   ├── types/                    # @packages/types: доменные интерфейсы и Result<T, E>
│   └── ui/                       # @packages/ui: UI-компоненты и стили тем
├── plugins/                      # Семейство плагинов Obsidian
│   ├── html-renderer/            # HTML Renderer (изолированный iframe)
│   ├── snippet-renderer/         # Snippet Renderer (интерактивные шаблоны)
│   └── tabs-renderer/            # Tabs Renderer (организация заметок во вкладках)
├── reference/                    # Референсные снимки сторонних плагинов (в .gitignore)
├── scripts/                      # Служебный тулчейн TypeScript (tsx)
│   ├── build.ts                  # Централизованный сборщик esbuild
│   ├── deploy-downstream.ts     # Доставка артефактов в сателлитные репозитории
│   ├── generate-ai-context.ts    # Упаковка исходников через Repomix
│   ├── link-vault.ts             # Кроссплатформенная линковка симлинков в .vault
│   ├── merge-release-pr.ts       # Автоматическое CLI-слияние релизного PR через gh
│   └── sync-versions.ts          # Синхронизация версий в манифестах
├── .npmrc                        # save-exact=true, изоляция версий
├── AGENTS.md                     # Генеральный регламент ИИ-агентов монорепозитория
├── biome.json                    # Единый конфигуратор линтера и форматтера Biome
├── LICENSE                       # Корневая лицензия MIT (SSOT)
├── mise.toml                     # Декларация версий локального окружения
├── package.json                  # Корневой манифест со скриптами тулчейна
├── pnpm-workspace.yaml           # Декларация воркспейсов и Pnpm Catalogs
├── repomix.config.json           # Конфигуратор упаковки контекста
├── SPEC.md                       # Полная генеральная спецификация монорепозитория
├── turbo.json                    # Гранулярная конфигурация кэша Turborepo
└── vitest.config.ts              # Конфигуратор чистых тестов Vitest
```
