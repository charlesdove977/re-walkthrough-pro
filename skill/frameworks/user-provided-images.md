<user_provided_images>

## Purpose

How to ingest a user-supplied image set (no scraping) and route it through the same cinematic pipeline that Airbnb / Booking listings use. This unlocks the two non-listing subject types:

- **Product ad** — a physical product photographed from multiple angles → cinematic showcase reel
- **Business ad** — a physical space / service / activity photographed across multiple scenes → cinematic promo reel

The rest of the pipeline (Higgsfield animate → ffmpeg stitch) is unchanged; only the ingest + brief-authoring layer differ.

## Accepted Input Formats

The user may provide images in any of these forms — always accept all three, in the same run if needed:

| Form | How to ingest |
|------|---------------|
| **Local folder path** | Read the folder, copy every image file into `source-images/`. |
| **List of local file paths** | Copy each file into `source-images/`, preserving order. |
| **List of remote URLs** | Download each with `curl` / `wget` into `source-images/`. |
| **Claude Code attachments** (files dropped into chat) | Save them to `source-images/` from the attachment path Claude Code exposes. |

Do NOT ask the user to convert or re-upload — accept whatever they gave you.

## Ingest Rules

1. **Preserve order** — the user's provided order is the *intended* walkthrough order unless they explicitly ask for auto-curation. Name files `NN-original.{ext}` in the provided order (01, 02, …).
2. **Preserve extension** — keep `.jpg`, `.png`, `.webp`, `.heic`. If Higgsfield rejects `.heic` or `.webp` later, convert on the fly with ffmpeg to `.jpg`; do not convert eagerly.
3. **Enforce minimum count** — if the user provided fewer than 3 usable images, stop and ask for more. A single-clip "walkthrough" is not the product.
4. **Enforce maximum reasonable count** — if they dumped 100+ images (e.g. an entire product shoot), warn about Higgsfield credit spend and default to auto-curate ~8 hero shots unless they explicitly want all.
5. **Reject non-images** — silently skip PDFs, videos, RAW files. Log a single line telling the user what was skipped and why.

## Subject Type — Ask If Not Obvious

For manual-image runs, the actor doesn't tell us what we're building. Ask the user once:

> What are we making an ad for?
> 1. A **product** (a thing to sell — device, apparel, food, kit)
> 2. A **business / place / activity** (restaurant, gym, salon, tour, workshop)
> 3. A **short-term rental** you're managing yourself (skip the scrape)

The answer decides:
- Which camera-move family to pick from `higgsfield-camera-moves.md`
- Which variant of `brief-md.md` to write
- The default output ratio (product ads default 9:16 for social; STR + business default 16:9 with optional 9:16)

## Product Ad — Ingest Specifics

The user typically supplies **one product** shot from N angles + N lifestyle / detail shots. Metadata to collect (ask if not given):

- Product name + one-line pitch (used in `BRIEF.md`, not baked into the video)
- Brand
- Target audience (used to bias camera-move choices — luxury slow orbit vs punchy fast product-reveal)
- Optional: hero color / material (used for lighting-cue selection)
- Optional: destination CTA (URL / handle) — recorded in `BRIEF.md`, not in the master

## Business Ad — Ingest Specifics

The user typically supplies **scenes** from the business (exterior sign, interior, key equipment/activity, staff at work, product in use, ambience). Metadata to collect:

- Business name + one-line pitch
- Category (restaurant / gym / salon / tour operator / workshop / clinic / etc.)
- City / neighborhood (for local-SEO framing in the brief)
- Vibe / target customer (luxe / family / edgy — biases camera-move + lighting)
- Optional: booking URL / phone — recorded in `BRIEF.md`

## STR Self-Managed — Ingest Specifics

If the user is managing their own listing and doesn't want a scrape, treat it like Airbnb/Booking without the actor call:

- Ask for the listing URL only if they want it recorded in `BRIEF.md` — do not scrape it.
- Ask them for the same specs the actor would return (bedrooms/bathrooms/max-guests/nightly-price). Fields not provided → mark `N/A` in the brief.
- Everything downstream is identical to the actor path.

## Slug Derivation (Manual Input)

There's no address / listing id, so derive `{subject-slug}` from the user's answers:

| Subject type | Slug pattern | Example |
|--------------|--------------|---------|
| Product ad | `{brand}-{product-name}-{date}` | `northface-summit-jacket-2026-07-05` |
| Business ad | `{business-name}-{city}-{date}` | `cafe-mokito-milan-2026-07-05` |
| Self-managed STR | `{listing-name}-{city}-{date}` | `sunny-loft-alfama-2026-07-05` |

All kebab-cased. The date suffix keeps re-runs distinguishable.

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Auto-curating the user's provided order | Overrides intent; user picked that order for a reason | Default to preserving their order; only auto-curate if they ask |
| Silently converting HEIC → JPG upfront | Wastes time if Higgsfield accepts HEIC natively; loses metadata | Convert only if the engine rejects |
| Skipping the subject-type question | Camera moves + brief variant end up wrong | Always ask once, exactly once |
| Treating a product like a room walkthrough | Product ads want orbit + hero + macro detail, not "walk through the doorway" | Route product runs to the product camera-move section |
| Baking the brand / product name into the video prompt | Higgsfield renders warped text; brand words drift | Keep copy for `BRIEF.md` only; add text overlays in the editor downstream |

## Source

Local file ingest via Node `fs` + Bash `curl` / `wget`. Attachment paths come from Claude Code's file-drop convention. No external service required for this framework.

</user_provided_images>
