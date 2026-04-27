'use client'

import type { ReactNode } from 'react'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import posthog from '../../lib/posthog'

export default function PostHogProvider({ children }: { children: ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>
}
