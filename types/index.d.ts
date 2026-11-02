export type WeeklyLine = { used: number; elapsed: number; pace: string } | null

declare module 'claude-code' {
  interface PluginState {
    weekly: { line: Shaped<WeeklyLine>; isHidden: boolean }
  }
}
