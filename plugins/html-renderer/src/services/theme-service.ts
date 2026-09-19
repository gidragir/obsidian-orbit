import type { ThemeTokens } from '@utils/document-builder'

export class ThemeService {
  getThemeTokens(): ThemeTokens {
    if (typeof document === 'undefined') {
      return {
        bgColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'sans-serif',
      }
    }
    const bodyStyle = getComputedStyle(document.body)
    const bgColor = bodyStyle.getPropertyValue('--background-primary').trim() || '#ffffff'
    const textColor = bodyStyle.getPropertyValue('--text-normal').trim() || '#000000'
    const fontFamily = bodyStyle.getPropertyValue('--font-interface').trim() || 'sans-serif'
    return { bgColor, textColor, fontFamily }
  }
}
