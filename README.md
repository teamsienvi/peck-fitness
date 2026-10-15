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

Copy follows the guide's **approved claims** (700 lb capacity, 10°–50° incline, heavy-duty steel, independent dual-board, non-slip grip, fold-flat) and **compliance** rules (no medical treatment, injury-cure, or guaranteed-result claims).

## Run locally

Open `index.html` directly, or serve the folder:

```powershell
npx -y serve .
```

## Deploy

Any static host works. Point it at the repo root, no build command, output dir `.`

- **Netlify**: drag the folder into app.netlify.com/drop, or connect the repo.
- **Vercel**: `npx vercel` → framework "Other", no build command.
- **Cloudflare Pages / GitHub Pages**: publish from the root.

## Before going live

- [ ] Replace `CONTACT_EMAIL` in `js/main.js` (currently `hello@peckfitness.example`).
- [ ] Optionally set `SIGNUP_ENDPOINT` in `js/main.js` (Formspree, Netlify Forms, Supabase function…) so signups POST `{ email, source }` instead of opening a mailto.
- [ ] Swap the AI-generated product images in `assets/` for real product photography.
- [ ] Update `<link rel="canonical">` and `og:image` in `index.html` to absolute URLs on the final domain.
- [ ] The chat widget is a scripted keyword demo — wire it to a real assistant when ready.
