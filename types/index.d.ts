export type WidgetPosition = 'bottom-right' | 'bottom-left'
export type WidgetPathMatcher =
  | string
  | RegExp
  | ((path: string) => boolean)

export interface AccessibilityPreferenceWidgetConfig {
  autoMount?: boolean
  disabled?: boolean
  excludePaths?: WidgetPathMatcher[] | string
  includePaths?: WidgetPathMatcher[] | string
  observeDom?: boolean
  position?: WidgetPosition
  offsetX?: string
  offsetY?: string
  zIndex?: number
  language?: string | 'auto'
  nonce?: string
}

export interface DestroyOptions {
  preservePreferences?: boolean
}

export interface AccessibilityPreferenceWidgetApi {
  readonly version: string
  mount(options?: AccessibilityPreferenceWidgetConfig): HTMLElement | null
  destroy(options?: DestroyOptions): void
  refresh(): void
  open(): void
  close(): void
  reset(): void
  configure(
    options?: AccessibilityPreferenceWidgetConfig,
  ): AccessibilityPreferenceWidgetConfig
  disconnect(): void
  getConfig(): AccessibilityPreferenceWidgetConfig
  isMounted(): boolean
  getHost(): HTMLElement | null
}

declare global {
  interface Window {
    AccessibilityPreferenceWidget?: AccessibilityPreferenceWidgetApi
    AccessibilityPreferenceWidgetConfig?: AccessibilityPreferenceWidgetConfig
  }
}

export {}
