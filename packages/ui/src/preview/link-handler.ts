export interface LinkOpener {
  openLinkText(
    linktext: string,
    sourcePath: string,
    newLeaf?: boolean | 'split' | 'tab' | 'window'
  ): Promise<void> | void
}

/**
 * Attaches a click handler to intercept internal wiki links (a.internal-link)
 * and open them via a link opener (e.g. Workspace).
 * Returns a cleanup function to unbind the event listener.
 */
export function attachInternalLinkHandler(
  containerEl: HTMLElement,
  opener: LinkOpener,
  sourcePath: string | (() => string)
): () => void {
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    const linkEl = target?.closest('a.internal-link') as HTMLAnchorElement | null
    if (linkEl) {
      event.preventDefault()
      const href = linkEl.getAttribute('data-href') ?? linkEl.getAttribute('href')
      if (href) {
        const resolvedPath = typeof sourcePath === 'function' ? sourcePath() : sourcePath
        const isMod = event.ctrlKey || event.metaKey || event.button === 1
        void opener.openLinkText(href, resolvedPath, isMod)
      }
    }
  }

  containerEl.addEventListener('click', onClick)

  return () => {
    containerEl.removeEventListener('click', onClick)
  }
}
