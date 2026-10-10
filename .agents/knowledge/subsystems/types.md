# Подсистема: types (L1)

> **Идентификатор:** `types`
> **Теги:** types, result-handling | **Объем:** ~449 токенов BPE

## 🎯 Назначение и роль
Типы для обработки результатов и ошибок.

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/types/src/index.ts` | 54 | ⭐ Точка входа |
| `packages/types/package.json` | 17 | ⭐ Точка входа |
| `packages/types/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export type Result<T, E = Error> = |
export function ok<T>(value: T): Result<T, never>
export function err<E = Error>(error: E): Result<never, E>
export function isOk<T, E>( result: Result<T, E> ): result is
export function isErr<T, E>( result: Result<T, E> ): result is
export interface IFileMeta
export interface HotkeyDefinition
export interface CommandDefinition
export interface NoticeOptions
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter types test
```
