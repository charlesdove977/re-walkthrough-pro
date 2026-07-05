# Listing Template

Template for `listing-walkthroughs/{listing-slug}/PROPERTY.md` — the per-listing brief that travels with the walkthrough assets.

**Purpose:** Capture everything about the listing (so the folder is self-describing for re-runs and for the host pitch) plus the creative choices used for this build.

---

## File Template

```markdown
# {listing-title}

**Airbnb:** {airbnb-url}
**Slug:** {listing-slug}
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

## Host
- **Name:** [Host name]
- **Superhost:** [Yes / No]
- **Profile:** [Host profile URL if returned]

## Amenities Highlights
- [Top 5–8 selling amenities: pool, hot tub, workspace, EV charger, etc.]

## Photos
- Source count: {source-photo-count} (in `source-images/`)
- Curated for animation: {curated-count}

## Shot List (walkthrough order)
| # | Room | Photo | Camera move |
|---|------|-------|-------------|
| 01 | [exterior] | [NN-original.jpg] | [push-in] |
| 02 | [entry] | [NN-original.jpg] | [forward dolly] |
| ... | ... | ... | ... |

## Build Choices
- **Style:** {style}            (cinematic / basic)
- **Rooms:** {room-mode}        (auto-curate / all)
- **Output ratio:** {ratio}     (16:9 / 9:16 / both)
- **Engine:** {engine}          (Seedance 2.0 / Kling 3.0)

## Outputs
- Master: `final/walkthrough-16x9.mp4`
- Social: [final/walkthrough-9x16.mp4 if produced]
- Scenes: {scene-count} clips in `scenes/`

## Run Notes
[Any rooms skipped/failed, regenerations, or cost notes]
```

---

## Field Documentation

| Field | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| `{listing-title}` | variable | Yes | Airbnb listing title | `Sunny Loft in Alfama with River View` |
| `{airbnb-url}` | variable | Yes | Source listing link | `https://www.airbnb.com/rooms/12345678` |
| `{listing-slug}` | variable | Yes | kebab-case folder name (title + city + room id) | `sunny-loft-alfama-lisbon-12345678` |
| `{build-date}` | variable | Yes | Date built (YYYY-MM-DD) | `2026-07-05` |
| `{nightly-price}` `{bedrooms}` `{bathrooms}` `{max-guests}` `{property-type}` | variable | Yes | Core specs from the actor | `$185/night` / `2` / `1` / `4` / `Entire loft` |
| `{address}` `{lat}` `{lng}` | variable | Yes | Location from the actor | `Alfama, Lisbon, Portugal` / `38.7139` / `-9.1275` |
| `{rating}` `{review-count}` | variable | No | Social proof from the actor | `4.92` / `237` |
| `{source-photo-count}` `{curated-count}` `{scene-count}` | variable | Yes | Counts from the run | `34` / `8` / `8` |
| `{style}` `{room-mode}` `{ratio}` `{engine}` | variable | Yes | The build choices | `cinematic` / `auto-curate` / `16:9` / `Seedance 2.0` |
| `[Host name]` / `[Superhost]` / `[Profile]` | prose | No | Host details if the actor returned them | `Ana, Superhost` |
| `[Amenities Highlights]` | prose | Yes | Top selling amenities pulled from the actor's list | `Pool · Hot tub · Fast Wi-Fi · EV charger` |
| `[Shot list rows]` | prose | Yes | One row per animated room | `01 / exterior / 03-original.jpg / push-in` |
| `[Run Notes]` | prose | No | Skips, retries, cost | `Bath 2 skipped — only mirror-selfie photo` |

## Section Specifications

### Listing
**Purpose:** The spec table the host cares about.
**Contains:** Nightly price, bedrooms, bathrooms, max guests, property type, address, coordinates, rating — pulled straight from the actor.
**Quality check:** Every cell filled from actor data, not guessed.

### Host
**Purpose:** Who to pitch. Superhost flag matters for the sales angle.
**Quality check:** Name + superhost flag recorded when the actor returned them.

### Amenities Highlights
**Purpose:** Guides which non-room photos to keep (pool, hot tub, workspace, EV charger) and which to sell in the pitch.
**Quality check:** Top amenities from the actor list represented if photos exist for them.

### Shot List
**Purpose:** Audit trail mapping each scene clip back to its source photo + camera move.
**Contains:** One row per animated room in walkthrough order.
**Quality check:** Row count equals `scenes/` clip count.

### Build Choices
**Purpose:** Reproducibility — re-run the same listing the same way.
**Quality check:** All four choices recorded (style, rooms, ratio, engine).
