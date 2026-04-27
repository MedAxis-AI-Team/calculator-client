$ARGUMENTS

Read context/001/FINAL-funding-mix-calculator-build-spec.md.

If no argument: output a table of contents with section names and approximate line numbers so Jerome can navigate to the section he needs.

If an argument is provided, treat it as a keyword and find the most relevant section(s). Output only the content of those sections (not the full file). If multiple sections match, show them all.

Common keywords and what they map to:
- "math" / "formula" / "dilution" → CALCULATION ASSUMPTIONS section
- "runway" → Runway tab section + edge case precedence
- "posthog" / "events" / "analytics" → POSTHOG SETUP section
- "state" / "reducer" / "shape" → IMPLEMENTATION APPROACH → State shape
- "components" / "structure" → IMPLEMENTATION APPROACH → Component structure
- "qa" / "sanity" / "test" → QA SANITY CHECKS section
- "deploy" / "vercel" → deployment steps
- "edge" / "precedence" → edge case precedence ordering
- "safe" / "note" / "convertible" → SAFE/note secondary card section
- "share" / "url" / "encode" → Share URL section
- "copy" → Copy summary section
- "branding" / "colors" / "tokens" → STACK section + context/001/branding.md

After showing the section: ask if Jerome wants to see another section or the full spec.
