import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'weekly',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

// Reset 5d 10h out → ~22% of the week elapsed.
const NOW = Date.parse('2026-10-29T11:20:00Z')
const RESETS = '2026-11-03T21:59:59Z'

test('band shows used %, elapsed % and pace', async ($, on) => {
  on('ui.status', () => ({ value: undefined }))
  on('clock.now', () => ({ value: NOW }))
  on('session.usage', () => ({
    value: {
      startedAt: NOW,
      context: { window: 1_000_000 },
      rateLimits: [{ kind: 'seven_day', percentUsed: 25, resetsAt: RESETS }],
    },
  }))
  on('command.register', () => ({ value: { command: 'weekly' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    const t = await ui.find({ type: 'Text', text: /of week/ })
    expect(t?.text).toBe('Weekly 25% · 22% of week · on pace')
    await ui.unmount()
  }

  const out = await $.command.run({
    command: 'weekly',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })
  expect(out.text).toBe('Weekly band hidden')
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /of week/ })).toBe(undefined)
  await ui.unmount()
})
