import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'vibe-report-chat-analyzer-gmlij3as',
  authRequired: false,
  auth: {
    mode: 'headless' // Custom UI control
  }
})
