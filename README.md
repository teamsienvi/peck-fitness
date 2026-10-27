# PECK Fitness — Landing Site

Static marketing site for the PECK Fitness adjustable dual slant board, built from `peck-fitness-Mockup-1st_draft.html`.

No build step, no dependencies — plain HTML, CSS, and JS.

## Structure

```
index.html          Main landing page
assistant.html      Dedicated standalone AI Assistant console (/assistant)
404.html            Not-found page
api/chat.js         Vercel serverless function for AI Assistant
api/auth.js         Email verification & OTP validation endpoint
api/ses.js          Email delivery integration using SigV4
css/styles.css      Design system + all section styles + assistant & widget
js/main.js          Interactions, chat sync, OTP verification, drawer
assets/             Images + favicon
assets/logo/        Vector logos extracted from "PECK Fitness - Logo - RGB COLOURS.pdf"
assets/brand/       Brand guide + product spec sheet (reference only)
```

## Brand (from the PECK Working Brand Guide)

| Token | Value |
|---|---|
| Military Green | `#5C6134` |
| Matte Black | `#151515` |
| White | `#FFFFFF` |
| Olive Accent | `#8A8551` |
| Headlines | Oswald, ALL CAPS |
| Body | Montserrat |

Logo files: `peck-logo.svg` (light backgrounds), `peck-logo-reversed.svg` (dark backgrounds), `peck-mark.svg` / `peck-mark-olive-accent.svg` (icon only).

Copy follows the **PECK Fitness Product and Customer Support Guidance** (draft, 8 Oct 2026) claims table: aluminum construction, two-board set, 10°–50° incline, textured grip surface (not "non-slip"), fold-flat. The 700 lb capacity, dimensions, weight and durability/testing claims are **on hold until verified**. Compliance rules: no medical treatment, injury-cure, or guaranteed-result claims. The chat assistant in `js/main.js` is trained on the same document.

## Run locally

```powershell
# 1. Install dependencies
npm install

# 2. Run the local dev server (serves the site + /assistant + AI chat + email verification)
npm run dev

# Or simply serve static files:
npx -y serve .
```

## Deploy

- **Production Domain**: [peckfitness.ai](https://peckfitness.ai/)
- **Vercel** (Live preview): [peck-fitness.vercel.app](https://peck-fitness.vercel.app/)

## Pre-launch status

- [x] Official contact and support email set to `hello@peckfitness.ai`.
- [x] Canonical, Open Graph, and JSON-LD URLs updated to `https://peckfitness.ai/`.
- [x] Chat widget wired to AI assistant backend with client-side fallback.
- [x] Free preview limit (3 questions) with 6-digit email OTP verification.
- [x] Minimized floating chat widget + dedicated standalone `/assistant` page.
- [ ] Configure environment variables in Vercel Project Settings > Environment Variables.
- [ ] Add confirmed load limit (per board vs. per set), dimensions and weight to specs once lab testing concludes.
- [ ] Swap AI mockup images in `assets/` for final production photography.
