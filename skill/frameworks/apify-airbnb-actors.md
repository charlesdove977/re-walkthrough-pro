<apify_airbnb_actors>

## Purpose

The Apify actor stack for pulling Airbnb listings + photos, and how to call it via the Apify MCP. Airbnb hard-blocks naive `fetch`/headless scraping (bot detection, dynamic photo CDN, per-request tokens), so an actor route is required — Claude cannot "just grab" the images from a listing URL.

## The Stack

| Role | Actor (`username/name`) | Use it for |
|------|-------------------------|------------|
| **Primary — detail + photos** | `nomad-agent/airbnb-scraper` (mode: `detail`) | One listing → photos + title + nightly price + address + amenities + host + coordinates, in ONE call. Default for both input paths. |
| **Discovery — search** | `nomad-agent/airbnb-scraper` (mode: `search`) | "Find listings" from a location + filters. Returns listing URLs + a dataset that chains into `detail`. |
| **Fallback — images only** | `tri_angle/airbnb-rooms-urls-scraper` | If the detail run's photo set is thin; pulls the hi-res photo array from `listingUrls` alone. |

**Why this stack:** `nomad-agent/airbnb-scraper` runs both search and detail modes off a single input schema, so discovery and single-listing paths share one downstream call (detail mode), which is the one that returns the photos.

## How to Call (Apify MCP)

Use the Apify MCP tools (load via ToolSearch if deferred: `mcp__apify__fetch-actor-details`, `mcp__apify__call-actor`, `mcp__apify__get-dataset-items`).

1. **Inspect input** (only if unsure of fields): `fetch-actor-details` with `{ inputSchema: true }`.
2. **Run** the actor: `call-actor` with the actor `fullName` + input JSON. For a single listing, prefer `waitSecs > 0` so the run completes and returns results inline.
3. **Read output**: results land in the run's dataset — read them (the call result includes the dataset, or use `get-dataset-items` with the returned dataset id).

### Detail scraper input — by URL (most common)

```json
{
  "mode": "detail",
  "listingUrls": [
    { "url": "https://www.airbnb.com/rooms/12345678" }
  ],
  "currency": "USD",
  "locale": "en"
}
```

### Discovery — by location

```json
{
  "mode": "search",
  "location": "Montclair, NJ",
  "maxListings": 25,
  "checkIn": "2026-08-01",
  "checkOut": "2026-08-05",
  "adults": 2,
  "currency": "USD"
}
```

### Chaining discovery → detail

```json
// after running search mode and getting its dataset id:
{
  "mode": "detail",
  "searchResultsDatasetId": "<dataset-id-from-search-run>",
  "currency": "USD"
}
```

## What the Detail Scraper Returns (validated)

Per the actor README, each result includes: listing title, nightly price + currency + fees, full address + coordinates, property type (Entire home / Private room / etc.), bedroom / bathroom / bed counts, max guests, **image URLs (hi-res)**, amenities list, house rules, host info (name, superhost, profile URL, response rate), review count + rating, cancellation policy, availability calendar, and MLS-style attribution links.

The fields this skill needs: `title`, `nightlyPrice`, `address` + `coordinates`, `bedrooms` / `bathrooms` / `maxGuests`, `propertyType`, `host` (name + superhost flag), the **image URL list** (feeds `source-images/` and the per-room animation), and `amenities` (used to bias camera-move choices — e.g. "pool" → include the pool shot).

## No `propertyStatus` — Airbnb is single-mode

Unlike Zillow (for-sale / rental / sold), Airbnb listings are always short-term rentals — there is no `propertyStatus` field. Do not pass one; the actor will reject unknown keys.

## Cost

PAY_PER_EVENT, sub-cent to low-cent per listing on the free tier (detail mode ~$0.005/result, search mode ~$0.003/result; cheaper at higher Apify tiers). Scraping cost is negligible next to Higgsfield credits — the room count (curation) is the real cost lever, not the scrape.

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Trying to fetch Airbnb photos with curl/headless directly | Airbnb blocks it; CDN URLs are per-session-signed | Always route images through the actor |
| Running the images-only fallback AND the detail scraper for one listing | Detail scraper already returns photos — double spend | Use detail mode alone; images fallback only if photo array is empty |
| Passing `propertyStatus` (leftover from Zillow flows) | Actor rejects unknown fields | Drop the field — Airbnb has no listing-status axis |
| Re-scraping on every run | Wastes events; photos already in source-images/ | Reuse the saved source-images/ when regenerating clips |
| Assuming Airbnb labels rooms in the photo array | It doesn't — captions are free-text or missing | Room type must come from a vision pass in `curate_rooms`, not from the actor |

## Room Labels — Vision-Only

Airbnb photo arrays are **not tagged by room**. The caption field is host-authored and inconsistent ("Cozy space ✨", "Master", or blank). Do not trust it for camera-move selection. All room-type assignment must come from the vision pass in `curate_rooms`.

## Source

Apify Store, Travel & Real Estate categories. Actor IDs current as of 2026-07-05; re-verify with `search-actors "Airbnb"` if a run 404s or an actor is deprecated.

</apify_airbnb_actors>
