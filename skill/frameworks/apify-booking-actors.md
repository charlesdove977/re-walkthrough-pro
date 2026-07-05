<apify_booking_actors>

## Purpose

The Apify actor stack for pulling Booking.com listings + photos, and how to call it via the Apify MCP. Booking.com blocks naive `fetch`/headless scraping and rotates image CDNs per-session, so an actor route is required — Claude cannot "just grab" the photos from a hotel URL.

## The Stack

| Role | Actor (`username/name`) | Use it for |
|------|-------------------------|------------|
| **Primary — detail + photos** | `voyager/booking-scraper` (mode: `detail` or url list) | One hotel/apartment → photos + name + nightly price + address + amenities + review score + property type, in ONE call. Default for both input paths. |
| **Discovery — search** | `voyager/booking-scraper` (mode: `search` with location + dates) | "Find hotels in Rome for 2 nights" — returns URLs + a dataset that chains into detail. |
| **Fallback — images only** | `voyager/booking-images-scraper` | If the detail run's photo set is thin; pulls the full hi-res photo gallery from `propertyUrls` alone. |

**Why this stack:** `voyager/booking-scraper` runs both search and detail off one input schema, so discovery and single-listing paths share one downstream call (detail mode). Actor IDs are current as of 2026-07-05; re-verify with `search-actors "Booking"` if a run 404s.

## How to Call (Apify MCP)

Use the Apify MCP tools (load via ToolSearch if deferred: `mcp__apify__fetch-actor-details`, `mcp__apify__call-actor`, `mcp__apify__get-dataset-items`).

1. **Inspect input** (only if unsure of fields): `fetch-actor-details` with `{ inputSchema: true }`.
2. **Run** the actor: `call-actor` with the actor `fullName` + input JSON. For a single property, prefer `waitSecs > 0` so the run returns inline.
3. **Read output**: results land in the run's dataset — read them directly or via `get-dataset-items` with the returned dataset id.

### Detail scraper input — by URL (most common)

```json
{
  "startUrls": [
    { "url": "https://www.booking.com/hotel/it/example-hotel.html" }
  ],
  "currency": "USD",
  "language": "en-us",
  "maxPagesPerQuery": 1,
  "includeReviewerNames": false,
  "extractImages": true
}
```

### Discovery — by location

```json
{
  "search": "Rome, Italy",
  "checkIn": "2026-09-15",
  "checkOut": "2026-09-18",
  "adults": 2,
  "rooms": 1,
  "currency": "USD",
  "language": "en-us",
  "maxPages": 2,
  "sortBy": "popularity"
}
```

### Chaining discovery → detail

```json
// after running search and getting its dataset id, feed URLs into a second run:
{
  "startUrls": "<dataset-id-from-search-run>",
  "extractImages": true
}
```

## What the Detail Scraper Returns (validated)

Per the actor README, each result includes: property `name`, `type` (Hotel / Apartment / Guest house / Villa / etc.), full `address` + `coordinates`, nightly `price` + currency + fees + taxes, `stars` (official rating), `reviewScore` + `reviewCount`, `checkInTime` / `checkOutTime`, room types + bed counts, `maxOccupancy`, `amenities` (parsed list), **`images` (hi-res URL array)**, description, cancellation policy, host/manager info when public, nearby landmarks + distance-to-center.

The fields this skill needs: `name`, `price`, `address` + `coordinates`, `type`, `stars` + `reviewScore`, key amenities, and the **image URL list** (feeds `source-images/` and the per-room animation).

## Booking-Specific Notes

- **No `propertyStatus`** — Booking properties are always short-term rentals / accommodations. Do not pass a status field.
- **Rooms often shown per room-type, not per unit** — a Booking listing may show 4 photos of "Deluxe Double Room" and 4 of "Suite". Treat these as separate rooms in the walkthrough only if the user is selling the whole property; otherwise pick the top-tier room type and use its photos as the primary walkthrough.
- **Watermarks** — some hotels upload photos with visible watermarks. Drop watermark-heavy shots in `curate_shots`.
- **Currency + language matter** — always pass `currency` and `language` to get the price + amenity text you expect. Defaults: `USD` + `en-us` unless user requests otherwise.

## Cost

PAY_PER_EVENT, low-cent per property (detail ~$0.007/result including image extraction, search ~$0.003/result; cheaper at higher Apify tiers). Scraping cost is negligible next to Higgsfield credits — the room count (curation) is the real cost lever.

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Trying to fetch Booking photos with curl/headless directly | Booking blocks it + rotates image CDN URLs | Always route images through the actor |
| Running the images-only fallback AND the detail scraper for one property | Detail scraper with `extractImages: true` already returns photos — double spend | Use detail alone; images fallback only if photo array is empty |
| Passing `propertyStatus` (leftover from Zillow flows) | Actor rejects unknown fields | Drop the field — Booking has no listing-status axis |
| Omitting `currency` / `language` | Prices in wrong currency, amenities in wrong language, hard to trust the brief | Always pass both |
| Animating every room-type variant | Doubles Higgsfield spend on near-duplicate spaces | Pick the hero room type; ignore the rest |
| Re-scraping on every run | Wastes events; photos already in source-images/ | Reuse the saved source-images/ when regenerating clips |

## Room Labels — Actor Sometimes Provides Them

Booking often groups photos by room type (e.g. `Deluxe Double Room / bathroom / view`). When the actor returns per-photo `category` or `roomType`, use it as a **hint** for `curate_shots` — but still verify with a vision pass. Never trust captions blindly (hosts mislabel).

## Source

Apify Store, Travel category. Actor IDs current as of 2026-07-05; re-verify with `search-actors "Booking"` if a run 404s or an actor is deprecated.

</apify_booking_actors>
