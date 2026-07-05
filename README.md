<p align="center">
  <img src="docs/hero.png" alt="RE Walkthrough Pro — cinematic Airbnb-to-video listing walkthroughs for Claude Code" width="900">
</p>

# Airbnb Walkthrough Pro

> Turn an Airbnb listing into a cinematic, room-by-room walkthrough video — right inside [Claude Code](https://claude.ai/code). Apify pulls the photos, Higgsfield animates each room, ffmpeg stitches the final cut. Built to sell to short-term-rental hosts and property managers.

<p>
  <a href="https://www.charlieautomates.com/charlie-os-vs/"><img src="https://img.shields.io/badge/Work_with_Charlie-Charlie_OS-7c3aed?style=for-the-badge&logo=anthropic&logoColor=white" alt="Work with Charlie"></a>
  <a href="https://www.npmjs.com/package/airbnb-walkthrough-pro"><img src="https://img.shields.io/npm/v/airbnb-walkthrough-pro?color=blue&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/airbnb-walkthrough-pro"><img src="https://img.shields.io/npm/dt/airbnb-walkthrough-pro?color=blue&label=downloads" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/airbnb-walkthrough-pro?color=green" alt="MIT license"></a>
  <a href="https://github.com/GiancarloLazazzera/re-walkthrough-pro/stargazers"><img src="https://img.shields.io/github/stars/GiancarloLazazzera/re-walkthrough-pro?style=flat" alt="stars"></a>
</p>

RE Walkthrough Pro ships the **`re-walkthrough-pro`** skill: a single command that takes an Airbnb listing (or finds you some), pulls every photo, animates each room into a short cinematic camera-move clip, and stitches them into one finished walkthrough video you can hand a host.

A finished tour that looks like a $1,000–3,000 production, made from listing photos in minutes, for sub-cents of scraping plus a handful of Higgsfield credits.

> **Honest framing:** This produces a *cinematic walkthrough* (per-room camera-move clips stitched together), **not** a true 3D / Matterport reconstruction. It looks premium, and it's impossible without an AI video engine — but don't promise a walkable dollhouse.

---

## Why

STR hosts and co-hosts pay for media. The bottleneck is production time. Airbnb Walkthrough Pro removes it: one command, listing in → sellable walkthrough out. Drop it into a short-term-rental marketing service as a video line item, or batch tours across a whole city and pitch the hosts.

The architecture is the unlock. Higgsfield video models work clip-by-clip (~5s image-to-video), so a whole-house walkthrough **must** be per-room clips stitched on your side. This skill does exactly that, with a camera move matched to each room type so the stitched result reads like walking through the home.

---

## Install

### Option 1 — `npx` (recommended)

```bash
npx airbnb-walkthrough-pro install
```

Installs the skill to `~/.claude/skills/re-walkthrough-pro/`. Refresh after a package upgrade:

```bash
npm view airbnb-walkthrough-pro version       # check latest
npx airbnb-walkthrough-pro@latest update      # refresh in place
```

### Option 2 — Global install

```bash
npm install -g airbnb-walkthrough-pro
airbnb-walkthrough-pro install
```

### Option 3 — Directly from GitHub

```bash
npx github:GiancarloLazazzera/re-walkthrough-pro install
```

### Project-scoped install (per repo)

```bash
cd ~/path/to/project
npx airbnb-walkthrough-pro install --project
```

### Uninstall / where

```bash
npx airbnb-walkthrough-pro uninstall
npx airbnb-walkthrough-pro where            # ~/.claude/skills/re-walkthrough-pro
```

Restart Claude Code after installing, then run `/re-walkthrough-pro`.

---

## What you need

Two MCP servers connected in Claude Code, plus ffmpeg:

- **[Higgsfield MCP](https://higgsfield.ai/s/higgsfield-mcp-v3-earning-series-charlieautomates-ptQTLe)** — required. Animates each room (Seedance 2.0 / Kling 3.0 image-to-video) and reframes for social. Every image + video model in one credit pool.
- **[Apify account](https://www.apify.com?fpr=charles)** — required for the listing scrape. The Airbnb scraper (`nomad-agent/airbnb-scraper`, mode `detail`) pulls photos + title + nightly price + address + amenities + host in one call. Grab the [Apify MCP server](https://github.com/apify/actors-mcp-server) (`@apify/actors-mcp-server`) and your token at [console.apify.com](https://console.apify.com/settings/integrations).
- **ffmpeg** — required for stitching (`brew install ffmpeg`).

---

## How it works

```
1. RESOLVE   Airbnb link → Apify airbnb-scraper (photos + title + nightly price + specs + host + amenities)
             "find 5 in Lisbon" → search mode → detail mode (chained dataset)
2. PERSIST   write PROPERTY.md, download all photos to source-images/
3. CURATE    vision pass: best photo per room, drop floorplans/dupes, tag room type
             (Airbnb doesn't label rooms — this pass is vision-only)
4. ANIMATE   per room → Higgsfield image-to-video with a room-matched camera move
5. STITCH    ffmpeg concat in walkthrough order → 16:9 master (+ optional 9:16)
6. DELIVER   final video + per-room scenes + PROPERTY.md, in one folder
```

### Two ways in

- **Single listing:** paste an Airbnb listing URL (`https://www.airbnb.com/rooms/…`).
- **Discovery:** "find 5 apartments in Lisbon for 2 guests" → it searches, shows you the listings, you pick.

### Room → camera move

Each room type gets a cinematic move (drone approach for the building/exterior, steadicam walkthrough for halls, orbit for great rooms, window-approach reveals for views, rising reveal for the balcony/terrace/pool). The moves are model-agnostic — they apply to whatever Higgsfield video model you pick.

---

## Output

```
listing-walkthroughs/<listing-slug>/
├── PROPERTY.md          title · Airbnb link · nightly price · bedrooms/bathrooms/max-guests · host · amenities · shot list
├── source-images/       every photo pulled from Airbnb
├── scenes/              per-room cinematic clips (room-01-exterior.mp4, room-02-living.mp4 …)
└── final/               walkthrough-16x9.mp4 (+ walkthrough-9x16.mp4 if requested)
```

---

## What gets installed

```
~/.claude/skills/re-walkthrough-pro/
├── SKILL.md
├── tasks/
│   └── build-walkthrough.md          ← interview + 7-step pipeline
├── frameworks/
│   ├── apify-airbnb-actors.md         ← the Airbnb actor stack + how to call it
│   ├── higgsfield-camera-moves.md     ← room→camera-move mapping (self-sufficient)
│   └── stitch-pipeline.md             ← ffmpeg normalize/concat + 9:16 reframe
├── templates/
│   └── property-md.md
└── checklists/
    └── walkthrough-quality.md
```

Walkthroughs are written to your *project* (`listing-walkthroughs/`), never into the skill folder.

---

## Optional: richer prompt craft

The built-in camera-move mapping is self-sufficient. If you also have the **`seedance-real-estate`** and **`seedance-cinematic`** skills installed (both ship inside [UGC Factory](https://www.npmjs.com/package/ugc-factory)), the skill invokes them for richer per-room motion prompts and a film-look color grade. Purely additive — nothing breaks without them.

---

## FAQ

**Is this true 3D?**
No. It's per-room cinematic camera-move clips stitched into a tour. Premium-looking, honest to describe as a "cinematic walkthrough," not a Matterport dollhouse.

**Does it touch my repo when I install?**
No. Default install writes to `~/.claude/skills/re-walkthrough-pro/`. Only `--project` writes into the current directory.

**Does Airbnb block scraping?**
Airbnb blocks naive `fetch`/headless (bot detection + per-request signed photo URLs), which is exactly why the skill routes images through the Apify actor — the reliable source for both the link and discovery paths.

**What does a run cost?**
The Apify scrape is sub-cent to low-cent per listing. The real cost is Higgsfield credits, scaled by room count — which is why the skill auto-curates to ~6–10 hero rooms by default.

---

## Related projects

- **[Charlie OS](https://www.charlieautomates.com/charlie-os/)** — one-click Claude Code setup bundling BASE, CARL, PAUL, SEED, Skillsmith, and dozens of curated skills.
- **[UGC Factory](https://www.npmjs.com/package/ugc-factory)** — AI UGC ad studio; bundles the 15 Seedance genre skills (including the two this skill optionally uses).
- **[Advertising Ops](https://github.com/charlesdove977/advertising-ops)** — CMO-in-a-box media buyer for Claude Code.
- **[Work with Charlie](https://www.charlieautomates.com/charlie-os-vs/)** — done-for-you installs, custom skill builds, 1:1 Claude Code engineering.

---

## License

MIT — see [LICENSE](LICENSE). Built by [Charles J Dove](https://www.charlieautomates.com).
