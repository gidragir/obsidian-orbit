import { describe, expect, it } from 'vitest'
import { parseTabs } from './tabs-parser'

describe('parseTabs', () => {
  it('handles source without split marker', () => {
    const result = parseTabs('Just some content', 'tab: ')
    expect(result.rawConfig).toBe('')
    expect(result.tabs).toHaveLength(1)
    expect(result.tabs[0]).toEqual({
      title: 'Tab 1',
      content: 'Just some content',
    })
  })

  it('uses default content when source is empty and no split marker', () => {
    const result = parseTabs('', 'tab: ', 'Custom 1', 'Default body')
    expect(result.rawConfig).toBe('')
    expect(result.tabs[0]).toEqual({
      title: 'Custom 1',
      content: 'Default body',
    })
  })

  it('parses multiple tabs with raw config', () => {
    const source = `top, one
tab: First Tab
Content for first tab
tab: Second Tab
Content for second tab`

    const result = parseTabs(source, 'tab: ')
    expect(result.rawConfig.trim()).toBe('top, one')
    expect(result.tabs).toHaveLength(2)
    expect(result.tabs[0]?.title).toBe('First Tab')
    expect(result.tabs[0]?.content.trim()).toBe('Content for first tab')
    expect(result.tabs[1]?.title).toBe('Second Tab')
    expect(result.tabs[1]?.content.trim()).toBe('Content for second tab')
  })

  it('handles nested tabs with backticks and tildes without splitting inner tabs', () => {
    const source = `tab: Outer Tab
\`\`\`tabs-renderer
tab: Inner Tab 1
Inner content 1
\`\`\`
tab: Next Outer Tab
Next outer content`

    const result = parseTabs(source, 'tab: ')
    expect(result.tabs).toHaveLength(2)
    expect(result.tabs[0]?.title).toBe('Outer Tab')
    expect(result.tabs[0]?.content).toContain('tab: Inner Tab 1')
    expect(result.tabs[1]?.title).toBe('Next Outer Tab')
    expect(result.tabs[1]?.content.trim()).toBe('Next outer content')
  })

  it('handles nested tabs with tildes ~~~tabs-renderer', () => {
    const source = `tab: Outer Tab
~~~tabs-renderer
tab: Inner Tab Tilde
Inner content tilde
~~~
tab: Outer 2
Outer 2 content`

    const result = parseTabs(source, 'tab: ')
    expect(result.tabs).toHaveLength(2)
    expect(result.tabs[0]?.content).toContain('tab: Inner Tab Tilde')
    expect(result.tabs[1]?.title).toBe('Outer 2')
  })

  it('does not split when tab: is inside a standard code block', () => {
    const source = `tab: Script
\`\`\`bash
echo "hello"
tab: ignored_inside_code
\`\`\`
tab: Tab 2
Content 2`

    const result = parseTabs(source, 'tab: ')
    expect(result.tabs).toHaveLength(2)
    expect(result.tabs[0]?.title).toBe('Script')
    expect(result.tabs[0]?.content).toContain('tab: ignored_inside_code')
    expect(result.tabs[1]?.title).toBe('Tab 2')
    expect(result.tabs[1]?.content.trim()).toBe('Content 2')
  })
})
