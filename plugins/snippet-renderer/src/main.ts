import { SnippetRenderChild } from '@ui/snippet-render-child'
import { extractFenceHeader } from '@utils/fence'
import { type MarkdownPostProcessorContext, Plugin } from 'obsidian'

export default class SnippetRendererPlugin extends Plugin {
  async onload(): Promise<void> {
    const processor = (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      const sectionInfo = ctx.getSectionInfo(el)
      const fenceHeader = sectionInfo
        ? extractFenceHeader(sectionInfo.text, sectionInfo.lineStart)
        : ''
      ctx.addChild(
        new SnippetRenderChild(el, this.app, this, source, ctx.sourcePath, fenceHeader, sectionInfo)
      )
    }

    this.registerMarkdownCodeBlockProcessor('snippet-renderer', processor)
  }
}
