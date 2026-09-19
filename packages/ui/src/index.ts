/**
 * Common UI helper types and badge contracts.
 * Strict TypeScript without any or enum.
 */

export const BadgeVariant = {
  Default: 'default',
  Success: 'success',
  Warning: 'warning',
  Danger: 'danger',
} as const

export type BadgeVariantType = (typeof BadgeVariant)[keyof typeof BadgeVariant]

export interface BadgeOptions {
  readonly label: string
  readonly variant?: BadgeVariantType
}

/**
 * Generates badge CSS classes for standard styling.
 */
export function getBadgeClassNames(variant: BadgeVariantType = BadgeVariant.Default): string {
  return `orbit-badge orbit-badge--${variant}`
}
