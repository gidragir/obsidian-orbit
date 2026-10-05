# Snippet Renderer for Obsidian

Interactive templates for code blocks and scripts with dynamic variable substitution in Obsidian.

## Features

- **Interactive Placeholders:** Define variables with `$NAME` or `${NAME}` inside your code blocks.
- **Form Controls:** Auto-generates input fields for each placeholder in the rendered note widget.
- **One-Click Copy & Quick Actions:** Easily copy substituted results with a single click.
- **Embedded Split Editor:** In-place template editor with real-time substitution preview.

## Usage

Use the ````snippet-renderer```` code block:

````markdown
```snippet-renderer
lang: bash
# Deploy script for $SERVICE_NAME
docker build -t $SERVICE_NAME:$TAG .
docker push my-registry.local/$SERVICE_NAME:$TAG
echo "Successfully deployed $SERVICE_NAME version $TAG"
```
````

When viewed in Reading mode or Live Preview, an interactive UI renders with text fields for `SERVICE_NAME` and `TAG`. Changing values updates the rendered snippet live.

## Installation

### Via BRAT
1. Install [BRAT](https://github.com/TfTHacker/obsidian-42-brat) in Obsidian.
2. In BRAT settings, click **Add Beta plugin**.
3. Enter repository: `gidragir/obsidian-snippet-renderer`.
4. Enable **Snippet Renderer** in Settings > Community Plugins.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-snippet-renderer/releases/latest).
2. Create folder `snippet-renderer` inside `<vault>/.obsidian/plugins/`.
3. Place downloaded files into the folder.
4. Reload Obsidian and toggle the plugin on.

## License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit)
