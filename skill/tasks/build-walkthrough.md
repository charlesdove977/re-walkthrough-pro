<purpose>
Take an Airbnb listing (a pasted link, or one discovered via search) and produce a finished cinematic room-by-room walkthrough video. Scrapes the listing + photos via Apify, animates curated rooms with the Higgsfield MCP, stitches the clips with ffmpeg, and writes everything into a predictable per-listing folder.
</purpose>

<user-story>
As a creator selling media to short-term-rental hosts and property managers, I want one command that turns a listing into a cinematic walkthrough, so that I can produce a sellable tour in minutes instead of manually scraping, prompting, and editing.
</user-story>

<when-to-use>
- User pastes an Airbnb listing URL and wants a walkthrough
- User wants to discover listings ("find 5 in Lisbon") then build from one
- Entry point routes here via /re-walkthrough-pro
</when-to-use>

<references>
@frameworks/apify-airbnb-actors.md (during resolve_listing — actor IDs, inputs, chaining)
@frameworks/higgsfield-camera-moves.md (during animate_rooms — room→camera-move mapping + prompts)
@frameworks/stitch-pipeline.md (during stitch_and_reframe — ffmpeg concat + reframe)
@templates/property-md.md (during persist_listing — PROPERTY.md shape)
@checklists/walkthrough-quality.md (during review_and_deliver — pre-delivery QA)
</references>

<steps>

<step name="choose_input_mode" priority="first">
Determine what we're building from. Ask the user (if not already clear from how they invoked the skill):

1. **Do you have a specific listing, or want me to find some?**
   - An Airbnb listing URL (`https://www.airbnb.com/rooms/…`) → single-listing path
   - "Find me listings" → discovery path (ask: location + how many + optional check-in/out + guests, e.g. "5 apartments in Lisbon for 2 guests")

**Wait for response.**

<if condition="discovery path">
Load @frameworks/apify-airbnb-actors.md. Run the search actor for the requested location + count. Present the found listings as a table (title · nightly price · bedrooms/bathrooms · max guests · photo count · rating). Ask the user to pick one (or more, processed one at a time).

**Wait for selection.**
</if>

Confirm the final listing/listings. Airbnb has no listing-status axis (no FOR_SALE / RECENTLY_SOLD) — do not ask for one.
</step>

<step name="collect_creative_choices">
Ask the creative questions (offer the recommended default for each — let the user accept all defaults with one "go"):

1. **Style** — Cinematic (camera-move per room) [default] or Basic (simple slow pan / Ken-Burns).
2. **Rooms** — Auto-curate ~6–10 hero shots [default] or animate all photos.
3. **Output ratio** — 16:9 master for agent delivery [default], 9:16 social cut, or both.
4. **Engine** — Seedance 2.0 [default] or Kling 3.0.

**Wait for response (or a blanket "use defaults").**

State the rough cost before running: detail scrape (~$0.004) + N Higgsfield clips. Confirm to proceed.

**Wait for go.**
</step>

<step name="resolve_listing">
Load @frameworks/apify-airbnb-actors.md.

Resolve the listing to structured data + photo URLs via the Apify MCP:
- URL path → call `nomad-agent/airbnb-scraper` in `mode: "detail"` with `listingUrls`.
- Discovery path → chain the search-mode run's dataset into a detail-mode run via `searchResultsDatasetId`.

Use the Apify MCP `call-actor` tool (fetch the actor's input schema first if unsure). Retrieve the run's dataset items.

Verify you got: title, full address + coordinates, nightly price, bedrooms/bathrooms/max-guests, property type, host info, amenities, and a non-empty list of image URLs. If image URLs are missing or sparse, fall back to `tri_angle/airbnb-rooms-urls-scraper` with `listingUrls` for the photos.

Derive a `{listing-slug}` from the title + city (kebab-case, e.g. `sunny-loft-alfama-lisbon-12345678`, keeping the trailing Airbnb room id for uniqueness).
</step>

<step name="persist_listing">
Load @templates/property-md.md.

Create the listing folder tree under the output root `listing-walkthroughs/{listing-slug}/`:
- `source-images/` — download every photo URL here (use Bash `curl`/`wget`; name `NN-original.jpg` in returned order).
- `scenes/` — created now, filled in animate_rooms.
- `final/` — created now, filled in stitch_and_reframe.

Write `listing-walkthroughs/{listing-slug}/PROPERTY.md` from the template: title, Airbnb link, nightly price, bedrooms/bathrooms/max-guests, property type, host, amenities highlights, full photo list, and the run's creative choices.
</step>

<step name="curate_rooms">
Airbnb does **not** label rooms in its photo array — the caption field is host-authored and inconsistent. All room-type assignment here is vision-based; do not trust actor-returned captions.

<if condition="rooms = auto-curate">
Do a vision pass over `source-images/`: Read the images, pick the single best photo per distinct room, drop floorplans, maps, aerial-only, watermark-heavy, and near-duplicate shots. Target the hero set: exterior/building, entry/hallway, living, kitchen, primary bed, primary bath, one secondary bed, and a balcony/pool/outdoor shot when present (~6–10 total). Cross-check the `amenities` list from the actor — if it lists "pool", "hot tub", "workspace", "balcony", ensure that photo is not dropped as a duplicate. Tag each kept photo with its room type.
</if>

<if condition="rooms = all">
Use every non-floorplan photo, tagging each with its best-guess room type (vision-only) for camera-move selection.
</if>

Produce an ordered shot list: [photo file, room type, walkthrough position]. Walkthrough order = exterior → entry → living → kitchen → bedrooms → bathrooms → outdoor/amenity, regardless of the actor's photo order.
</step>

<step name="animate_rooms">
Load @frameworks/higgsfield-camera-moves.md.

The prompt craft is **model-agnostic** (applies to whichever Higgsfield video model you chose: Seedance 2.0, Kling 3.0, or any future model). Two OPTIONAL sibling skills enrich the wording when present:
- **`seedance-real-estate`** — Camera Movement Library, Room-by-Room Showcase Strategy, Lighting & Time-of-Day Guide.
- **`seedance-cinematic`** — film-look layer (color grade, atmosphere, depth), used when style = cinematic.

For each shot in the list, generate one clip via the Higgsfield MCP:
1. Pick the room's camera move from the framework mapping in `higgsfield-camera-moves.md` (this mapping is self-sufficient on its own).
2. **Author the motion prompt.** If `seedance-real-estate` is installed, invoke it for the move wording + room cue + lighting; if style = cinematic and `seedance-cinematic` is installed, layer its grade/atmosphere. If neither is installed, build the prompt directly from the framework mapping + prompting rules — it is enough. Either way: apply only the camera-move + lighting layers ON the photo — do NOT re-describe the room (image-to-video carries the scene). Compress the move to the ~5s clip length; one move per clip.
3. (Optional) Call `models_explore` to confirm the best model for the shot; otherwise use the chosen engine.
4. Call `generate_video` as image-to-video, passing the room photo + the authored motion prompt, at the master ratio (16:9 unless 9:16-only was selected).
5. Capture the returned job id.

After dispatching all rooms, poll `job_status` for each until rendered. Download each finished clip to `scenes/room-NN-{type}.mp4` (NN = walkthrough position, zero-padded).

If a clip fails or warps badly (furniture melting, doorway distortion), regenerate that single room with a gentler move (shorter push-in) before continuing. Do not block the whole property on one bad room — note it and move on if a retry also fails.
</step>

<step name="stitch_and_reframe">
Load @frameworks/stitch-pipeline.md.

1. Concatenate `scenes/*.mp4` in walkthrough order via ffmpeg → `final/walkthrough-16x9.mp4` (or the chosen master ratio). Normalize fps/resolution per the framework before concat so clips join cleanly.
2. <if condition="ratio includes 9:16 and master is 16:9">Produce `final/walkthrough-9x16.mp4` — prefer Higgsfield `reframe` for content-aware reframing; fall back to ffmpeg center-crop + scale per the framework.</if>
3. Master is silent by design (v1). Do not add audio.

Verify each final file exists, is non-zero, and plays start-to-finish with the expected duration (~sum of scene durations).
</step>

<step name="review_and_deliver">
Load @checklists/walkthrough-quality.md and validate the output against it.

Report to the user:
- Final video path(s) under `listing-walkthroughs/{listing-slug}/final/`
- Scene count + any rooms that were skipped/failed
- `PROPERTY.md` path
- Rough Higgsfield credit + Apify cost spent

Ask: "Walkthrough ready — want any room regenerated, a different ratio, or this batched across more listings?"

**Wait for approval or revision requests.**
</step>

</steps>

<output>
## Artifact
A finished cinematic walkthrough video plus a complete per-property asset folder.

## Structure
```
listing-walkthroughs/{listing-slug}/
├── PROPERTY.md                 title · link · nightly price · specs · host · room list · run notes
├── source-images/              every photo pulled from Airbnb (NN-original.jpg)
├── scenes/                     per-room Higgsfield clips (room-NN-{type}.mp4)
└── final/                      walkthrough-16x9.mp4 (+ walkthrough-9x16.mp4 if requested)
```

## Location
Output root: `listing-walkthroughs/` at repo root.
</output>

<acceptance-criteria>
- [ ] Listing resolved to structured data + non-empty photo set via Apify
- [ ] PROPERTY.md written with title, Airbnb link, specs, host, amenities, and creative choices
- [ ] All source photos downloaded to source-images/
- [ ] Each curated room produced one clip in scenes/, ordered by walkthrough position
- [ ] final/ contains a playable master that runs start-to-finish in correct room order
- [ ] If 9:16 requested, the social cut exists and is correctly reframed
- [ ] Output passes checklists/walkthrough-quality.md
- [ ] User confirmed the walkthrough matches intent
</acceptance-criteria>
