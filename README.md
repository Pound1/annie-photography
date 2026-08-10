# Annierose Pound Photography

Showcase site: hero/about, a grouped gallery ("Albums": Landscapes,
Portraits, Nature) with a prev/next lightbox, a contact form that emails
Annie, and a password-gated `/admin` page for uploading and removing
photos. React + TypeScript (Vite), deployed on Netlify, photos stored in
Cloudinary. Visual design (palette, fonts, layout, copy) is based on
Annie's Claude-design export.

## Local dev

```sh
npm install
npm run dev
```

## Where things live

- `src/pages/Home.tsx` + `src/components/Hero.tsx` + `src/components/About.tsx`
  — hero image + title/tagline, and a separate about-me section (decorative
  circle behind a rounded photo). Currently placeholder gradients — see the
  `Swap for:` comments for where real photos go.
- `src/pages/Gallery.tsx` + `src/components/Lightbox.tsx` — grouped photo
  albums; clicking a thumbnail opens a lightbox with prev/next and an
  "x / y" counter.
- `src/data/galleries.ts` — placeholder gallery/photo data. Shaped so it can
  later be swapped for a real Cloudinary folder fetch without touching the
  page components.
- `src/pages/Contact.tsx` — subject + pre-filled message template, posts to
  Netlify Forms (see the hidden static form in `index.html`, required for
  Netlify's build-time form detection).
- `src/pages/Admin.tsx` + `netlify/functions/` — single shared-password
  gate, then upload/list/delete against Cloudinary via signed serverless
  functions (the API secret never reaches the browser).

---

## Setup walkthrough: Netlify + Cloudinary (image storage)

Do these once, in order, before the contact form or photo uploads will
actually work.

### 1. Create a Cloudinary account (photo storage)

1. Go to cloudinary.com and sign up for the free tier (25 GB storage/bandwidth
   is plenty for a portfolio site).
2. On the Cloudinary **Console** (dashboard home), copy three values:
   - **Cloud name**
   - **API Key**
   - **API Secret** (click "reveal" — keep this one private)

You don't need to create anything else in Cloudinary yet — the `/admin`
page will create folders (`landscapes`, `portraits`, `nature`) the first
time a photo is uploaded to each.

### 2. Get the site onto Netlify

Two options — pick whichever is easier:

**Option A — connect a Git repo (recommended, gives auto-deploys on push)**
1. Push this project to a GitHub repo (ask me to do this if you want —
   I'll need your go-ahead since it publishes code).
2. In Netlify: **Add new site → Import an existing project**, pick the
   repo. Build command `npm run build`, publish directory `dist` (already
   set in `netlify.toml`, Netlify should detect it automatically).

**Option B — deploy straight from your machine (no GitHub needed)**
```sh
npm install -g netlify-cli
netlify login
netlify init          # links this folder to a new Netlify site
netlify deploy --prod
```
You'd re-run `netlify deploy --prod` manually after future changes instead
of getting auto-deploys.

### 3. Set environment variables in Netlify

In the Netlify dashboard: **Site settings → Environment variables → Add a
variable**, add all four (see `.env.example`):

| Key | Value |
|---|---|
| `ADMIN_PASSWORD` | any password you choose — this gates `/admin` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary console |
| `CLOUDINARY_API_KEY` | from Cloudinary console |
| `CLOUDINARY_API_SECRET` | from Cloudinary console |

After adding them, trigger a redeploy (**Deploys → Trigger deploy**) so the
functions pick them up.

### 4. Point the contact form at Annie's Gmail

Netlify Forms captures submissions automatically once deployed, but you
still have to tell it where to email them:

1. **Site settings → Forms → Form notifications → Add notification →
   Email notification**.
2. Set the address to `apound45@gmail.com`.
3. Save. Every contact-form submission now lands in that inbox.

(The static replica form Netlify needs to detect the real one is already in
`index.html` — nothing else to configure.)

### 5. Try it end to end

1. Visit `https://<your-site>.netlify.app/contact`, submit a test message,
   confirm it arrives by email.
2. Visit `https://<your-site>.netlify.app/admin`, log in with
   `ADMIN_PASSWORD`, pick an album, upload a photo, confirm it appears —
   then check it also shows on `/gallery`.
3. Delete that test photo from `/admin` to confirm removal works too.

### 6. Optional: custom domain

**Site settings → Domain management → Add a domain**. Netlify's free tier
includes HTTPS for any domain you point at it; buy the domain itself
separately (Porkbun/Namecheap, ~$12–20/yr).

---

## Day-to-day: how Annie manages photos

No login system beyond the single shared password:

1. Go to `yoursite.com/admin`.
2. Enter the password (set via `ADMIN_PASSWORD`).
3. Pick the album (Landscapes / Portraits / Nature) from the dropdown.
4. Choose a file and click **Upload photo** — it appears in the grid below
   and on the public `/gallery` page within a few seconds.
5. Click **Remove** under any photo to delete it from Cloudinary and the
   site.

## Still placeholder, to replace when ready

- Hero background photo and About section photo (`src/components/Hero.tsx`,
  `src/components/About.tsx` — see the `Swap for:` comments).
- The 18 placeholder gallery photos — just delete them via `/admin` and
  upload real ones once Cloudinary is wired up.
