# Tabs Renderer for Obsidian

Organize your Obsidian notes into sleek, tabbed views using simple Markdown code blocks.

## Features

- **Markdown-first:** Define tabs directly within your notes using standard Markdown headings or bullet lists.
- **Embedded Editor Modal:** Quickly edit tab contents in-place with a native split preview editor.
- **Responsive Layout:** Automatically scales across desktop and mobile screens.
- **Obsidian Native Styling:** Inherits your active Obsidian theme and CSS variables seamlessly.

## Usage

Use the ````tabs-renderer```` code block in your notes:

````markdown
```tabs-renderer
# Tab 1
Content for the first tab with **markdown formatting**.

# Tab 2
Content for the second tab, including [[Internal Links]] and lists:
- Item A
- Item B
```
````

## Installation

### Via BRAT (Beta Reviewers Auto-update Tester)
1. Install the [BRAT](https://github.com/TfTHacker/obsidian-42-brat) plugin in Obsidian.
2. In BRAT settings, click **Add Beta plugin**.
3. Enter repository: `gidragir/obsidian-tabs-renderer`.
4. Enable **Tabs Renderer** in Settings > Community Plugins.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-tabs-renderer/releases/latest).
2. Create a folder named `tabs-renderer` under `<vault>/.obsidian/plugins/`.
3. Copy the downloaded files into that folder.
4. Reload Obsidian and enable the plugin.

## License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit)
