# PECK Fitness — Landing Site

Static marketing site for the PECK Fitness adjustable dual slant board, built from `peck-fitness-Mockup-1st_draft.html`.

No build step, no dependencies — plain HTML, CSS, and JS.

## Structure

```
index.html          Main landing page
404.html            Not-found page
css/styles.css      Design system + all section styles
js/main.js          Interactions (menu, reveals, app demo, chat demo, signup)
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

Copy follows the **PECK Fitness Product and Customer Support Guidance** (draft, 8 Oct 2026) claims table: aluminum construction, two-board set, 10°–50° incline, textured grip surface (not "non-slip"), fold-flat. The 700 lb capacity, dimensions, weight and durability/testing claims are **on hold until verified**. Compliance rules: no medical treatment, injury-cure, or guaranteed-result claims. The scripted chat assistant in `js/main.js` is trained on the same document.

## Run locally

Open `index.html` directly, or serve the folder:

```powershell
npx -y serve .
```

## Deploy

Any static host works. Point it at the repo root, no build command, output dir `.`

- **Vercel** (Live): [peck-fitness.vercel.app](https://peck-fitness.vercel.app/)
- **Netlify / Cloudflare Pages**: drag into dashboard or connect repository (no build step, output dir `.`).

## Before going live

- [ ] Replace `CONTACT_EMAIL` in `js/main.js` (currently `hello@peckfitness.example`) once Rick confirms the support address — it is used by the signup form and the chat assistant.
- [ ] Add confirmed load limit (per board vs. per set), dimensions and weight to the specs table and chat assistant.
- [ ] Add approved shipping, returns, warranty, replacement-part and app-access policies to the chat assistant.
- [ ] Optionally set `SIGNUP_ENDPOINT` in `js/main.js` (Formspree, Netlify Forms, Supabase function…) so signups POST `{ email, source }` instead of opening a mailto.
- [ ] Swap the AI-generated product images in `assets/` for real product photography.
- [ ] Update `<link rel="canonical">` and `og:image` in `index.html` to absolute URLs on the final domain.
- [ ] The chat widget is a scripted keyword demo — wire it to a real assistant when ready.
