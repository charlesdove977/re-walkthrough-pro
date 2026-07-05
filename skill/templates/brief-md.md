# Brief Template

Template for `walkthroughs/{subject-slug}/BRIEF.md` — the per-run brief that travels with the walkthrough / ad assets.

**Purpose:** Capture everything about the subject (so the folder is self-describing for re-runs and for the sales pitch) plus the creative choices used for this build. The template has **three variants**: STR listing, product ad, business ad.

---

## Variant A — STR Listing (Airbnb / Booking / self-managed)

```markdown
# {listing-title}

**Subject type:** str_listing
**Source:** {airbnb | booking | manual}
**Listing URL:** {listing-url or "N/A"}
**Slug:** {subject-slug}
**Built:** {build-date}

## Listing
| Field | Value |
|-------|-------|
| Nightly price | {nightly-price} |
| Bedrooms | {bedrooms} |
| Bathrooms | {bathrooms} |
| Max guests | {max-guests} |
| Property type | {property-type} |
| Address | {address} |
| Coordinates | {lat}, {lng} |
| Rating | {rating} ({review-count} reviews) |
| Stars | {stars or "N/A"} |

## Host / Owner
- **Name:** [Host name or "self-managed"]
- **Superhost:** [Yes / No / N/A]

## Amenities Highlights
- [Top 5–8 selling amenities]

## Photos
- Source count: {source-photo-count} (in `source-images/`)
- Curated for animation: {curated-count}

## Shot List (walkthrough order)
| # | Room | Photo | Camera move |
|---|------|-------|-------------|
| 01 | exterior | 03-original.jpg | drone approach |
| 02 | entry | 01-original.jpg | doorway reveal |
| ... | ... | ... | ... |

## Build Choices
- **Style:** {cinematic | basic}
- **Rooms:** {auto-curate | all | user-ordered}
- **Output ratio:** {16:9 | 9:16 | both}
- **Engine:** {Seedance 2.0 | Kling 3.0}

## Outputs
- Master: `final/walkthrough-16x9.mp4`
- Social: [final/walkthrough-9x16.mp4 if produced]
- Scenes: {scene-count} clips in `scenes/`

## Run Notes
[Any rooms skipped/failed, regenerations, or cost notes]
```

---

## Variant B — Product Ad

```markdown
# {product-name}

**Subject type:** product_ad
**Source:** manual
**Slug:** {subject-slug}
**Built:** {build-date}

## Product
| Field | Value |
|-------|-------|
| Brand | {brand} |
| One-line pitch | {pitch} |
| Category | {category} |
| Target audience | {audience} |
| Hero color / material | {hero-color-or-material or "N/A"} |
| Destination CTA | {cta-url or "N/A"} |

## Photos
- Source count: {source-photo-count} (in `source-images/`)
- Curated for animation: {curated-count}
- Order source: {user-provided | auto-curated}

## Shot List (ad order)
| # | Angle / role | Photo | Camera move |
|---|--------------|-------|-------------|
| 01 | hero front | 01-original.jpg | slow push-in |
| 02 | 3/4 angle | 02-original.jpg | orbit |
| 03 | macro detail | 05-original.jpg | rack focus |
| 04 | lifestyle in-use | 04-original.jpg | subtle parallax |
| ... | ... | ... | ... |

## Build Choices
- **Style:** {cinematic | basic}
- **Shots:** {auto-curate | all | user-ordered}
- **Output ratio:** {9:16 | 16:9 | both}    ← default 9:16 for product ads
- **Engine:** {Seedance 2.0 | Kling 3.0}

## Outputs
- Master: `final/ad-9x16.mp4` (or chosen ratio)
- Alt cut: [final/ad-16x9.mp4 if produced]
- Scenes: {scene-count} clips in `scenes/`

## Run Notes
[Skipped shots, regenerations, cost notes]
```

---

## Variant C — Business / Place / Activity Ad

```markdown
# {business-name}

**Subject type:** business_ad
**Source:** manual
**Slug:** {subject-slug}
**Built:** {build-date}

## Business
| Field | Value |
|-------|-------|
| One-line pitch | {pitch} |
| Category | {category} |
| City / neighborhood | {city-neighborhood} |
| Vibe / target customer | {vibe} |
| Booking / phone | {contact or "N/A"} |
| Website | {website or "N/A"} |

## Photos
- Source count: {source-photo-count} (in `source-images/`)
- Curated for animation: {curated-count}
- Order source: {user-provided | auto-curated}

## Shot List (ad order)
| # | Scene | Photo | Camera move |
|---|-------|-------|-------------|
| 01 | exterior / signage | 01-original.jpg | drone approach |
| 02 | interior wide | 03-original.jpg | steadicam walkthrough |
| 03 | activity / craft in progress | 04-original.jpg | shoulder-follow |
| 04 | product / detail | 06-original.jpg | slow push-in |
| 05 | customer / vibe | 07-original.jpg | orbit |
| ... | ... | ... | ... |

## Build Choices
- **Style:** {cinematic | basic}
- **Shots:** {auto-curate | all | user-ordered}
- **Output ratio:** {16:9 | 9:16 | both}
- **Engine:** {Seedance 2.0 | Kling 3.0}

## Outputs
- Master: `final/ad-16x9.mp4` (or chosen ratio)
- Alt cut: [final/ad-9x16.mp4 if produced]
- Scenes: {scene-count} clips in `scenes/`

## Run Notes
[Skipped shots, regenerations, cost notes]
```

---

## Field Documentation

Fields that apply across variants:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `{subject-slug}` | variable | Yes | kebab-case folder name (see `user-provided-images.md` for pattern per subject type) |
| `{build-date}` | variable | Yes | YYYY-MM-DD |
| `{source-photo-count}` `{curated-count}` `{scene-count}` | variable | Yes | Counts from the run |
| `{style}` `{ratio}` `{engine}` | variable | Yes | Build choices |

Variant-specific fields (listing / product / business columns) come straight from the actor (STR listings) or the user answers (product / business).

## Section Specifications

### Subject Type Header
**Purpose:** Every brief starts with a `Subject type:` line so a re-run knows which variant it is without guessing. Values: `str_listing` / `product_ad` / `business_ad`.

### Shot List
**Purpose:** Audit trail mapping each scene clip back to its source photo + camera move.
**Quality check:** Row count equals `scenes/` clip count.

### Build Choices
**Purpose:** Reproducibility — re-run the same subject the same way.
**Quality check:** All four choices recorded (style, shots/rooms, ratio, engine).
