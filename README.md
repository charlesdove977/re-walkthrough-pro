<p align="center">
  <img src="docs/hero.png" alt="Walkthrough Pro — cinematic walkthroughs and ads from any photo source, inside Claude Code" width="900">
</p>

# Walkthrough Pro

> One Claude Code skill that turns any photo source into a cinematic video. Paste an **Airbnb** or **Booking.com** listing URL, or drop your own **product / business photos**, and get back a finished cinematic walkthrough or ad. Apify scrapes when there is a listing, Higgsfield animates every shot, ffmpeg stitches the final cut.

<p>
  <a href="https://www.npmjs.com/package/walkthrough-pro"><img src="https://img.shields.io/npm/v/walkthrough-pro?color=blue&label=npm" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/walkthrough-pro?color=green" alt="MIT license"></a>
  <a href="https://github.com/GiancarloLazazzera/re-walkthrough-pro/stargazers"><img src="https://img.shields.io/github/stars/GiancarloLazazzera/re-walkthrough-pro?style=flat" alt="stars"></a>
</p>

The skill ships as **`/re-walkthrough-pro`** in Claude Code. A single command that handles three subject types:

| Subject type | Input | Output |
|--------------|-------|--------|
| **STR listing** | Airbnb URL, Booking URL, or self-managed images | Room-by-room cinematic walkthrough |
| **Product ad** | Your product photos (angles + macro + lifestyle) | Cinematic showcase reel (9:16 default) |
| **Business ad** | Your restaurant / gym / salon / activity photos | Cinematic promo (16:9 default) |

A finished video that looks like a $1,000–3,000 production, made from photos in minutes, for sub-cents of scraping (only if there is a listing to scrape) plus a handful of Higgsfield credits.

> **Honest framing:** This produces a *cinematic walkthrough / ad* (per-shot camera-move clips stitched together), **not** a true 3D / Matterport reconstruction. It looks premium, and it's impossible without an AI video engine — but don't promise a walkable dollhouse.

---

## Why

Hosts, brands, and local businesses all pay for media. The bottleneck is production time. Walkthrough Pro removes it: one command, photos in → sellable video out. Drop it into a marketing service as a video line item, or batch tours + ads across a whole client list.

The architecture is the unlock. Higgsfield video models work clip-by-clip (~5s image-to-video), so a whole walkthrough or ad **must** be per-shot clips stitched on your side. This skill does exactly that, with a camera-move library tuned per subject type (rooms, products, business scenes) so the stitched result reads like a real production.

---

## Install

### Option 1 — `npx` (recommended)

```bash
npx walkthrough-pro install
```

Installs the skill to `~/.claude/skills/re-walkthrough-pro/`. Refresh after a package upgrade:

```bash
npx walkthrough-pro@latest update
```

### Option 2 — Global install

```bash
npm install -g walkthrough-pro
walkthrough-pro install
```

### Option 3 — Directly from GitHub

```bash
npx github:GiancarloLazazzera/re-walkthrough-pro install
```

### Project-scoped install (per repo)

```bash
cd ~/path/to/project
npx walkthrough-pro install --project
```

### Uninstall / where

```bash
npx walkthrough-pro uninstall
npx walkthrough-pro where            # ~/.claude/skills/re-walkthrough-pro
```

Restart Claude Code after installing, then run `/re-walkthrough-pro`.

---

## What you need

- **[Higgsfield MCP](https://higgsfield.ai)** — required for every subject type. Animates each shot (Seedance 2.0 / Kling 3.0 image-to-video) and reframes for social. Every image + video model in one credit pool.
- **[Apify MCP](https://github.com/apify/actors-mcp-server)** — required *only* if you want to scrape Airbnb or Booking listings. Not needed for manual-image runs (product / business / self-managed STR).
- **ffmpeg** — required for stitching (`brew install ffmpeg` / `winget install ffmpeg`).

---

## How it works

```
1. CHOOSE     subject type (str_listing / product_ad / business_ad) + source (airbnb / booking / manual)
2. INGEST     Airbnb / Booking → Apify actor pulls photos + specs
              Manual → copy your folder / URLs / attachments into source-images/
3. PERSIST    write BRIEF.md (listing / product / business variant), populate source-images/
4. CURATE     vision pass tuned per subject type; drop junk; order the shot list
5. ANIMATE    per shot → Higgsfield image-to-video with a subject-appropriate camera move
6. STITCH     ffmpeg concat in shot order → master at chosen ratio (+ optional alt ratio)
7. DELIVER    final video + per-shot scenes + BRIEF.md, in one folder
```

### Three ways in

- **STR listing URL** — paste an Airbnb (`https://www.airbnb.com/rooms/…`) or Booking (`https://www.booking.com/hotel/…`) link.
- **Discovery** — "find 5 apartments in Lisbon for 2 guests" or "find 3 boutique hotels in Rome". The skill searches, shows the results, you pick.
- **Manual images** — drop a folder, a list of paths, a list of URLs, or file attachments. Then answer one question: product, business, or self-managed STR.

### Shot → camera move (per subject type)

- **STR listing** — drone approach for the exterior, steadicam for halls, orbit for great rooms, window-approach reveals for views, rising reveal for the balcony / pool.
- **Product ad** — slow push-in on the hero, short orbit on angles, rack-focus + macro on details, subtle parallax on lifestyle shots.
- **Business ad** — approach on signage, steadicam interior, shoulder-follow on activity in progress, push-in on product/detail, gentle orbit on vibe.

All camera moves are model-agnostic — they apply to whatever Higgsfield video model you pick.

---

## Output

```
walkthroughs/<subject-slug>/
├── BRIEF.md             subject-typed brief (listing / product / business variant)
├── source-images/       every photo used
├── scenes/              per-shot cinematic clips (shot-01-*.mp4, shot-02-*.mp4 …)
└── final/               master + optional alt ratio
                         (walkthrough-16x9.mp4 for STR, ad-9x16.mp4 for product, ad-16x9.mp4 for business)
```

Walkthroughs / ads are written to your *project* (`walkthroughs/`), never into the skill folder.

---

## What gets installed

```
~/.claude/skills/re-walkthrough-pro/
├── SKILL.md
├── tasks/
│   └── build-walkthrough.md              ← interview + universal 7-step pipeline
├── frameworks/
│   ├── apify-airbnb-actors.md             ← Airbnb actor stack + how to call it
│   ├── apify-booking-actors.md            ← Booking.com actor stack + how to call it
│   ├── user-provided-images.md            ← Manual ingest (folder / URLs / attachments)
│   ├── higgsfield-camera-moves.md         ← Camera-move library (rooms + products + business)
│   └── stitch-pipeline.md                 ← ffmpeg normalize/concat + alt-ratio reframe
├── templates/
│   └── brief-md.md                        ← Three variants (listing / product / business)
└── checklists/
    └── walkthrough-quality.md             ← Universal + subject-specific QA
```

---

## FAQ

**Is this true 3D?**
No. It's per-shot cinematic camera-move clips stitched into a tour or ad. Premium-looking, honest to describe as a "cinematic walkthrough / ad," not a Matterport dollhouse.

**Do I need Apify for product / business ads?**
No. Apify is only used when scraping Airbnb or Booking. Manual-image runs skip the scrape entirely.

**Does it touch my repo when I install?**
No. Default install writes to `~/.claude/skills/re-walkthrough-pro/`. Only `--project` writes into the current directory.

**Do Airbnb and Booking block scraping?**
Yes — both block naive `fetch`/headless. That is why the skill routes photos through Apify actors, the reliable source for the listing paths.

**What does a run cost?**
Scrape is sub-cent to low-cent per listing (nothing for manual runs). The real cost is Higgsfield credits, scaled by shot count — which is why the skill auto-curates to ~6–10 hero shots by default.

**Can I mix inputs in one run?**
Not in v0.3. One subject per run. You *can* batch many runs back-to-back — the skill folders keep them cleanly separated.

---

## License

MIT — see [LICENSE](LICENSE).
