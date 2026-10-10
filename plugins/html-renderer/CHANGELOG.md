# html-renderer

## 1.1.0

### Minor Changes

- Support Obsidian 1.13.0+ declarative Settings API and settings search indexing
  
  - Implemented `getSettingDefinitions()`, `getControlValue()`, and `setControlValue()` for deep search indexing in Obsidian Settings
  - Added search aliases (EN/RU) for quick fuzzy lookup of plugin options
  - Preserved legacy `display()` as imperative fallback for backward compatibility (dual-support pattern)

## 1.0.0

### Major Changes

- cf2d248: Initial release of Obsidian Orbit plugin suite:
  - tabs-renderer v1.0.0: Note organization in tabs with split code editor
  - html-renderer v1.0.0: Sandboxed HTML/CSS/JS execution iframe with split editor
  - snippet-renderer v1.0.0: Interactive script templates with live variable substitution
