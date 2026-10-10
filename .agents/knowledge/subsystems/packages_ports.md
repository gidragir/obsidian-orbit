# Подсистема: Ports (L1)

> **Идентификатор:** `packages_ports`
> **Теги:** packages_ports, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~388 токенов BPE

## 🎯 Назначение и роль
Подсистема `packages/ports` с ключевыми точками входа: packages/ports/src/index.ts, packages/ports/package.json

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/ports/src/index.ts` | 36 | ⭐ Точка входа |
| `packages/ports/package.json` | 20 | ⭐ Точка входа |
| `packages/ports/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export interface IVaultPort
export interface ICommandPort
export interface ISettingsPort<T = unknown>
export interface INoticePort
export interface IClipboardPort
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter ports test
```
