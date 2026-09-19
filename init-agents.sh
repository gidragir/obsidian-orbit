#!/usr/bin/env bash
# STREAMING_CHUNK:Configuring script execution environment...
set -euo pipefail

echo "==> Развертывание конфигурации Antigravity в текущей директории..."

# STREAMING_CHUNK:Creating directory hierarchy...
# 1. Создание структуры каталогов
mkdir -p .agents/rules
mkdir -p .agents/skills/obsidian-architect
mkdir -p .agents/skills/complexity-guard
mkdir -p .agents/skills/biome-refactor
mkdir -p .agents/skills/reference-migrator
mkdir -p .agents/skills/semver-changeset
mkdir -p .agent/workflows

# STREAMING_CHUNK:Generating root AGENTS.md document...
# 2. Генерация AGENTS.md (SSOT в корне)
cat << 'EOF' > AGENTS.md
# Генеральный регламент ИИ-агентов (AGENTS.md)

Настоящий документ является главным системным контрактом и единым источником правды (Single Source of Truth, SSOT) для автономных агентов платформы **Google Antigravity IDE** и среды **Antigravity 2.0**. Документ автоматически загружается при инициализации сессии и обладает наивысшим приоритетом при принятии любых архитектурных, инженерных и процедурных решений.

## 1. Среда исполнения и тандем моделей Gemini

Разработка ведется в среде нативного **Linux (CachyOS / Arch Linux)** с использованием распределенного тандема моделей:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ОРКЕСТРАТОР (Gemini Pro)                            │
│  • Анализ архитектурных инвариантов и контрактов монорепозитория            │
│  • Глубокий аудит сторонних плагинов-референсов из reference/               │
│  • Декомпозиция задач, контроль паттернов («Порты и Адаптеры», Facade)      │
│  • Аудит метрик сложности кода (когнитивная <= 15, цикломатическая <= 10)   │
│  • Формирование артефактов Implementation Plan и архитектурных планов       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Делегирование задач и контроль качества
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     СУБАГЕНТ ИСПОЛНЕНИЯ (Gemini Flash)                      │
│  • Субсекундная генерация чистых доменных функций и unit-тестов Vitest     │
│  • Реализация тонких адаптеров Obsidian API (src/main.ts, src/ui/)          │
│  • Выполнение автономных верификационных циклов в терминале (pnpm check)    │
│  • Автоматическое устранение дефектов Biome (pnpm lint && pnpm format)      │
│  • Исправление типовых несовпадений TypeScript без использования any и !    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Иерархия системы контекста Antigravity 2.0

Для предотвращения деградации внимания моделей контекст монорепозитория структурирован по пятиуровневой схеме с механизмом прогрессивного раскрытия (Progressive Disclosure):

1. **Генеральный контекст (`AGENTS.md`):** Базовые архитектурные табу, роли моделей, метрики сложности и тулчейн (всегда в контексте).
2. **Гранулярные правила (`.agents/rules/*.md`):** Загружаются по декларативным триггерам:
   * `00-architecture.md` — Always On (инварианты монорепозитория, SSOT, пути).
   * `10-biome-typescript.md` — Glob: `**/*.{ts,tsx,json,css}` (стандарты типизации и Biome).
   * `15-patterns-complexity.md` — Glob: `**/*.{ts,tsx}` (паттерны и лимиты сложности).
   * `20-obsidian-plugins.md` — Glob: `plugins/**` (жизненный цикл плагинов, стили тем).
   * `30-packages-source.md` — Glob: `packages/**` (модель Direct TS Source).
   * `40-pure-testing.md` — Glob: `**/*.test.ts` (чистые тесты Vitest в Node.js).
   * `50-changesets.md` — Model Decision (релизные операции и SemVer).
3. **Специализированные навыки (`.agents/skills/*/SKILL.md`):** Подгружаются динамически по семантическому триггеру в поле `description`:
   * `obsidian-architect` — Архитектура плагинов, предотвращение утечек памяти, порты и адаптеры.
   * `complexity-guard` — Снижение когнитивной и цикломатической сложности, рефакторинг ветвлений.
   * `biome-refactor` — Ликвидация `any`, `enum`, non-null assertion `!`, parameter properties.
   * `reference-migrator` — Разбор Markdown-снимков Repomix и адаптация сторонних референсов.
   * `semver-changeset` — Расчет инкремента SemVer для Obsidian и оформление ченджсетов.
4. **Рабочие процессы (`.agent/workflows/*.md`):** Регламентированные пошаговые сценарии для вызова через Slash-команды (`/new-plugin`, `/refactor-reference`, `/verify`, `/prepare-release`).
5. **Протокол контекста MCP (`.agents/mcp.json`):** Внешний сервер `fetch` для выгрузки актуальной документации Obsidian API и CodeMirror 6.

## 3. Фундаментальные архитектурные инварианты (Жесткие табу)

Любое действие агента обязано строго соблюдать следующие ограничения:

1. **Запрет восходящих относительных импортов (`../../`):**
   * Внутри плагинов (`plugins/<id>/src/**`) запрещены пути выхода вверх за пределы модуля.
   * Обязательно использование алиасов `tsconfig.json`: `@ui/*`, `@settings/*`, `@services/*`.
   * Для общих библиотек используется только скоуп `@packages/*`.
2. **Модель прямого импорта исходников (Direct TS Source):**
   * Разделяемые пакеты (`@packages/obsidian-utils`, `@packages/ui`) **не имеют фазы сборки** и каталогов `dist/`.
   * Бандлер каждого плагина (`esbuild`) производит инлайн-компиляцию чистого TypeScript в конечный `main.js`.
3. **Pinpoint-версионирование и Pnpm Catalogs:**
   * В манифестах `package.json` запрещены плавающие диапазоны (`^`, `~`).
   * Внутренние связи фиксируются через `workspace:*`.
   * Сторонние библиотеки объявляются в `catalog:` файла `pnpm-workspace.yaml` и подключаются как `"catalog:"`.
4. **Чистые Unit-тесты (Строгий запрет DOM и моков Obsidian):**
   * Запрещено подключение эмуляторов браузера (`happy-dom`, `jsdom`, `@testing-library`).
   * Запрещено создавать моки классов `App`, `Vault`, `Workspace`, `TFile` или `Plugin`.
   * Тестированию в Vitest (`node:test` среда) подлежит только чистая доменная логика (`src/utils/`, `@packages/obsidian-utils`).
5. **Неприкосновенность тестового хранилища `.vault/`:**
   * Запрещено напрямую модифицировать файлы в `.vault/.obsidian/plugins/`.
   * Доступ плагинов в хранилище настраивается исключительно через симлинки скриптом `pnpm vault:link`.
6. **Контракт релизного цикла Changesets:**
   * Запрещено вручную менять версии в `manifest.json`, `package.json` и `versions.json`.
   * Версионирование выполняется через ченджсеты (`pnpm change`) и скрипт `scripts/sync-versions.ts`.

## 4. Паттерны проектирования и лимиты сложности кода

Кодовая база проекта проектируется по стандартам Clean Architecture / Hexagonal Architecture.

### 4.1 Архитектурный стиль «Порты и Адаптеры»
* **Доменное ядро (`src/utils/`, `@packages/obsidian-utils`):**
  * Содержит парсеры Markdown, математику, стейт-машины и бизнес-правила.
  * 0% зависимостей от `obsidian`, `electron` или DOM. 100% покрытие unit-тестами Vitest.
* **Слой адаптеров (`src/services/`, `src/ui/`, `src/main.ts`):**
  * Реализует интерфейсы взаимодействия с хранилищем (`app.vault`), кэшем (`app.metadataCache`) и интерфейсом (`ItemView`, `Modal`).
  * Не содержит алгоритмической логики, требующей unit-тестов.

### 4.2 Запрет God-класса
* Класс `main.ts` является тонким фасадным адаптером жизненного цикла.
* Метод `onload()` не должен превышать **20–30 строк**. Инициализация выносится в подметоды: `registerCommands()`, `registerViews()`, `registerEvents()`.
* Все операции с заметками делегируются классам сервисов (`@services/*`).

### 4.3 Нормативные пороги сложности кода

| Метрика | Норматив | Предел для парсеров | Инструмент контроля |
|---|---|---|---|
| **Когнитивная сложность** | **<= 15** | 15 (без исключений) | Biome `complexity/noExcessiveCognitiveComplexity` |
| **Цикломатическая сложность** | **<= 10** | До 15 (для таблиц маппинга) | Статический аудит AST / Gemini Pro |
| **Глубина вложенности блоков** | **<= 3** | 3 (без исключений) | Code Review / Линтер |
| **Размер функций / методов** | **<= 40 строк** | До 50 строк (для конфигураций) | Архитектурный регламент |

### 4.4 Эвристики снижения сложности
* **Guard Clauses (Early Return):** Проверка граничных условий в начале метода с немедленным выходом вместо каскадов `if`.
* **Strategy Lookup Map:** Замена длинных конструкций `switch` и `if-else` на типизированные словари `Record<Key, Handler>`.
* **Expressive Predicates:** Вынос составных булевых условий в чистые функции-предикаты (`isMarkdownTable()`, `canSyncSettings()`).

## 5. Стандарты качества Biome и строгой типизации TypeScript

Кодовая база форматируется и проверяется через Biome. Следующие конструкции вызывают ошибку и блокируют работу:

1. **Запрет `any` (`noExplicitAny: "error"`):** Замена на `unknown` с сужением типа через Type Guards (`isTFile(val)`) или обобщенные типы (Generics `<T>`).
2. **Запрет `enum` (`noEnum: "error"`):** Замена на константный объект и литеральное объединение (`as const`).
3. **Запрет Non-null Assertion `!` (`noNonNullAssertion: "error"`):** Замена на защитные проверки с понятным исключением или fallback-оператор `??`.
4. **Запрет Parameter Properties (`noParameterProperties: "error"`):** Поля класса объявляются в теле класса явно.
5. **Префиксы системных модулей:** Системные библиотеки Node.js импортируются строго с префиксом `node:` (`node:path`, `node:fs`, `node:os`).
6. **Стилизация:** В CSS запрещен хардкод HEX/RGB-цветов. Используются только нативные переменные темы Obsidian (`var(--text-normal)`, `var(--background-primary)`, `var(--interactive-accent)`).

## 6. Взаимодействие с внешними инструментами через MCP

В файле `.agents/mcp.json` настроен сервер **`fetch`**:
* **Назначение:** Чтение актуальной документации Obsidian API (`docs.obsidian.md`), спецификаций CodeMirror 6 и журналов изменений.
* **Правило экономии контекста:** Агент вызывает `fetch` только при исследовании новых, ранее неизвестных API-методов или для сверки сигнатур типов. Инструмент не вызывается для тривиальных методов (`addCommand`, `registerView`).

## 7. Каталог исполняемых рабочих процессов (Workflows)

Воркфлоу запускаются разработчиком через Slash-команды в чате Antigravity:
* **`/new-plugin` (`.agent/workflows/new-plugin.md`):** Скаффолдинг плагина, манифестов, tsconfig-алиасов и чистых тестов.
* **`/refactor-reference` (`.agent/workflows/refactor-reference.md`):** Аудит снимков сторонних референсов Repomix и декомпозиция.
* **`/verify` (`.agent/workflows/verify.md`):** Автономный цикл Gemini Flash: `biome check` -> `typecheck` -> `test` -> `build`.
* **`/prepare-release` (`.agent/workflows/prepare-release.md`):** Расчет инкремента SemVer и генерация ченджсета.

## 8. Справочник консольных команд тулчейна

| Команда | Назначение | Обязательность агентом |
|---|---|---|
| `pnpm check` | Комплексный запуск: Biome + Typecheck + Unit Tests + Turbo Build. | **Строго обязательно** перед завершением любой задачи. |
| `pnpm biome check .` | Проверка линтером и форматтером Biome. | Для быстрого аудита синтаксиса и сложности. |
| `pnpm lint && pnpm format` | Автоматическое исправление стиля Biome. | При обнаружении стилистических замечаний. |
| `pnpm turbo run typecheck` | Строгая проверка типов через компилятор TypeScript. | При модификации интерфейсов и типов. |
| `pnpm turbo run test` | Запуск unit-тестов Vitest в Node.js рантайме. | После любых правок в `src/utils/` или `@packages/*`. |
| `pnpm turbo run build` | Тестовая сборка всех плагинов через esbuild. | Для подтверждения целостности бандлов `main.js`. |
| `pnpm vault:link` | Пересоздание символических ссылок в `.vault/`. | При создании или переименовании плагина. |
| `pnpm change` | Генерация файла ченджсета Changesets. | При подготовке функциональных изменений к релизу. |
| `pnpm release:merge` | Автослияние релизного PR через GitHub CLI и `git pull`. | При выполнении релиза из консоли. |
| `pnpm ai:context <name>` | Упаковка референс-плагина из `reference/` через Repomix. | Перед началом портирования стороннего плагина. |
EOF

# STREAMING_CHUNK:Writing MCP configuration...
# 3. Генерация .agents/mcp.json
cat << 'EOF' > .agents/mcp.json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch"
      ],
      "env": {},
      "description": "Загрузка актуальной документации Obsidian API, спецификаций CodeMirror 6 и changelog Obsidian в формате чистый Markdown."
    }
  }
}
EOF

# STREAMING_CHUNK:Generating architecture rules...
# 4. Генерация Правил (.agents/rules/*.md)
cat << 'EOF' > .agents/rules/00-architecture.md
---
trigger: always_on
description: "Core architectural invariants of the Obsidian plugins monorepo. Enforces Direct TS Source, strict path aliases, Zero-copy symlinks, and Ports & Adapters separation."
---

# 00: Core Monorepo Architecture Invariants

1. **Единый источник правды (SSOT):** Вся разработка ведется в данном монорепозитории. Сателлиты — только downstream mirrors.
2. **Direct TS Source:** Пакеты `@packages/*` не имеют фазы сборки `dist/`. Импортируются чистые TS-исходники.
3. **Pinpoint-версионирование:** Запрет `^` и `~`. Пакеты линкуются через `workspace:*`, зависимости через `catalog:`.
4. **Запрет относительных импортов вверх:** Запрещено `../../` внутри плагинов. Используются `@ui/*`, `@settings/*`, `@services/*` и `@packages/*`.
5. **Неприкосновенность `.vault/`:** Прямые правки запрещены. Доступ только через `pnpm vault:link`.
EOF

# STREAMING_CHUNK:Generating TypeScript and Biome rules...
cat << 'EOF' > .agents/rules/10-biome-typescript.md
---
trigger: glob
globs: ["**/*.ts", "**/*.tsx", "**/*.json", "**/*.css"]
description: "Strict TypeScript compilation rules, Biome linter invariants, and code formatting standards. Prohibits any, enum, non-null assertions, and parameter properties."
---

# 10: Strict TypeScript & Biome Standards

1. **Форматирование:** Одинарные кавычки `'`, без точек с запятой, 2 пробела, строка до 100 символов.
2. **Табу Biome:**
   * Запрет `any` (`noExplicitAny`): замена на `unknown` с Type Guards или Generics.
   * Запрет `enum` (`noEnum`): замена на const object + union type.
   * Запрет `!` (`noNonNullAssertion`): замена на Guard Clauses или `??`.
   * Запрет `noParameterProperties`: объявлять свойства явно в теле класса.
   * Системные модули Node.js строго с префиксом `node:`.
EOF

# STREAMING_CHUNK:Generating design patterns and complexity rules...
cat << 'EOF' > .agents/rules/15-patterns-complexity.md
---
trigger: glob
globs: ["**/*.ts", "**/*.tsx"]
description: "Design patterns and architectural limits on code complexity. Enforces cognitive complexity <= 15, cyclomatic complexity <= 10, nesting depth <= 3, and SRP."
---

# 15: Design Patterns & Complexity Control

1. **Архитектурный шаблон:** Порты и Адаптеры. Доменное ядро (`src/utils/`, `@packages/obsidian-utils`) — 0% зависимостей от DOM и Obsidian API, 100% тесты Vitest.
2. **Запрет God-класса:** `main.ts` — тонкий адаптер, `onload()` не более 20–30 строк.
3. **Лимиты сложности:**
   * Когнитивная сложность: <= 15 на функцию.
   * Цикломатическая сложность: <= 10 на функцию (до 15 для маппингов).
   * Глубина вложенности блоков: <= 3.
   * Размер функции: <= 40 строк.
4. **Эвристики:** Guard Clauses, Strategy Lookup Maps, Expressive Predicates.
EOF

# STREAMING_CHUNK:Generating Obsidian plugin standards...
cat << 'EOF' > .agents/rules/20-obsidian-plugins.md
---
trigger: glob
globs: ["plugins/**"]
description: "Standards for Obsidian plugins lifecycle, DOM event registration, manifest compliance, and theme-safe CSS variable styling."
---

# 20: Obsidian Plugins Standards & Lifecycle

1. **Точка входа:** Экспорт по умолчанию `export default class MyPlugin extends Plugin`.
2. **Безопасность памяти:** Слушатели событий — только через `this.registerDomEvent`, `this.registerEvent`, таймеры через `this.registerInterval`.
3. **Стилизация:** Никакого хардкода цветов в `src/styles.css`. Только нативные переменные темы (`var(--text-normal)`, `var(--background-primary)`).
4. **Манифест:** `id` строго совпадает с папкой, `minAppVersion >= 1.7.0`, `isDesktopOnly: false`.
EOF

# STREAMING_CHUNK:Generating package and testing rules...
cat << 'EOF' > .agents/rules/30-packages-source.md
---
trigger: glob
globs: ["packages/**"]
description: "Guidelines for shared internal packages using the Direct TS Source model, export maps, and peer dependency declarations for obsidian."
---

# 30: Shared Packages Architecture (Direct TS Source)

1. **Модель:** Без каталогов `dist/` и фазы сборки. Экспорт напрямую `"exports": { ".": "./src/index.ts" }`.
2. **Типы Obsidian:** Объявляются одновременно в `peerDependencies: { "obsidian": "catalog:" }` и `devDependencies: { "obsidian": "catalog:" }`.
3. **Разделение:** Чистая логика — в `@packages/obsidian-utils`, общие UI-элементы — в `@packages/ui`.
EOF

cat << 'EOF' > .agents/rules/40-pure-testing.md
---
trigger: glob
globs: ["**/*.test.ts"]
description: "Enforces pure unit testing standards in Node.js runtime using Vitest. Prohibits DOM emulators, happy-dom, jsdom, and Obsidian runtime mocks."
---

# 40: Pure Unit Testing Standards (Vitest)

1. **Рантайм:** Чистый Node.js (`environment: 'node'`).
2. **Запреты:** Никаких эмуляторов (`happy-dom`, `jsdom`) и моков `App`, `Vault`, `Plugin`.
3. **Область:** Тестируются парсеры Markdown, валидаторы, стейт-машины, хелперы данных.
4. **Размещение:** Рядом с чистыми функциями в `src/utils/*.test.ts`.
EOF

# STREAMING_CHUNK:Generating changesets and release rules...
cat << 'EOF' > .agents/rules/50-changesets.md
---
trigger: model_decision
description: "Semantic versioning bump rules, Changeset artifact generation, and release automation for Obsidian plugins."
---

# 50: Changesets & Release Automation

1. **Запрет ручной правки:** Версии в `manifest.json`, `package.json`, `versions.json` вручную не редактируются.
2. **Классификация SemVer:**
   * `major`: Изменение схемы `data.json`, удаление команд.
   * `minor`: Новые команды, новая вкладка настроек, расширение API.
   * `patch`: Баг-фиксы, стили CSS, внутренний рефакторинг.
3. **Хук синхронизации:** `pnpm version:bump` вызывает `scripts/sync-versions.ts`.
EOF

# STREAMING_CHUNK:Generating Obsidian architect skill...
# 5. Генерация Навыков (.agents/skills/*/SKILL.md)
cat << 'EOF' > .agents/skills/obsidian-architect/SKILL.md
---
name: obsidian-architect
description: "Provides architectural patterns, lifecycle safety contracts, event management, and Ports & Adapters isolation for Obsidian.md plugins and packages. Use when designing new plugins, restructuring plugin internals, or interacting with Obsidian Vault and MetadataCache APIs."
---

# Obsidian Architect Skill

1. **Порты и Адаптеры:** Доменные интерфейсы выносятся в `src/utils/`, адаптеры `app.vault` — в `src/services/`.
2. **Жизненный цикл:** Регистрация всех подписок строго через `this.registerEvent`, `this.registerDomEvent`, `this.registerInterval`.
3. **Тонкий `main.ts`:** Метод `onload()` разгружается в приватные методы `registerCommands()`, `registerViews()`.
4. **Безопасные стили:** Использование нативных CSS-переменных темы Obsidian.
EOF

# STREAMING_CHUNK:Generating complexity guard skill...
cat << 'EOF' > .agents/skills/complexity-guard/SKILL.md
---
name: complexity-guard
description: "Audits and refactors complex TypeScript functions exceeding cognitive complexity 15, cyclomatic complexity 10, or nesting depth 3. Use when breaking down God classes, optimizing branching logic, or refactoring legacy methods."
---

# Complexity Guard Skill

1. **Пороги:** Когнитивная сложность <= 15, цикломатическая <= 10, вложенность <= 3, строки <= 40.
2. **Guard Clauses:** Ранние инвертированные возвраты `if (!file) return;` вместо каскадных вложений.
3. **Strategy Lookup Map:** Типизированные словари `Record<Key, Handler>` вместо громоздких `switch`.
4. **Expressive Predicates:** Вынос составных булевых выражений в чистые функции-предикаты (`isMarkdownTable()`).
EOF

# STREAMING_CHUNK:Generating Biome refactoring skill...
cat << 'EOF' > .agents/skills/biome-refactor/SKILL.md
---
name: biome-refactor
description: "Guides strict TypeScript resolution of Biome violations including noExplicitAny, noEnum, noNonNullAssertion, and noParameterProperties. Use when fixing linter errors, resolving TypeScript type mismatches, or preparing code for CI validation."
---

# Biome & Strict TypeScript Refactoring Skill

1. **Устранение `any`:** Замена на `unknown` с сужением типа через Type Guards либо Generic-параметры `<T>`.
2. **Устранение `enum`:** Замена на `const Object as const` + `typeof Object[keyof typeof Object]`.
3. **Устранение `!`:** Замена на проверку `if (!val) throw new Error(...)` или оператор `??`.
4. **Parameter Properties:** Явное объявление полей в теле класса вместо аргументов конструктора.
5. **Префикс `node:`:** Для всех модулей стандартной библиотеки Node.js.
EOF

# STREAMING_CHUNK:Generating reference migrator skill...
cat << 'EOF' > .agents/skills/reference-migrator/SKILL.md
---
name: reference-migrator
description: "Specialized methodology for ingesting, dissecting, and migrating legacy Obsidian plugin source snapshots (from reference/ directory generated by Repomix) into modern monorepo architecture. Use when adopting, porting, or rebuilding third-party plugins."
---

# Reference Migrator Skill

1. **Аудит снимка:** Анализ `reference/*-context.md` силами Gemini Pro.
2. **Замена легаси:** Замена `moment.js` и `lodash` на нативные JS API.
3. **Декомпозиция:** Перенос чистых функций в `src/utils/` с обязательными тестами Vitest, универсальной логики — в `@packages/*`.
4. **Контроль:** Запуск навыков `complexity-guard` и `biome-refactor` перед финальным `pnpm check`.
EOF

# STREAMING_CHUNK:Generating SemVer changeset skill...
cat << 'EOF' > .agents/skills/semver-changeset/SKILL.md
---
name: semver-changeset
description: "Determines accurate Semantic Versioning bumps (patch, minor, major) for Obsidian plugins according to settings migration safety and API contracts. Use when creating changesets, documenting PR changes, or preparing a release."
---

# SemVer & Changeset Skill

1. **Матрица версий:**
   * `major`: Смена схемы `data.json`, удаление команд.
   * `minor`: Добавление команд, настроек или UI-панелей.
   * `patch`: Баг-фиксы парсеров, верстки CSS, тестов.
2. **Оформление ченджсета:** Понятное для конечного пользователя резюме изменений в файле `.changeset/<hash>.md`.
EOF

# STREAMING_CHUNK:Generating new plugin workflow...
# 6. Генерация Рабочих Процессов (.agent/workflows/*.md)
cat << 'EOF' > .agent/workflows/new-plugin.md
---
description: "Scaffold a new Obsidian plugin adhering to monorepo architecture, Ports & Adapters, and strict Biome standards."
---

# Workflow: /new-plugin

1. Получить `id`, `name`, `description` плагина.
2. Создать директории `plugins/<id>/src/{ui,settings,services,utils}`.
3. Создать `manifest.json`, `versions.json`, `package.json`, `tsconfig.json`.
4. Сгенерировать тонкий `src/main.ts` и чистую функцию с тестом `src/utils/helpers.test.ts`.
5. Выполнить `pnpm vault:link` и верифицировать сборку через `pnpm check`.
EOF

# STREAMING_CHUNK:Generating reference refactoring workflow...
cat << 'EOF' > .agent/workflows/refactor-reference.md
---
description: "Dissect and port a third-party Obsidian plugin reference from reference/ directory into modern clean monorepo architecture."
---

# Workflow: /refactor-reference

1. Проверить наличие `reference/<target>-context.md` (или вызвать `pnpm ai:context <target>`).
2. Провести аудит кода силами Gemini Pro (выявление God-классов, устаревших библиотек).
3. Сформировать Implementation Plan.
4. Создать плагин командой `/new-plugin`.
5. Перенести логику в `utils` (+тесты) -> `services` -> `ui` -> `main.ts`.
6. Выполнить очистку через `complexity-guard` и `biome-refactor`.
7. Финализировать через `pnpm check`.
EOF

# STREAMING_CHUNK:Generating verification workflow...
cat << 'EOF' > .agent/workflows/verify.md
---
description: "Autonomous self-healing verification cycle. Runs Biome, TypeScript typecheck, Vitest unit tests, and Turbo build with automatic fixes."
---

# Workflow: /verify

1. Выполнить `pnpm biome check .` (при ошибках запустить `pnpm lint && pnpm format`).
2. Запустить проверку типов: `pnpm turbo run typecheck`.
3. Запустить unit-тесты Vitest: `pnpm turbo run test`.
4. Выполнить тестовую сборку: `pnpm turbo run build`.
5. Сформировать краткий статус-отчет об успешности проверок.
EOF

# STREAMING_CHUNK:Generating release preparation workflow...
cat << 'EOF' > .agent/workflows/prepare-release.md
---
description: "Prepare an Obsidian plugin release. Calculates SemVer increment, generates a Changeset artifact, and creates a Conventional Commit."
---

# Workflow: /prepare-release

1. Проверить статус репозитория: `git status --porcelain`.
2. Рассчитать инкремент SemVer и вызвать `pnpm change` (или создать `.changeset/<hash>.md`).
3. Запустить верификацию: `pnpm check`.
4. Создать Conventional Commit: `feat(<plugin>): ...` или `fix(<plugin>): ...`.
EOF

# STREAMING_CHUNK:Configuring compatibility symlinks...
# 7. Симлинки обратной совместимости для Antigravity
if [ ! -e ".agents/workflows" ]; then
  ln -s ../.agent/workflows .agents/workflows
fi
if [ ! -e ".agent/rules" ]; then
  ln -s ../.agents/rules .agent/rules
fi

echo "==> Успешно! Создано файлов:"
echo "  - AGENTS.md"
echo "  - .agents/mcp.json"
echo "  - .agents/rules/*.md (7 шт.)"
echo "  - .agents/skills/*/SKILL.md (5 шт.)"
echo "  - .agent/workflows/*.md (4 шт.)"
echo "  - Симлинки совместимости .agent <-> .agents"