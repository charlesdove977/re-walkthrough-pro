<purpose>
Take a Zillow listing (a pasted link, an address, or one discovered via search) and produce a finished cinematic room-by-room walkthrough video. Scrapes the listing + photos via Apify, animates curated rooms with the Higgsfield MCP, stitches the clips with ffmpeg, and writes everything into a predictable per-property folder.
</purpose>

<user-story>
As a creator selling media to real estate agents, I want one command that turns a listing into a cinematic walkthrough, so that I can produce a sellable tour in minutes instead of manually scraping, prompting, and editing.
</user-story>

<when-to-use>
- User pastes a Zillow listing URL or address and wants a walkthrough
- User wants to discover listings ("find 5 in NJ") then build from one
- Entry point routes here via /listing-walkthrough
</when-to-use>

<references>
@frameworks/apify-zillow-actors.md (during resolve_listing — actor IDs, inputs, chaining)
@frameworks/higgsfield-camera-moves.md (during animate_rooms — room→camera-move mapping + prompts)
@frameworks/stitch-pipeline.md (during stitch_and_reframe — ffmpeg concat + reframe)
@templates/property-md.md (during persist_property — PROPERTY.md shape)
@checklists/walkthrough-quality.md (during review_and_deliver — pre-delivery QA)
</references>

<steps>

<step name="choose_input_mode" priority="first">
Determine what we're building from. Ask the user (if not already clear from how they invoked the skill):

1. **Do you have a specific listing, or want me to find some?**
   - A Zillow listing URL → single-property path
   - An address → single-property path (use the actor's `addresses` input)
   - "Find me listings" → discovery path (ask: location + how many, e.g. "5 single-family homes in Montclair NJ")

**Wait for response.**

<if condition="discovery path">
Load @frameworks/apify-zillow-actors.md. Run the search/zip actor for the requested location + count. Present the found listings as a table (address · price · beds/baths · sqft · photo count). Ask the user to pick one (or more, processed one at a time).

**Wait for selection.**
</if>

Confirm the final property/properties and the listing status (FOR_SALE / RECENTLY_SOLD / FOR_RENT — needed by the detail scraper; default FOR_SALE for active listings).
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
Load @frameworks/apify-zillow-actors.md.

Resolve the property to structured data + photo URLs via the Apify MCP:
- URL path → call `maxcopell/zillow-detail-scraper` with `startUrls`.
- Address path → same actor with `addresses`.
- Discovery path → chain the search actor's dataset into the detail scraper via `searchResultsDatasetId`.

Use the Apify MCP `call-actor` tool (fetch the actor's input schema first if unsure). Retrieve the run's dataset items.

Verify you got: full address, price, beds/baths/sqft, year built, agent info, and a non-empty list of image URLs. If image URLs are missing or sparse, fall back to `burbn/zillow-property-images-scraper` with `propertyUrls` for the photos.

Derive a `{property-slug}` from the address (kebab-case, e.g. `17-zelma-dr-greenville-sc-29617`).
</step>

<step name="persist_property">
Load @templates/property-md.md.

Create the property folder tree under the output root `listing-walkthroughs/{property-slug}/`:
- `source-images/` — download every photo URL here (use Bash `curl`/`wget`; name `NN-original.jpg` in returned order).
- `scenes/` — created now, filled in animate_rooms.
- `final/` — created now, filled in stitch_and_reframe.

Write `listing-walkthroughs/{property-slug}/PROPERTY.md` from the template: address, Zillow link, price, beds/baths/sqft, year, agent, full room/photo list, and the run's creative choices.
</step>

<step name="curate_rooms">
**Text screen (HARD RULE — run first).** Vision-pass every photo in `source-images/` for baked-in on-screen text: brokerage/agent watermarks, agent name or headshot badges, price banners, "Coming Soon" / "For Sale" / "Just Listed" overlays, MLS stamps, logos, tour-company bugs. Any photo with such text is **unusable** — `Bash rm` it from `source-images/` immediately; never animate it and never let it reach a scene or the final video. If removing a texted photo leaves a needed room with no clean shot, tell the user and ask for a clean replacement rather than using the texted one. Log removed files in PROPERTY.md.

<if condition="rooms = auto-curate">
Do a vision pass over the surviving `source-images/`: Read the images, pick the single best photo per distinct room, drop floorplans, maps, aerial-only, and near-duplicate shots. Target the hero set: exterior, entry/foyer, living, kitchen, primary bed, primary bath, one secondary bed, and a backyard/outdoor shot when present (~6–10 total). Tag each kept photo with its room type.
</if>

<if condition="rooms = all">
Use every clean, non-floorplan photo, tagging each with its best-guess room type for camera-move selection.
</if>

Produce an ordered shot list: [photo file, room type, walkthrough position]. Walkthrough order = exterior → entry → living → kitchen → bedrooms → bathrooms → outdoor, regardless of Zillow's photo order.
</step>

<step name="animate_rooms">
Load @frameworks/higgsfield-camera-moves.md.

The prompt craft comes from two sibling skills — they are **model-agnostic** (apply to whichever Higgsfield video model you chose: Seedance 2.0, Kling 3.0, or any future model):
- **`seedance-real-estate`** — Camera Movement Library, Room-by-Room Showcase Strategy, Lighting & Time-of-Day Guide.
- **`seedance-cinematic`** — film-look layer (color grade, atmosphere, depth), used when style = cinematic.

For each shot in the list, generate one clip via the Higgsfield MCP:
1. Pick the room's camera move from the framework mapping (named moves from `seedance-real-estate`).
2. **Author the motion prompt** by invoking `seedance-real-estate` (move wording + room cue + lighting); if style = cinematic, also invoke `seedance-cinematic` and layer its grade/atmosphere. Apply only the camera-move + lighting layers ON the photo — do NOT re-describe the room (image-to-video carries the scene). Compress the move to the ~5s clip length; one move per clip.
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
- Final video path(s) under `listing-walkthroughs/{property-slug}/final/`
- Scene count + any rooms that were skipped/failed
- `PROPERTY.md` path
- Rough Higgsfield credit + Apify cost spent

**Approval loop (ALWAYS ask — do not skip).** Ask directly: **"Do you like the walkthrough?"**
- **Yes** → offer a different ratio or batching across more listings, then finish.
- **No** → ask them to name the room in `scenes/` they didn't like (e.g. `room-04-kitchen.mp4`). Regenerate ONLY that scene (gentler / adjusted camera move, or a different clean source photo), re-run the stitch pipeline to rebuild the master, and write the new master into `final/`. Then ask again — repeat until they approve.

**Wait for approval or a named room to redo.**
</step>

</steps>

<output>
## Artifact
A finished cinematic walkthrough video plus a complete per-property asset folder.

## Structure
```
listing-walkthroughs/{property-slug}/
├── PROPERTY.md                 address · link · price · specs · agent · room list · run notes
├── source-images/              every photo pulled from Zillow (NN-original.jpg)
├── scenes/                     per-room Higgsfield clips (room-NN-{type}.mp4)
└── final/                      walkthrough-16x9.mp4 (+ walkthrough-9x16.mp4 if requested)
```

## Location
Output root: `listing-walkthroughs/` at repo root.
</output>

<acceptance-criteria>
- [ ] Listing resolved to structured data + non-empty photo set via Apify
- [ ] PROPERTY.md written with address, link, specs, agent, and creative choices
- [ ] All source photos downloaded to source-images/
- [ ] Each curated room produced one clip in scenes/, ordered by walkthrough position
- [ ] final/ contains a playable master that runs start-to-finish in correct room order
- [ ] If 9:16 requested, the social cut exists and is correctly reframed
- [ ] Output passes checklists/walkthrough-quality.md
- [ ] User confirmed the walkthrough matches intent
</acceptance-criteria>
