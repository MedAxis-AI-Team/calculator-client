'use client'

import posthog from 'posthog-js'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

const enabled = process.env.NEXT_PUBLIC_POSTHOG_ENABLED === 'true'

if (typeof window !== 'undefined' && key && enabled) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: true,
  })
}

export default posthog
