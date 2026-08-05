# Price Family Farm — Next.js site

Built with **Next.js 15** (App Router) and **React 19**. Same content and
design as the static version, now as a proper React app with routing,
a shared `Nav`/`Footer`, and a client-side lightbox on the Gallery page.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The site needs an internet connection on
first run/build so `next/font` can fetch Fraunces, Public Sans, and Space
Mono from Google Fonts (they're then self-hosted from your own domain —
no runtime calls to Google after that).

## Build for production

```bash
npm run build
npm run start
```

## Project structure

```
app/
  layout.js          root layout, fonts, global <head>
  globals.css         all design tokens + styles (ported from the static site)
  page.js              Home
  our-story/page.js    Our Story (season timeline)
  what-we-grow/page.js What We Grow
  how-we-grow/page.js  How We Grow
  documentation/page.js Documentation (TN farm registration process)
  gallery/page.js      Gallery (uses the Lightbox provider)
components/
  Nav.jsx              client component, highlights the active route
  Footer.jsx
  Lightbox.jsx          click-to-enlarge gallery viewer (client component)
  GalleryImage.jsx      individual gallery photo, opens the Lightbox
public/images/          all site photos
```

## Deploying

This is a standard Next.js app, so it deploys as-is to **Vercel** (just
import the repo), or anywhere that runs Node — Netlify, Render, a VPS, etc.
No environment variables are required to run it, though setting
`NEXT_PUBLIC_SITE_URL` (e.g. `https://pricefamilyfarm.com`) will make the
sitemap and robots.txt point at your real domain instead of a placeholder.

Image optimization is on (`next/image`). `sharp`, the library that powers
it, installs automatically as an optional dependency of Next.js itself, so
this works both locally and on Vercel with no extra setup.

## SEO

- `app/sitemap.js` and `app/robots.js` auto-generate `/sitemap.xml` and
  `/robots.txt`.
- The home page includes `LocalBusiness` JSON-LD structured data.
- Every recipe on `/recipes` includes `Recipe` JSON-LD structured data
  (ingredients, instructions, yield, time), built in `lib/recipeSchema.js`.
  This makes recipes eligible for Google's recipe rich results. Ratings and
  a hero image are deliberately left out since we don't have real reviews
  or finished-dish photography, fabricating either violates Google's
  structured data guidelines and risks a manual penalty.
- Each major page has its own auto-generated **Open Graph preview image**
  (`opengraph-image.jsx` in each route folder), built from a shared branded
  template in `lib/ogImage.jsx`, no photography needed. This is what shows
  up as the preview card when a link is shared on social media, iMessage,
  Slack, etc.
- Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://pricefamilyfarm.com`) once you
  have a real domain. It's used by the sitemap, robots.txt, recipe schema
  URLs, and to correctly resolve the Open Graph image URLs, all default to
  a placeholder until it's set.
- Each page has its own `<title>` and meta description.

## Contact form setup

The `/contact` page uses [Web3Forms](https://web3forms.com) to send submissions
straight to an email inbox, no backend code, no server to run.

**Already configured** — the access key in `components/ContactForm.jsx` is
live, submissions go straight to the inbox that was used to generate it.
Nothing further needed; just deploy.

If you ever need to point it at a different inbox: go to
https://web3forms.com, enter the new email address, it emails you a fresh
**Access Key** immediately (free, no account required), then swap the
`WEB3FORMS_ACCESS_KEY` value in `components/ContactForm.jsx`.

## Notes

- No email address or phone number is published anywhere on the site.
  Visitors reach out through the `/contact` form instead, "Greeneville,
  East Tennessee" is the only public location info.
- The Documentation page describes the Tennessee farm-registration process
  in plain language; it does not embed the scanned tax/legal documents.
