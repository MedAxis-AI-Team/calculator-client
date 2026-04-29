'use client'

import { usePostHog } from 'posthog-js/react'
import './FooterCTA.css'

export default function FooterCTA() {
  const posthog = usePostHog()

  return (
    <footer className="footer-cta">
      <p className="footer-cta__line">Built for life sciences founders who combine grants, tax credits, and equity.</p>
      <a
        className="footer-cta__link"
        href="https://medaxisai.org/investor-intelligence"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => posthog?.capture('cta_click', { destination: 'ii_landing' })}
      >
        Get the MedAxis Investor Intelligence Brief →
      </a>
      <p className="footer-cta__legal">
        This calculator is for strategic planning only — not legal or financial advice.
        Supports US, Canadian, UK, and European non-equity funding contexts.
      </p>
    </footer>
  )
}
