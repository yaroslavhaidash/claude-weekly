import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
// Within this many points of elapsed time counts as on pace.
const TOLERANCE = 5

const line = atom({ plugin: 'weekly', key: 'line' } as const, null, { shape: 'line-2' })
const isHidden = atom({ plugin: 'weekly', key: 'isHidden' } as const, false)

// Mini timeline: blue = used, light tick = time elapsed.
const bar = (used: number, elapsed: number): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="10" viewBox="0 0 80 10">
<rect x="0" y="3" width="80" height="4" rx="2" fill="#3a3a3a"/>
<rect x="0" y="3" width="${Math.min(100, used) * 0.8}" height="4" rx="2" fill="#4a7fd4"/>
<rect x="${Math.min(79, elapsed * 0.8)}" y="0" width="1.5" height="10" fill="#d0d0d0"/>
</svg>`

const measure = async ($: EngineInterface, limits: SessionRateLimit[]): Promise<void> => {
  const w = limits.find(l => l.kind === 'seven_day')
  if (!w?.resetsAt) return

  const left = Math.max(0, Date.parse(w.resetsAt) - (await $.clock.now()))
  const elapsed = Math.round(Math.min(100, 100 - (left / WEEK_MS) * 100))
  const used = Math.round(w.percentUsed)
  const pace =
    used > elapsed + TOLERANCE ? 'ahead' : used < elapsed - TOLERANCE ? 'behind' : 'on pace'
  await update($, line, () => ({ used, elapsed, pace }))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    $.ui.status(undefined)
    await $.command.register({ name: 'weekly', description: 'Show or hide the weekly limit band' })
    await measure($, (await $.session.usage()).rateLimits)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await measure($, e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const v = await read($, line)
    if (!v || e.props.hasSurvey || (await read($, isHidden))) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const label = (
      <Text dimColor>
        Weekly <Text bold>{v.used}%</Text> · {v.elapsed}% of week · {v.pace}
      </Text>
    )
    if (e.surface !== 'desktop') return label

    const { Svg } = $.ui.resolve(e)
    const alt = `Weekly ${v.used}%, ${v.elapsed}% of week, ${v.pace}`
    return (
      <Box flexDirection="row" gap={1} alignItems="center">
        <Svg source={bar(v.used, v.elapsed)} alt={alt} width={80} height={10} />
        {label}
      </Box>
    )
  })
  // /weekly shows or hides the band.
  on('command.run', { command: 'weekly' }, async $ => {
    const hidden = await update($, isHidden, h => !h)
    return { text: hidden ? 'Weekly band hidden' : 'Weekly band shown' }
  })
}
