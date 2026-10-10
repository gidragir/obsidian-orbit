# Подсистема: ports (L1)

> **Идентификатор:** `ports`
> **Теги:** interfaces, ports | **Объем:** ~388 токенов BPE

## 🎯 Назначение и роль
Интерфейсы для взаимодействия с внешними системами.

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
