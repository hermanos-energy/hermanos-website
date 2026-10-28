---
name: Use DevTools CSS for pixel-perfect values
description: User expects exact CSS values from the live site, not guesses. Always ask for DevTools CSS paste when matching live site styles.
type: feedback
---

Always ask the user to paste CSS from browser DevTools (Styles or Computed tab) for exact values — font-size, padding, border-radius, colors, etc. Do not guess or estimate visual values from screenshots alone.

**Why:** The live site is built in Framer and renders via JavaScript. WebFetch cannot access the rendered DOM or component styles. Visual estimation from screenshots leads to mismatches.

**How to apply:** Before writing styles for any component (header, button, section, etc.), ask the user to inspect that element in DevTools and paste the CSS. One paste per component is enough. Then apply the exact values directly.
