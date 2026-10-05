# Генеральная спецификация: Монорепозиторий Obsidian Orbit (`obsidian-orbit`)

Настоящий документ является главным техническим описанием архитектуры, тулчейна, инженерных стандартов, протоколов сборки, тестирования, релизов и интеграции с искусственным интеллектом для монорепозитория плагинов Obsidian.

---

## 1. Общие сведения и архитектурные принципы

### 1.1 Назначение проекта
Централизованный монорепозиторий (Single Source of Truth, SSOT) для проектирования, разработки, тестирования, сборки и независимого распространения плагинов экосистемы Obsidian.md, а также сопутствующих разделяемых библиотек (UI-компоненты, сервисы хранилища, доменные утилиты).

* **Репозиторий монорепо:** `github.com/<owner>/obsidian-orbit` (кодовое имя: **Obsidian Orbit**).
* **Модель распространения:** Массивное ядро монорепозитория удерживает на своей орбите внешние downstream-сателлиты (`obsidian-<plugin-id>`), автоматически снабжая их релизными артефактами через CI/CD.

### 1.2 Фундаментальные архитектурные инварианты
1. **Единый источник правды (SSOT):** Вся разработка, типизация, история версий (`versions.json`), лицензии (`LICENSE`) и разделяемые пакеты сосредоточены в монорепозитории. Прямое внесение кода в сателлитные репозитории запрещено.
2. **Модель прямого импорта исходников (Direct TS Source):** Разделяемые пакеты (`@packages/*`) не имеют каталогов `dist/` и фазы предварительной сборки. Бандлер `esbuild` каждого плагина инлайнит чистый TypeScript напрямую в монолитный файл `main.js`.
3. **Pinpoint-версионирование и Pnpm Catalogs:** Категорический запрет диапазонов версий (`^`, `~`) во всех манифестах через флаг `save-exact=true`. Внутренние связи фиксируются через протокол `workspace:*`, а внешние зависимости декларируются в `catalog:` файла `pnpm-workspace.yaml`.
4. **Архитектурный стиль «Порты и Адаптеры» (Hexagonal):**
   * **Доменное ядро (`src/utils/`, `@packages/obsidian-utils`):** 0% зависимостей от Obsidian API, Electron, DOM или Node.js I/O.
   * **Слой адаптеров (`src/services/`, `src/ui/`, `src/main.ts`):** Реализует взаимодействие с хранилищем (`app.vault`), кэшем (`app.metadataCache`) и пользовательским интерфейсом.
5. **Нормативный контроль сложности кода:**
   * Когнитивная сложность (Cognitive Complexity): $ \le 15 $ на функцию (без исключений).
   * Цикломатическая сложность (Cyclomatic Complexity): $ \le 10 $ на функцию (до $ 15 $ для структурных маппингов).
   * Глубина вложенности блоков: $ \le 3 $.
   * Размер функции/метода: $ \le 40 $ строк.
6. **Тонкий фасадный адаптер `main.ts` (Запрет God-класса):** Метод `onload()` не превышает 20–30 строк и декомпозируется на вызовы приватных методов (`registerCommands()`, `registerEvents()`, `registerViews()`).
7. **Абсолютный запрет относительных путей вверх (`../../`):** Использование строго внутримодульных алиасов `tsconfig.json` (`@ui/*`, `@settings/*`, `@services/*`) и скоупа `@packages/*`.
8. **Чистые Unit-тесты (Pure Logic Only):** Тестирование раннером Vitest исключительно в рантайме Node.js (`environment: 'node'`). Запрещены эмуляторы браузера (`happy-dom`, `jsdom`) и создание моков классов `App`, `Vault`, `Plugin`, `TFile`.
9. **Локальный Zero-copy контур (.vault/):** Директория `.vault/` в корне монорепозитория изолирована в `.gitignore`. Доступ плагинов осуществляется только через автоматические кроссплатформенные символические ссылки (`scripts/link-vault.ts`).
10. **Двухфазный релизный пайплайн Changesets (Модель 1) + CLI DX:** Автоматический PR `Version Packages` в CI в связке с консольной командой `pnpm release:merge` (`gh pr merge` + `git pull`), исключающей рутину в веб-интерфейсе GitHub.
11. **Нативная среда Antigravity 2.0:** Разделение ролей оркестрации (Gemini Pro) и субсекундной кодогенерации/автономной верификации (Gemini Flash).

---

## 2. Архитектура репозиториев и файловая топология

### 2.1 Схема двухуровневой топологии

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CORE MONOREPO (Единый источник правды)                   │
│  • Разработка всех плагинов (plugins/*) и библиотек (packages/*)            │
│  • Оркестрация проверок и сборки (Turborepo + Biome + Vitest)               │
│  • Версионирование через @changesets/cli и теги <plugin>@<version>          │
│  • Контекстная система ИИ: .agents/rules, .agents/skills, .agents/workflows │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ CI/CD: scripts/deploy-downstream.ts
                                       │ (push артефактов по токену RELEASE_PAT)
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌───────────────────────────────────┐                 ┌───────────────────────────────────┐
│ SATELLITE REPO 1: obsidian-foo    │                 │ SATELLITE REPO 2: obsidian-bar    │
│ • Ветка main: manifest.json,      │                 │ • Ветка main: manifest.json,      │
│   versions.json, LICENSE, README  │                 │   versions.json, LICENSE, README  │
│ • GitHub Releases: тег x.y.z,     │                 │ • GitHub Releases: тег x.y.z,     │
│   ассеты: main.js, manifest.json, │                 │   ассеты: main.js, manifest.json, │
│   styles.css (опционально)        │                 │   styles.css (опционально)        │
│ • Потребители: Каталог, BRAT      │                 │ • Потребители: Каталог, BRAT      │
└───────────────────────────────────┘                 └───────────────────────────────────┘
```

### 2.2 Полное файловое дерево монорепозитория

```
.
├── .agents/                        # ИИ-контекст Antigravity 2.0 и OpenViking
│   ├── agents/                     # Ролевые спецификации субагентов (executor, verifier, etc.)
│   ├── knowledge/                  # База знаний OpenViking (L0_index.json, subsystems, adr, cli)
│   ├── mcp.json                    # Декларация MCP-серверов (fetch)
│   ├── rules/                      # Гранулярные правила для контекстного окна
│   │   ├── 00-architecture.md      # Always On: инварианты монорепозитория
│   │   ├── 10-biome-typescript.md  # Glob: строгие типы и Biome
│   │   ├── 15-patterns-complexity.md # Glob: паттерны и лимиты сложности
│   │   ├── 20-obsidian-plugins.md  # Glob: жизненный цикл плагинов
│   │   ├── 30-packages-source.md   # Glob: модель Direct TS Source
│   │   ├── 40-pure-testing.md      # Glob: чистые тесты Vitest
│   │   ├── 50-changesets.md        # Model Decision: релизные правила
│   │   └── project_context.md      # Правила протокола OpenViking
│   ├── skills/                     # On-Demand навыки с пошаговыми инструкциями
│   │   ├── obsidian-architect/     # Архитектура плагинов и безопасность памяти
│   │   ├── complexity-guard/       # Снижение когнитивной и цикломатической сложности
│   │   ├── biome-refactor/         # Ликвидация any, enum, !, parameter properties
│   │   ├── reference-migrator/     # Разбор снимков Repomix и адаптация кода
│   │   ├── semver-changeset/       # Расчет версий SemVer для Obsidian
│   │   ├── subagent-driven-development/ # Исполнение планов субагентами
│   │   └── verify/                 # Цикл автоверификации
│   └── workflows/                  # Воркфлоу по Slash-командам
│       ├── new-plugin.md           # Воркфлоу: /new-plugin
│       ├── refactor-reference.md   # Воркфлоу: /refactor-reference
│       ├── verify.md               # Воркфлоу: /verify
│       └── prepare-release.md      # Воркфлоу: /prepare-release
├── .changeset/                     # Каталог накопительных изменений Changesets
│   └── config.json
├── .github/
│   └── workflows/
│       ├── ci.yml                  # PR-пайплайн: lint, typecheck, test -> build
│       └── release.yml             # Релизный пайплайн: Version PR и Downstream Deploy
├── .vault/                         # Локальное хранилище для отладки (в .gitignore)
│   └── .obsidian/
│       └── plugins/                # Симлинки на разрабатываемые плагины
├── reference/                      # Референсные сторонние плагины (в .gitignore)
├── scripts/
│   ├── build.ts                    # Единый раннер esbuild (CJS main.js + styles.css)
│   ├── sync-versions.ts            # Синхронизация версий в manifest.json и versions.json
│   ├── link-vault.ts               # Создание кроссплатформенных симлинков в .vault
│   ├── merge-release-pr.ts         # CLI-мердж релизного PR через gh и синхронизация git pull
│   ├── deploy-downstream.ts        # Доставка артефактов в сателлиты и создание релизов
│   └── generate-ai-context.ts      # Упаковка сторонних референсов через Repomix
├── plugins/                        # Директория плагинов Obsidian
│   ├── html-renderer/              # HTML Renderer (изолированный iframe для HTML/CSS/JS)
│   ├── snippet-renderer/           # Snippet Renderer (шаблоны с интерактивными переменными)
│   └── tabs-renderer/              # Tabs Renderer (организация заметок во вкладках, редактор)
├── packages/                       # Разделяемые пакеты Direct TS Source (@packages/*)
│   ├── adapters/                   # name: "@packages/adapters" (реализация портов для Obsidian)
│   ├── core/                       # name: "@packages/core" (доменные парсеры и утилиты)
│   ├── obsidian-utils/             # name: "@packages/obsidian-utils" (утилиты метаданных)
│   ├── ports/                      # name: "@packages/ports" (порты гексагональной архитектуры)
│   ├── tsconfig/                   # name: "@packages/tsconfig" (базовые tsconfig.*.json)
│   ├── types/                      # name: "@packages/types" (чистые доменные интерфейсы и Result)
│   └── ui/                         # name: "@packages/ui" (общие UI-компоненты, модалы, стили)
├── .npmrc                          # save-exact=true для строгого версионирования
├── AGENTS.md                       # Главный системный регламент ИИ-агентов
├── biome.json                      # Единый конфигуратор Biome
├── LICENSE                         # Корневая лицензия (SSOT для всех сателлитов)
├── mise.toml                       # Декларация версий локального окружения
├── package.json                    # Корневой манифест со скриптами тулчейна
├── pnpm-workspace.yaml             # Определение воркспейсов и Pnpm Catalogs
├── repomix.config.json             # Конфигурация упаковщика контекста
├── turbo.json                      # Гранулярная конфигурация кэша Turborepo
├── vitest.config.ts                # Конфигурация Vitest с плагином путей
└── README.md
```

---

## 3. Стек технологий и спецификация инструментов

| Категория | Инструмент | Версия | Назначение в архитектуре |
|---|---|---|---|
| **Среда разработки** | Google Antigravity IDE | 2.0 | Основная среда разработки с тандемом Gemini Pro и Flash. |
| **Менеджер окружения** | `mise` | latest | Фиксация локальных версий Node.js, pnpm, Biome на CachyOS Linux. |
| **Менеджер пакетов** | `pnpm` | 11.21.0 | Изоляция зависимостей, CAS-хранилище, Catalogs, `workspace:*`. |
| **Фиксация зависимостей** | `.npmrc` | — | `save-exact=true`, `link-workspace-packages=true`. |
| **Оркестрация сборки** | `Turborepo` | 2.11.2 | Гранулярное кэширование, топологическое построение графа задач. |
| **Качество кода** | `Biome` | 2.5.14 | Сверхбыстрый линтинг, форматирование, запрет `any`, `enum`, `!`. |
| **Система типов** | `TypeScript` | 7.0.2 | Статическая строгая типизация, абсолютные алиасы. |
| **Сборщик плагинов** | `esbuild` | 0.28.2 | Инлайн-компиляция Direct TS Source в CJS `main.js` и сборка CSS. |
| **Тестирование** | `Vitest` | 5.0.1 | Чистые юнит-тесты в рантайме Node.js без DOM и моков Obsidian. |
| **Резолв путей тестов** | `vite-tsconfig-paths` | 6.1.1 | Трансляция алиасов `tsconfig.json` в рантайм Vitest. |
| **Версионирование** | `@changesets/cli` | 3.0.3 | Независимое версионирование SemVer, генерация Version PR. |
| **Редакторский стек** | `CodeMirror 6` | 6.x / 1.x | Компоненты редактора заметок и подсветки (`@codemirror/*`, `@lezer/*`). |
| **TypeScript Runner** | `tsx` | 4.23.13 | Исполнение скриптов тулчейна и сборщика в TypeScript. |
| **GitHub CLI** | `gh` | latest | Автоматизация слияния релизного PR через терминал (`release:merge`). |
| **CI/CD раннеры** | GitHub Actions | v4 | Параллельные PR-проверки и транзакционный деплой в сателлиты. |
| **Авторизация сателлитов**| `RELEASE_PAT` | — | Секрет GitHub с правами `repo` на запись в сателлиты. |
| **Анализ референсов** | `Repomix` | 1.18.0 | Сборка исходников сторонних плагинов в Markdown-снимки. |

---

## 4. Конфигурация качества кода (Biome) и специфика ОС

### 4.1 Конфигурация Biome (`biome.json`)
```json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "es5"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExcessiveCognitiveComplexity": {
          "level": "error",
          "options": {
            "maxAllowedComplexity": 15
          }
        }
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noUnsafeDeclarationMerging": "error"
      },
      "style": {
        "noEnum": "error",
        "noNonNullAssertion": "error",
        "noParameterProperties": "error",
        "useConst": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "useArrayLiterals": "error"
      }
    }
  },
  "files": {
    "ignore": [
      "**/dist/**",
      "**/node_modules/**",
      "**/main.js",
      "**/styles.css",
      "**/.vault/**",
      "**/reference/**",
      "**/.turbo/**"
    ]
  }
}
```

### 4.2 Специфика CachyOS Linux
* **Открытие хранилища в Obsidian:** Нативный десктопный Obsidian из AUR в GTK-диалоге скрывает папки, начинающиеся с точки. В диалоге выбора хранилища используется шорткат **`Ctrl + H`** для отображения `.vault`. Дополнительно скрипт `scripts/link-vault.ts` формирует корневой симлинк `dev-vault -> .vault`.
* **Запуск скриптов:** Скрипты исполняются через `tsx scripts/<name>.ts` посредством `pnpm`. Ручная установка прав `chmod +x` на TypeScript-файлы не требуется.

---

## 5. Архитектура разделяемых пакетов (`packages/*`)

### 5.1 Модель прямого импорта исходников (Direct TS Source)
* Все разделяемые библиотеки (`@packages/*`) функционируют без промежуточной компиляции и каталогов `dist/`.
* В `package.json` точка входа экспортирует чистый TypeScript-исходник:
  ```json
  {
    "name": "@packages/core",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "main": "src/index.ts",
    "exports": {
      ".": "./src/index.ts"
    }
  }
  ```

### 5.2 Реестр пакетов и Гексагональная архитектура (Ports & Adapters)

Пакеты строго разделены по слоям Clean/Hexagonal Architecture:

1. **`@packages/tsconfig` (Инфраструктура):**
   - Набор конфигураций TypeScript: `tsconfig.base.json` (строгий режим, `verbatimModuleSyntax: true`), `tsconfig.plugin.json`, `tsconfig.library.json`.
2. **`@packages/types` (Доменные примитивы):**
   - 0% зависимостей от сторонних библиотек и Obsidian API.
   - Чистый контейнер результата `Result<T, E>` (`ok`, `err`, `isOk`, `isErr`).
   - Метаданные файлов `IFileMeta`, структуры команд `CommandDefinition`, шорткатов `HotkeyDefinition` и опций `NoticeOptions`.
3. **`@packages/ports` (Контракты портов):**
   - Интерфейсы взаимодействия с внешним миром без привязки к Obsidian:
     - `IVaultPort`: чтение/запись текстовых и бинарных файлов, существование, листинг, метаданные.
     - `ICommandPort`: регистрация команд.
     - `ISettingsPort<T>`: загрузка и сохранение настроек.
     - `INoticePort`: отображение всплывающих уведомлений.
     - `IClipboardPort`: асинхронное чтение и запись системного буфера обмена.
4. **`@packages/core` (Доменное ядро):**
   - Чистые алгоритмические модули с 100% покрытием unit-тестами Vitest в Node.js:
     - `markdown.ts`: извлечение и валидация фенс-блоков Markdown, очистка синтаксиса.
     - `path.ts`: нормализация путей, безопасное соединение путей, выделение расширений.
     - `settings.ts`: слияние настроек по умолчанию, глубокая валидация схемы параметров.
5. **`@packages/adapters` (Адаптеры API Obsidian):**
   - Конкретные реализации интерфейсов `@packages/ports`:
     - `VaultAdapter`: адаптер к `app.vault` (TFile, TFolder, DataAdapter).
     - `CommandAdapter`: адаптер к `app.commands` и `plugin.addCommand()`.
     - `SettingsAdapter`: адаптер к `plugin.loadData()` и `plugin.saveData()`.
     - `NoticeAdapter`: адаптер к классу `Notice` из Obsidian.
     - `ClipboardAdapter`: безопасный адаптер к `navigator.clipboard`.
     - `EditorAdapter`: манипуляции с активным редактором заметки.
6. **`@packages/obsidian-utils` (Утилиты Obsidian):**
   - Вспомогательные функции для работы с кэшем заметок (`app.metadataCache`), ссылками и фронтматтером.
7. **`@packages/ui` (Пользовательский интерфейс):**
   - Переиспользуемые визуальные компоненты, модальные окна и редакторы:
     - `Badge`: бейджи статуса.
     - `Modal`: базовое модальное окно на чистом DOM.
     - `Setting`: обертка над элементами настроек.
     - `SplitEditorModal`: модальный сплит-редактор.
     - `CodeEditor`, `EditorToolbar`: обертки над редактором кода CodeMirror 6.
     - `styles.css`: общие стили темы Obsidian.

### 5.3 Контракт зависимостей от `obsidian`
Для обеспечения работы языкового сервера (LSP) в среде разработки при отсутствии рантайма Obsidian в npm, адаптеры и UI-пакеты объявляют зависимости синхронно:
```json
{
  "peerDependencies": {
    "obsidian": "catalog:"
  },
  "peerDependenciesMeta": {
    "obsidian": {
      "optional": false
    }
  },
  "devDependencies": {
    "@packages/tsconfig": "workspace:*",
    "obsidian": "catalog:",
    "typescript": "catalog:"
  }
}
```

### 5.4 Разделяемые стили (`@packages/ui`)
* Общие стили объявляются в `packages/ui/src/styles.css`.
* В плагинах стили подключаются через директиву `@import '@packages/ui/styles.css';` в файле `plugins/<id>/src/styles.css`.
* Бандлер `esbuild` инлайнит разделяемые CSS-правила в конечный `plugins/<id>/styles.css`.

---

## 6. Архитектура сборщика плагинов (`esbuild` и `scripts/build.ts`)

Сборка плагинов централизована в скрипте `scripts/build.ts`.

### 6.1 Интерфейс командной строки
```bash
tsx ../../scripts/build.ts [--watch] [--plugin <plugin-id>]
```
* При наличии `--plugin <id>` рабочей директорией становится `path.resolve(repoRoot, 'plugins', id)`.
* При отсутствии флага скрипт берет текущий рабочий каталог `process.cwd()`. Если в нем нет `manifest.json`, скрипт завершает работу с фатальной ошибкой и кодом `1`.

### 6.2 Параметры компиляции JavaScript
* **Формат:** `cjs` (CommonJS).
* **Платформа:** `platform: 'node'`.
* **Таргет:** `target: 'es2022'`.
* **Бандлинг:** `bundle: true` (инлайн кода из `@packages/*`).
* **Минификация:** `minify: !isDev`.
* **Карты кода:** `sourcemap: isDev ? 'inline' : false`.
* **Точка входа:** `plugins/<id>/src/main.ts` $\rightarrow$ выходной файл `plugins/<id>/main.js`.
* **Внешние модули (`external`):**
  * `obsidian`, `electron`
  * `@codemirror/autocomplete`, `@codemirror/collab`, `@codemirror/commands`, `@codemirror/language`, `@codemirror/lint`, `@codemirror/search`, `@codemirror/state`, `@codemirror/view`
  * `@lezer/common`, `@lezer/highlight`, `@lezer/lr`
  * Встроенные модули Node.js (`builtin-modules`) с префиксом `node:` и без него.

### 6.3 Компиляция стилей (`styles.css`)
* Скрипт проверяет наличие `plugins/<id>/src/styles.css`.
* При наличии файла `esbuild` собирает его в корень плагина `plugins/<id>/styles.css` с минификацией в продакшен-режиме.
* Если файл отсутствует, сборка CSS пропускается без ошибок.

---

## 7. Конфигурация TypeScript и архитектура путей

### 7.1 Базовый конфиг компилятора (`packages/tsconfig/tsconfig.base.json`)
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@packages/*": ["../../packages/*/src"]
    }
  }
}
```

### 7.2 Локальная конфигурация плагина (`plugins/<id>/tsconfig.json`)
```json
{
  "extends": "@packages/tsconfig/tsconfig.plugin.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["./src/ui/*"],
      "@settings/*": ["./src/settings/*"],
      "@services/*": ["./src/services/*"]
    }
  },
  "include": ["src/**/*"]
}
```

---

## 8. Управление зависимостями: Pnpm Catalogs

### 8.1 Конфигурация `.npmrc`
```ini
save-exact=true
auto-install-peers=true
link-workspace-packages=true
```

### 8.2 Декларация каталога `pnpm-workspace.yaml`
```yaml
packages:
  - 'plugins/*'
  - 'packages/*'

catalog:
  typescript: 7.0.2
  esbuild: 0.28.2
  turbo: 2.11.2
  vitest: 5.0.1
  vite-tsconfig-paths: 6.1.1
  '@changesets/cli': 3.0.3
  '@types/node': 26.6.2
  builtin-modules: 5.4.0
  repomix: 1.18.0
  obsidian: 1.13.1
  tsx: 4.23.13
  '@biomejs/biome': 2.5.14
  '@codemirror/commands': 6.10.3
  '@codemirror/lang-html': 6.4.11
  '@codemirror/lang-markdown': 6.2.4
  '@codemirror/language': 6.12.3
  '@codemirror/state': 6.7.5
  '@codemirror/view': 6.38.6
  '@lezer/highlight': 1.2.3
```

---

## 9. Разработка, локальный контур и тестирование

### 9.1 Симлинки в хранилище (`scripts/link-vault.ts`)
* Целевой каталог считывается из `process.env.OBSIDIAN_TEST_VAULT_PATH` (по умолчанию: `./.vault/.obsidian/plugins`).
* Директория создается рекурсивно при отсутствии.
* Для каждого каталога `plugins/*` создается символическая ссылка:
  * Windows (`win32`): `fs.symlinkSync(pluginDir, linkDir, 'junction')` (без прав администратора).
  * POSIX (Linux, macOS): `fs.symlinkSync(pluginDir, linkDir, 'dir')`.
* Перед линковкой устаревшие битые симлинки или папки безопасно удаляются.

### 9.2 Чистые юнит-тесты Vitest (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: false,
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.vault/**', '**/reference/**']
  }
})
```

---

## 10. Гранулярное кэширование Turborepo (`turbo.json`)

Конфигурация исключает ложный сброс кэша при редактировании документации Markdown, заметок в `.vault/`, референсов и ченджсетов:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "globalDependencies": [
    "tsconfig.json",
    "biome.json"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "src/**",
        "manifest.json",
        "package.json",
        "tsconfig.json",
        "!**/*.test.ts"
      ],
      "outputs": [
        "main.js",
        "styles.css"
      ],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "inputs": [
        "src/**",
        "package.json",
        "tsconfig.json",
        "../../packages/tsconfig/**"
      ],
      "outputs": [],
      "cache": true
    },
    "test": {
      "dependsOn": [],
      "inputs": [
        "src/**",
        "package.json",
        "tsconfig.json",
        "vitest.config.ts"
      ],
      "outputs": [],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 11. Шаблон инициализации нового плагина (`plugins/<id>`)

Каждый новый плагин монорепозитория генерируется со следующей структурой:

### 11.1 Манифест Obsidian (`plugins/<id>/manifest.json`)
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "minAppVersion": "1.7.0",
  "description": "Concise and descriptive explanation of what this plugin accomplishes.",
  "author": "Author Name",
  "authorUrl": "https://github.com/username",
  "isDesktopOnly": false
}
```

### 11.2 Хранилище версий (`plugins/<id>/versions.json`)
```json
{
  "1.0.0": "1.7.0"
}
```

### 11.3 Манифест воркспейса (`plugins/<id>/package.json`)
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "private": true,
  "main": "main.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/owner/obsidian-my-plugin.git"
  },
  "scripts": {
    "build": "tsx ../../scripts/build.ts",
    "dev": "tsx ../../scripts/build.ts --watch",
    "test": "vitest run"
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

### 11.4 Точка входа (`plugins/<id>/src/main.ts`)
```typescript
import { Plugin } from 'obsidian'

export default class MainPlugin extends Plugin {
  async onload(): Promise<void> {
    this.registerCommands()
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'show-status',
      name: 'Show Status',
      callback: () => {
        // Делегирование в сервис
      }
    })
  }

  onunload(): void {
    // Очистка ресурсов при необходимости
  }
}
```

---

## 12. Спецификация служебных скриптов тулчейна (`scripts/*.ts`)

### 12.1 `scripts/sync-versions.ts`
* **Назначение:** Синхронизация версий при бампе Changesets.
* **Алгоритм:**
  1. Сканирует каталоги `plugins/*`, имеющие `package.json` и `manifest.json`.
  2. Записывает `manifest.json.version = package.json.version`.
  3. Читает `plugins/<id>/versions.json` (или создает `{}`).
  4. Дописывает или обновляет пару `[version]: minAppVersion`.
  5. Сохраняет форматированный JSON (2 пробела, завершающий `\n`).

### 12.2 `scripts/merge-release-pr.ts`
* **Назначение:** Автоматический CLI-мердж релизного PR через GitHub CLI.
* **Алгоритм:**
  1. Проверяет наличие утилиты `gh` и статус авторизации `gh auth status`.
  2. Запрашивает открытый PR из ветки `changeset-release/main`:
     `gh pr list --state open --head changeset-release/main --json number`.
  3. Если PR отсутствует — завершает процесс с кодом `0` и сообщением «Релиз не требуется».
  4. Вызывает `gh pr merge <number> --merge --auto`.
  5. Выполняет `git checkout main && git pull origin main` при чистом `git status`.

### 12.3 `scripts/deploy-downstream.ts`
* **Назначение:** Доставка артефактов в сателлитные репозитории.
* **Алгоритм:**
  1. Обходит `plugins/*`, извлекает URL сателлита из `package.json.repository.url`.
  2. Проверяет наличие GitHub-релиза по тегу `manifest.json.version`. Если релиз существует и нет флага `--force` — пропускает плагин.
  3. Клонирует сателлит во временную директорию через `RELEASE_PAT`.
  4. Копирует в корень сателлита: `manifest.json`, `versions.json`, локальный `LICENSE` (или SSOT корневой `LICENSE`), стандартизированный `README.md`.
  5. Создает коммит `chore(release): release <version>` и пушит в ветку `main` сателлита.
  6. Проверяет наличие `main.js` (обязателен) и `styles.css` (опционален) в папке плагина.
  7. Создает GitHub Release с тегом `x.y.z` через API / CLI (`gh release create`) и загружает скомпилированные ассеты.
  8. Удаляет временную директорию. Скрипт идемпотентен.

### 12.4 `scripts/generate-ai-context.ts`
* **Интерфейс:** `pnpm ai:context <reference-name>`.
* **Алгоритм:** Валидирует каталог `reference/<name>`, собирает статистику расширений файлов и запускает `repomix` с конфигом `repomix.config.json`, генерируя снимок `reference/<name>-context.md`.

---

## 13. CI/CD пайплайны GitHub Actions

### 13.1 Пайплайн валидации PR: `.github/workflows/ci.yml` (Модель Б)
* **Топология:** Джобы `lint`, `typecheck`, `test` запускаются параллельно на независимых раннерах. Джоба `build` запускается строго после их успешного завершения (`needs: [lint, typecheck, test]`).

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint & Format (Biome)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Biome Check
        run: pnpm biome check .

  typecheck:
    name: Typecheck
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm turbo run typecheck

  test:
    name: Unit Tests (Vitest)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Unit Tests
        run: pnpm turbo run test

  build:
    name: Build Artifacts
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Restore Turbo Cache
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build All Packages & Plugins
        run: pnpm turbo run build
```

### 13.2 Пайплайн релизов: `.github/workflows/release.yml`
* **Транзакционность:** `cancel-in-progress: false` гарантирует, что релиз не будет прерван на середине деплоя.
* **Изоляция прав:** `GITHUB_TOKEN` управляет коммитами в монорепозиторий, а `RELEASE_PAT` — доставкой в сателлиты.

```yaml
name: Release & Downstream Deploy

on:
  push:
    branches:
      - main

concurrency:
  group: release-main
  cancel-in-progress: false

permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    name: Release / Version PR
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Changesets Action
        id: changesets
        uses: changesets/action@v1
        with:
          title: 'Version Packages'
          commit: 'chore(release): version packages'
          version: pnpm version:bump
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RELEASE_PAT: ${{ secrets.RELEASE_PAT }}
```

---

## 14. Архитектура интеграции с Google Antigravity IDE (Gemini Pro / Flash)

### 14.1 Тандем моделей и зоны ответственности
* **Оркестратор (Gemini Pro):**
  * Анализ инвариантов SSOT и контрактов монорепозитория.
  * Глубокий аудит снимков Repomix сторонних референсов из `reference/`.
  * Декомпозиция задач, проектирование интерфейсов портов и адаптеров.
  * Контроль метрик сложности (когнитивная $ \le 15 $, цикломатическая $ \le 10 $).
* **Субагент исполнения (Gemini Flash):**
  * Субсекундная генерация функций ядра и чистых тестов Vitest.
  * Реализация тонких адаптеров Obsidian API (`src/main.ts`, `src/ui/`).
  * Автономный верификационный цикл самоисправления в терминале (`pnpm check`).
  * Устранение форматирования и замечаний типов компилятора без `any` и `!`.

### 14.2 Пятиуровневая система контекста
1. **Генеральный SSOT (`AGENTS.md`):** Базовые инварианты, табу, роли и консольные команды (всегда в контексте).
2. **Гранулярные правила (`.agents/rules/*.md`):** Активируются по glob-триггерам (`00-architecture.md`, `10-biome-typescript.md`, `15-patterns-complexity.md`, `20-obsidian-plugins.md`, `30-packages-source.md`, `40-pure-testing.md`, `50-changesets.md`, `project_context.md`).
3. **Специализированные навыки (`.agents/skills/*/SKILL.md`):** Динамическая загрузка экспертизы по семантическому описанию (`obsidian-architect`, `complexity-guard`, `biome-refactor`, `reference-migrator`, `semver-changeset`, `subagent-driven-development`, `verify` и др.).
4. **Рабочие процессы (`.agents/workflows/*.md`):** Исполняемые сценарии по slash-командам (`/new-plugin`, `/refactor-reference`, `/verify`, `/prepare-release`).
5. **Протокол контекста MCP (`.agents/mcp.json`):** Легковесный сервер `fetch` (`@modelcontextprotocol/server-fetch`) для оперативного чтения актуальной документации Obsidian API и CodeMirror 6 без расхода токенов.

### 14.3 Каталог ролевых субагентов Antigravity 2.0 (`.agents/agents/`)
* **`executor.md` (Flash):** Быстрая реализация чистых функций, классов адаптеров и модульных тестов.
* **`verifier.md` (Flash):** Автономный верификационный цикл (`pnpm check`) с автоисправлением Biome и TypeScript.
* **`researcher.md` (Flash):** Поиск символов, разбор Repomix-снимков из `reference/` и маппинг API.
* **`reviewer.md` (Pro):** Строгий аудит чистоты архитектуры («Порты и Адаптеры»), лимитов сложности и утечек памяти.

### 14.4 Протокол контекста OpenViking (`.agents/knowledge/`)
* **L0 (Ментальная карта):** `.agents/knowledge/L0_index.json` — обзор проекта, метаданные и реестр подсистем.
* **L1 (Подсистемы):** `.agents/knowledge/subsystems/<subsystem_id>.md` — детальное описание архитектуры модулей.
* **L2 (ADR и CLI):** `.agents/knowledge/adr/` (архитектурные решения) и `.agents/knowledge/cli/commands.md` (реестр консольных интерфейсов).
* **Синхронизация знаний:** команда `sync-knowledge .` для обновления контекстной базы монорепозитория.

---

## 15. Корневые DX-скрипты монорепозитория (`package.json`)

```json
{
  "name": "obsidian-orbit",
  "private": true,
  "scripts": {
    "dev": "tsx scripts/link-vault.ts && turbo run dev",
    "vault:link": "tsx scripts/link-vault.ts",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "biome check --write .",
    "format": "biome format --write .",
    "test": "vitest run",
    "check": "biome check . && turbo run typecheck test build",
    "change": "changeset",
    "version:bump": "changeset version && tsx scripts/sync-versions.ts && pnpm install --no-frozen-lockfile",
    "release:merge": "tsx scripts/merge-release-pr.ts",
    "release": "turbo run build && tsx scripts/deploy-downstream.ts",
    "ai:context": "tsx scripts/generate-ai-context.ts",
    "ai:context:all": "tsx scripts/generate-ai-context.ts --all"
  }
}
```