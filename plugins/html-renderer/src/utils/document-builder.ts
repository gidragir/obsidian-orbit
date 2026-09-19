export interface ThemeTokens {
  readonly bgColor: string
  readonly textColor: string
  readonly fontFamily: string
}

export class HTMLDocumentBuilder {
  private htmlContent = ''
  private inheritTheme = false
  private themeTokens: ThemeTokens | null = null
  private enableAutoResize = false

  setHtmlContent(content: string): this {
    this.htmlContent = content
    return this
  }

  withThemeStyles(enabled: boolean): this {
    this.inheritTheme = enabled
    return this
  }

  withThemeTokens(tokens: ThemeTokens | null): this {
    this.themeTokens = tokens
    return this
  }

  withAutoResizeScript(enabled: boolean): this {
    this.enableAutoResize = enabled
    return this
  }

  build(): string {
    const themeStyle = this.buildThemeStyle()
    const autoHeightScript = this.buildAutoHeightScript()

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${themeStyle}
</head>
<body>
<div id="html-renderer-root">
${this.htmlContent}
</div>
${autoHeightScript}
</body>
</html>`
  }

  private buildThemeStyle(): string {
    if (!this.inheritTheme) {
      return `<style>
\thtml, body {
\t\tmargin: 0 !important;
\t\tpadding: 0 !important;
\t\tbox-sizing: border-box;
\t\toverflow: hidden !important;
\t}
\t#html-renderer-root {
\t\tdisplay: flow-root;
\t\tpadding: 12px;
\t\tbox-sizing: border-box;
\t}
</style>`
    }

    const bgColor = this.themeTokens?.bgColor ?? '#ffffff'
    const textColor = this.themeTokens?.textColor ?? '#000000'
    const fontFamily = this.themeTokens?.fontFamily ?? 'sans-serif'

    return `<style>
\t:root {
\t\t--bg-color: ${bgColor};
\t\t--text-color: ${textColor};
\t\t--font-family: ${fontFamily};
\t}
\thtml, body {
\t\tbackground-color: var(--bg-color);
\t\tcolor: var(--text-color);
\t\tfont-family: var(--font-family);
\t\tmargin: 0 !important;
\t\tpadding: 0 !important;
\t\tbox-sizing: border-box;
\t\toverflow: hidden !important;
\t}
\t#html-renderer-root {
\t\tdisplay: flow-root;
\t\tpadding: 12px;
\t\tbox-sizing: border-box;
\t}
</style>`
  }

  private buildAutoHeightScript(): string {
    if (!this.enableAutoResize) {
      return ''
    }

    return `<script>
\tlet lastSentHeight = 0;
\tfunction sendHeight() {
\t\tconst root = document.getElementById('html-renderer-root');
\t\tif (!root) return;
\t\tconst height = Math.ceil(root.getBoundingClientRect().height);
\t\tif (height > 0 && Math.abs(height - lastSentHeight) > 2) {
\t\t\tlastSentHeight = height;
\t\t\twindow.parent.postMessage({ type: 'html-renderer-resize', height: height }, '*');
\t\t}
\t}
\twindow.addEventListener('load', sendHeight);
\tif (typeof ResizeObserver !== 'undefined') {
\t\tconst root = document.getElementById('html-renderer-root');
\t\tif (root) {
\t\t\tnew ResizeObserver(() => {
\t\t\t\tsendHeight();
\t\t\t}).observe(root);
\t\t}
\t}
</script>`
  }
}
