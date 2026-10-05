# HTML Renderer for Obsidian

Render self-contained HTML, CSS, and JavaScript widgets inside secure, isolated iframes within Obsidian.

## Features

- **Sandboxed Execution:** Executes embedded scripts in an isolated iframe, preventing stylesheet leaks and scope pollution.
- **Full Web Stack:** Supports embedded `<style>`, `<script>`, SVG graphics, Canvas animations, and external libraries.
- **Embedded Split Editor:** In-place code editing with a live reactive preview pane.
- **Zero Configuration:** Works out of the box with standard ````html-renderer```` code blocks.

## Usage

Use the ````html-renderer```` code block:

````markdown
```html-renderer
<style>
  .counter-box {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: sans-serif;
  }
  button {
    padding: 6px 12px;
    cursor: pointer;
  }
</style>

<div class="counter-box">
  <button id="btn">Click me: 0</button>
</div>

<script>
  let count = 0;
  const btn = document.getElementById('btn');
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = `Click me: ${count}`;
  });
</script>
```
````

## Installation

### Via BRAT
1. Install [BRAT](https://github.com/TfTHacker/obsidian-42-brat) in Obsidian.
2. In BRAT settings, click **Add Beta plugin**.
3. Enter repository: `gidragir/obsidian-html-renderer`.
4. Enable **HTML Renderer** in Settings > Community Plugins.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-html-renderer/releases/latest).
2. Create folder `html-renderer` inside `<vault>/.obsidian/plugins/`.
3. Place downloaded files into the folder.
4. Reload Obsidian and toggle the plugin on.

## License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit)
