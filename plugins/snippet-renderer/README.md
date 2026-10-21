# Snippet Renderer for Obsidian

[![Part of Obsidian Orbit](https://img.shields.io/badge/Monorepo-Obsidian%20Orbit-7C3AED?logo=orbit)](https://github.com/gidragir/obsidian-orbit)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![GitHub Repository](https://img.shields.io/badge/GitHub-obsidian--snippet--renderer-blue?logo=github)](https://github.com/gidragir/obsidian-snippet-renderer)
[![Latest Release](https://img.shields.io/github/v/release/gidragir/obsidian-snippet-renderer?label=Release)](https://github.com/gidragir/obsidian-snippet-renderer/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🪐 **Monorepo:** Developed and maintained as part of [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit).  
> 📦 **Standalone Satellite Repository:** [gidragir/obsidian-snippet-renderer](https://github.com/gidragir/obsidian-snippet-renderer)

Interactive code and script templates with dynamic variable substitution, auto-generated form inputs, and live copy in Obsidian.

---

## ✨ Features

- **Dynamic Placeholders:** Define template variables using `$VARIABLE` or `${VARIABLE}` syntax anywhere in your code blocks.
- **Auto-Generated Form Controls:** Automatically scans for variables and generates interactive text fields in Reading mode and Live Preview.
- **Real-Time Reactive Substitution:** Values typed into inputs immediately update the preview code snippet in real time.
- **One-Click Copy & Quick Actions:** Copy the fully substituted snippet directly to the system clipboard with a single click.
- **Flexible Syntax Highlighting:**
  - Fence header syntax: ```` ```snippet-renderer:python ```` or ```` ```snippet-renderer lang:yaml ````
  - First-line syntax: `lang: bash`, `# lang: python`, `// lang: typescript`
  - Default syntax: `bash`
- **Embedded Split Editor:** Edit the template and preview rendered inputs simultaneously without breaking Markdown formatting.

---

## 🚀 Usage

### 1. Basic Template with Auto-Form Controls

````markdown
```snippet-renderer
lang: bash
# Deploy service to Kubernetes
kubectl set image deployment/$SERVICE_NAME $CONTAINER_NAME=myrepo/$SERVICE_NAME:$TAG --namespace=$NAMESPACE
kubectl rollout status deployment/$SERVICE_NAME --namespace=$NAMESPACE
```
````

When viewed in Reading mode or Live Preview:
1. Input fields for `SERVICE_NAME`, `CONTAINER_NAME`, `TAG`, and `NAMESPACE` are rendered above the code block.
2. Typing values into the inputs instantly substitutes the variables in the code preview below.
3. Clicking **Copy** copies the ready-to-run script with all values populated.

---

### 2. Language in Fence Header

````markdown
```snippet-renderer:python
import requests

api_url = "https://api.example.com/${ENDPOINT}"
headers = {"Authorization": "Bearer ${API_KEY}"}

response = requests.get(api_url, headers=headers)
print("Status:", response.status_code)
```
````

---

## 📥 Installation

### Via BRAT (Recommended for Beta Builds)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) in Obsidian (**Community plugins → Browse → BRAT**).
2. Open **Settings → BRAT** and click **Add Beta plugin**.
3. Enter repository path: `gidragir/obsidian-snippet-renderer`.
4. Enable **Snippet Renderer** in **Settings → Community Plugins**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-snippet-renderer/releases/latest).
2. Create a folder named `snippet-renderer` inside `<vault>/.obsidian/plugins/`.
3. Copy the downloaded files into `<vault>/.obsidian/plugins/snippet-renderer/`.
4. Reload Obsidian and toggle **Snippet Renderer** on.

---

## 🪐 Monorepo & Development

This plugin is developed within the [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit) monorepo.

To build from source:
```bash
git clone https://github.com/gidragir/obsidian-orbit.git
cd obsidian-orbit
pnpm install
pnpm build
```

---

## 📄 License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit) / [gidragir](https://github.com/gidragir)
