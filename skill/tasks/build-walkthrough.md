<purpose>
Take one of three inputs — an Airbnb URL, a Booking.com URL, or a user-provided set of images — and produce a finished cinematic video (walkthrough or ad). Scrapes when there is a listing URL, ingests locally when the user brings their own photos, animates curated shots with the Higgsfield MCP, stitches the clips with ffmpeg, and writes everything into a predictable per-subject folder.
</purpose>

<user-story>
As a creator selling cinematic media, I want one command that turns *any* photo source (STR listing link, or my own product/business photos) into a finished sellable video, so that I can produce walkthroughs and ads in minutes without switching tools per subject type.
</user-story>

<when-to-use>
- User pastes an Airbnb or Booking.com listing URL and wants a walkthrough
- User provides a folder / list / drop of images and wants a cinematic ad (product or business)
- User wants to discover listings on Airbnb or Booking then build from one
- Entry point routes here via /re-walkthrough-pro
</when-to-use>

<references>
@frameworks/apify-airbnb-actors.md (during ingest_source when source = airbnb)
@frameworks/apify-booking-actors.md (during ingest_source when source = booking)
@frameworks/user-provided-images.md (during ingest_source when source = manual)
@frameworks/higgsfield-camera-moves.md (during animate_shots — subject-type camera-move sections)
@frameworks/stitch-pipeline.md (during stitch_and_reframe — ffmpeg concat + reframe)
@templates/brief-md.md (during persist_subject — three variants of BRIEF.md)
@checklists/walkthrough-quality.md (during review_and_deliver — pre-delivery QA)
</references>

<steps>

<step name="choose_subject_and_source" priority="first">
Determine what we are building **and** where the photos come from. Ask the user (skip questions whose answer is already obvious from how the skill was invoked):

1. **What do you have?**
   - An **Airbnb** listing URL (`https://www.airbnb.com/rooms/…`) → source = `airbnb`, subject_type = `str_listing`
   - A **Booking.com** listing URL (`https://www.booking.com/hotel/…`) → source = `booking`, subject_type = `str_listing`
   - Your **own images** (folder path, list of files, list of URLs, or files dropped into chat) → source = `manual`, subject_type = ask next
   - "Find me listings" → discovery path (ask which portal + location + count)

**Wait for response.**

<if condition="source = manual">
Ask exactly once (see `frameworks/user-provided-images.md`):

> What are we making an ad for?
> 1. A **product** (a physical thing you're selling)
> 2. A **business / place / activity** (restaurant, gym, salon, tour, workshop, clinic…)
> 3. A **short-term rental** you're managing yourself (skip the scrape)

Set `subject_type` to `product_ad`, `business_ad`, or `str_listing` accordingly.

**Wait for response.**
</if>

<if condition="discovery path">
Load the matching actor framework (`apify-airbnb-actors.md` or `apify-booking-actors.md`). Run the search actor for the requested location + count. Present the found listings as a table (name · nightly price · bedrooms/bathrooms · max guests · photo count · rating). Ask the user to pick one (or more, processed one at a time). Set `source` from the chosen portal and `subject_type = str_listing`.

**Wait for selection.**
</if>

Confirm `source` and `subject_type` before moving on. These two variables drive every branch below.
</step>

<step name="collect_creative_choices">
Ask the creative questions (offer the recommended default for each — let the user accept all defaults with one "go"):

1. **Style** — Cinematic (camera-move per shot) [default] or Basic (simple slow pan / Ken-Burns).
2. **Shots** —
   - `str_listing`: Auto-curate ~6–10 hero rooms [default] or animate all photos.
   - `product_ad`: Preserve user-provided order [default when user gave <= 12 images] or auto-curate ~6–8 hero angles.
   - `business_ad`: Auto-curate ~6–10 hero scenes [default] or preserve user order.
3. **Output ratio** —
   - `str_listing`: 16:9 master [default], 9:16 social cut, or both.
   - `product_ad`: 9:16 master [default for social/DTC], 16:9, or both.
   - `business_ad`: 16:9 master [default], 9:16 social cut, or both.
4. **Engine** — Seedance 2.0 [default] or Kling 3.0.

**Wait for response (or a blanket "use defaults").**

State the rough cost before running: scrape cost (~$0.005 per listing, $0 for manual input) + N Higgsfield clips. Confirm to proceed.

**Wait for go.**
</step>

<step name="ingest_source">
Branch on `source`. Each branch fills `source-images/` with `NN-original.{ext}` files.

<if condition="source = airbnb">
Load @frameworks/apify-airbnb-actors.md. Call `nomad-agent/airbnb-scraper` in `mode: "detail"` with `listingUrls` (or `searchResultsDatasetId` for the discovery path). Retrieve the run's dataset items. Verify you got: title, address + coordinates, nightly price, bedrooms/bathrooms/max-guests, property type, host info, amenities, and a non-empty list of image URLs.
</if>

<if condition="source = booking">
Load @frameworks/apify-booking-actors.md. Call `voyager/booking-scraper` with `startUrls` (or chain from the search run). Pass `currency` and `language`. Retrieve dataset items. Verify you got: name, type, address + coordinates, nightly price, stars + reviewScore, key amenities, and a non-empty `images` array.
</if>

<if condition="source in [airbnb, booking]">
Download every image URL to `source-images/NN-original.jpg` (curl / wget), preserving the actor's returned order. If image URLs are missing or sparse, fall back to the framework's images-only actor.
</if>

<if condition="source = manual">
Load @frameworks/user-provided-images.md.

- Accept local folder paths, file lists, remote URLs, or Claude Code attachments — in any combination.
- Copy / download each into `source-images/NN-original.{ext}`, preserving the user's provided order.
- Enforce min 3, warn above ~30.
- For `str_listing` self-managed: ask the user for the specs the actor would have returned (bedrooms/bathrooms/max-guests/nightly-price). Mark unknown fields `N/A`.
- For `product_ad`: ask for brand + product name + one-line pitch + category + target audience (+ optional hero color / material, optional CTA URL).
- For `business_ad`: ask for business name + one-line pitch + category + city/neighborhood + vibe (+ optional booking URL / phone / website).
</if>

Derive `{subject-slug}` per the subject_type conventions in `user-provided-images.md` (STR: `title-city-id` from actor; product: `brand-name-date`; business: `name-city-date`).
</step>

<step name="persist_subject">
Load @templates/brief-md.md. Pick the variant matching `subject_type` (A = str_listing, B = product_ad, C = business_ad).

Create the folder tree under the output root `walkthroughs/{subject-slug}/`:
- `source-images/` — already populated by ingest_source.
- `scenes/` — created now, filled in animate_shots.
- `final/` — created now, filled in stitch_and_reframe.

Write `walkthroughs/{subject-slug}/BRIEF.md` from the matching template variant, filling every field with actor data (for STR listings) or user answers (for manual runs).
</step>

<step name="curate_shots">
The curation strategy depends on `subject_type` and whether the user asked for auto-curate or preserved order.

<if condition="subject_type = str_listing AND shots = auto-curate">
Vision pass over `source-images/`: pick the single best photo per distinct room, drop floorplans, maps, aerial-only, watermark-heavy, and near-duplicate shots. Target the hero set: exterior/building, entry/hallway, living, kitchen, primary bed, primary bath, one secondary bed, and a balcony/pool/outdoor shot when present (~6–10 total). Tag each kept photo with its room type. Order = exterior → entry → living → kitchen → beds → baths → outdoor/amenity.
</if>

<if condition="subject_type = product_ad AND shots = auto-curate">
Vision pass: pick the strongest hero front shot first, then complementary angles (3/4, side, back), then macro/detail shots (texture, logo, mechanism), then one or two lifestyle / in-use shots. Drop soft, blurry, or backlit-in-a-bad-way frames. Target ~6–8 total. Order = hero → angle variations → macro detail → lifestyle.
</if>

<if condition="subject_type = business_ad AND shots = auto-curate">
Vision pass: pick one exterior / signage shot, one interior wide, one or two "activity in progress" shots (craft, service, cooking, treatment), one product / detail shot, one customer / vibe shot, and an optional closer (dessert, sunset, "come back" hero). Drop empty rooms with no story and near-duplicates. Target ~6–10 total. Order = exterior → interior wide → activity → detail → vibe → closer.
</if>

<if condition="shots = all OR shots = user-ordered">
Use every non-junk photo in the user's provided order (manual) or the actor's returned order (STR), tagging each with its best-guess shot role for camera-move selection. Drop only obvious junk (floorplans, screenshots, receipts, blurry accidents).
</if>

Produce an ordered shot list: `[photo file, shot role, position]`. Save it — it feeds animate_shots and lands as the Shot List section of BRIEF.md.
</step>

<step name="animate_shots">
Load @frameworks/higgsfield-camera-moves.md. Pick the camera-move family that matches `subject_type`:

- `str_listing` → **Room → Camera Move Mapping** (RE Camera Movement Library).
- `product_ad` → **Product Ad Camera Moves** (hero push-in, orbit, macro rack-focus, subtle parallax on lifestyle).
- `business_ad` → **Business Ad Camera Moves** (drone approach on signage, steadicam interior, shoulder-follow on activity, push-in on product/detail, orbit on vibe).

For each shot in the list, generate one clip via the Higgsfield MCP:
1. Pick the shot's camera move from the matching family in `higgsfield-camera-moves.md`.
2. **Author the motion prompt.** Apply only the camera-move + lighting layers ON the photo — do NOT re-describe the subject (image-to-video carries the scene). If style = cinematic and the sibling skills `seedance-real-estate` / `seedance-cinematic` are installed, invoke them for richer wording; otherwise the framework mapping is self-sufficient. One move per clip, compressed to ~5s.
3. Call `generate_video` as image-to-video, passing the source photo + the authored motion prompt, at the master ratio chosen in `collect_creative_choices`.
4. Capture the returned job id.

After dispatching all shots, poll `job_status` for each until rendered. Download each finished clip to `scenes/shot-NN-{role}.mp4` (NN = ordered position, zero-padded; role = e.g. `exterior`, `hero-front`, `macro-detail`, `activity`).

If a clip fails or warps badly (product melting, sign text bending, furniture distortion), regenerate that single shot with a gentler move (shorter push-in) before continuing. Do not block the whole subject on one bad shot — note it and move on if a retry also fails.
</step>

<step name="stitch_and_reframe">
Load @frameworks/stitch-pipeline.md.

1. Concatenate `scenes/*.mp4` in ordered position via ffmpeg → `final/{output-name}-{master-ratio}.mp4`.
   - `str_listing` → `final/walkthrough-16x9.mp4` (or chosen master)
   - `product_ad` → `final/ad-9x16.mp4` (or chosen master)
   - `business_ad` → `final/ad-16x9.mp4` (or chosen master)
   Normalize fps/resolution per the framework before concat so clips join cleanly.
2. <if condition="ratio includes both">Produce the alt ratio via Higgsfield `reframe` on the master (preferred) or ffmpeg center-crop + scale (fallback).</if>
3. Master is silent by design (v1). Do not add audio.

Verify each final file exists, is non-zero, and plays start-to-finish with the expected duration (~sum of scene durations).
</step>

<step name="review_and_deliver">
Load @checklists/walkthrough-quality.md and validate the output against it (universal checks + the section matching `subject_type`).

Report to the user:
- Final video path(s) under `walkthroughs/{subject-slug}/final/`
- Scene count + any shots that were skipped/failed
- `BRIEF.md` path
- Rough Higgsfield credit + Apify cost spent

Ask: "Ready — want any shot regenerated, a different ratio, or this batched across more subjects?"

**Wait for approval or revision requests.**
</step>

</steps>

<output>
## Artifact
A finished cinematic video (walkthrough for STR listings, ad for products/businesses) plus a complete per-subject asset folder.

## Structure
```
walkthroughs/{subject-slug}/
├── BRIEF.md                    subject-typed brief (listing / product / business variant)
├── source-images/              every photo used (NN-original.{ext})
├── scenes/                     per-shot Higgsfield clips (shot-NN-{role}.mp4)
└── final/                      walkthrough-*.mp4 or ad-*.mp4 (master + optional alt ratio)
```

## Location
Output root: `walkthroughs/` at the working directory root.
</output>

<acceptance-criteria>
- [ ] Subject type + source resolved before any scraping / ingest
- [ ] For STR listings: actor returned structured data + a non-empty photo set
- [ ] For manual runs: user's images landed in source-images/ preserving intended order
- [ ] BRIEF.md written using the correct variant (str_listing / product_ad / business_ad)
- [ ] Shot list produced and matches the scenes/ file count
- [ ] final/ contains a playable master at the chosen ratio
- [ ] If both ratios requested, the alt cut exists and is correctly reframed
- [ ] Output passes checklists/walkthrough-quality.md for the matching subject type
- [ ] User confirmed the result matches intent
</acceptance-criteria>
