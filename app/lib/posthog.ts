'use client'

import posthog from 'posthog-js'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

if (typeof window !== 'undefined' && key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: true,
  })
}

export default posthog
