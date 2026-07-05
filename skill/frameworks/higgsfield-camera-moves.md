<higgsfield_camera_moves>

## Purpose

How to drive the Higgsfield MCP to turn a single still room photo into a cinematic clip that reads as "walking through" the house — using the proven Seedance prompt craft from the sibling skills `seedance-real-estate` (15-real-estate) and `seedance-cinematic` (01-cinematic) instead of hand-rolled prompts. A walkthrough is NOT one generation; it is one short image-to-video clip per room, each with a room-appropriate camera move, stitched later.

## The Hard Constraint (read first)

Higgsfield `generate_video` is **image-to-video**: it animates a camera/scene move on one still for a short clip (~5s). It does NOT reconstruct 3D space or walk a continuous path through a house. Therefore:

- Whole-house walkthrough = N per-room clips, stitched on our side (see `stitch-pipeline.md`).
- Never promise true 3D / Matterport. Sell it as a "cinematic walkthrough."

## Image-to-Video Adaptation (important)

`seedance-real-estate` and `seedance-cinematic` mostly author **text-to-video** prompts — they describe the entire scene. We feed a **real listing photo**, so the photo already carries the scene. Borrow only these layers from those skills, applied as a motion prompt ON the photo:

1. The **camera move** (from the RE Camera Movement Library).
2. The **lighting / time-of-day mood** (RE Lighting Guide) — only as a light grade, do not re-describe furniture/layout.
3. For cinematic style, the **film-look layer** from `seedance-cinematic` (color grade, atmosphere, depth).

Do NOT re-describe the room's contents in the prompt — that fights the input image and drifts content. Prompt the camera + light, trust the photo.

## How to Author Each Room's Prompt

For each room photo, build the motion prompt by consulting the sibling skills:

1. Pick the room's camera move from the mapping below (named moves from `seedance-real-estate` → Camera Movement Library).
2. Invoke the **`seedance-real-estate`** skill for that move's wording + the room's entry in Room-by-Room Showcase Strategy + a lighting cue from the Lighting & Time-of-Day Guide.
3. If build style = **cinematic**, also invoke **`seedance-cinematic`** and layer its color-grade / atmosphere language.
4. Compress the move to the ~5s clip length; keep ONE move per clip.

## Room → Camera Move Mapping (RE Camera Movement Library)

*Use this section when `subject_type = str_listing` (Airbnb / Booking / self-managed).*

| Room / shot | Named move (seedance-real-estate) | Note for image-to-video |
|-------------|-----------------------------------|--------------------------|
| Exterior / establishing | DRONE AERIAL APPROACH (or GIMBAL GLIDE along facade) | slow approach toward entry; compress to ~5s |
| Entry / foyer | DOORWAY THRESHOLD REVEAL → STEADICAM WALKTHROUGH | "walking in" feel |
| Hallway | STEADICAM WALKTHROUGH | human walking pace, smooth |
| Living / great room | ROTATING/ORBIT or GIMBAL SMOOTH GLIDE | reveal space + depth |
| Kitchen | GIMBAL SMOOTH GLIDE (counter flow) or ORBIT (island) | highlight finishes |
| Dining | GIMBAL SMOOTH GLIDE (table approach) | warm, steady |
| Primary bedroom | STEADICAM / gentle GIMBAL GLIDE | calm, spacious |
| Primary bath / spa | DOORWAY THRESHOLD REVEAL → short push-in | bright, clean |
| Secondary bedroom | GIMBAL SMOOTH GLIDE | brief beat |
| Guest bathroom | REVEAL AROUND CORNER / short push-in | quick, don't linger |
| Home office / library | PULLBACK OR PUSH-IN REVEAL | detail → context |
| Specialty (gym, cinema, wine) | PULLBACK/PUSH-IN or ORBIT | feature the wow |
| Window / view feature | WINDOW APPROACH & VIEW REVEAL | the emotional beat |
| Soaring ceiling / 2-story foyer | CEILING-TO-FLOOR VERTICAL TILT | reveal height |
| Outdoor / backyard / pool | DRONE AERIAL APPROACH or LATERAL CRANE | rising reveal closer |
| Detail (marble, fixtures, joinery) | PULLBACK/PUSH-IN REVEAL + SUBTLE FOCUS SHIFT | craftsmanship |

## Product Ad Camera Moves

*Use this section when `subject_type = product_ad`.*

Product ads read premium when the camera does one clean, unambiguous move that highlights *the object*, not the room around it. Keep moves short and tight — a product clip has ~5 seconds to sell.

| Shot role | Named move | Note for image-to-video |
|-----------|------------|--------------------------|
| Hero front | SLOW PUSH-IN | Straight-on approach; product fills more of the frame by the end. Do NOT change perspective. |
| 3/4 angle | GENTLE ORBIT (short arc) | ~15–20° arc around the product, held near-horizontal. Reveals depth without warping. |
| Side / back | LATERAL GLIDE | Slow horizontal drift; keeps proportions intact where a full orbit would drift the shape. |
| Macro detail (texture, logo, mechanism) | RACK-FOCUS PULL + MICRO PUSH-IN | Focus racks onto the detail while the camera creeps closer. Buttery. |
| Feature callout (a specific part) | PARALLAX + SLIGHT TILT | Suggests dimensionality on a flat product shot; keep the parallax tiny (<5%). |
| Lifestyle / in-use | SUBTLE HANDHELD PARALLAX | Adds "life" to a static hands-holding-product shot without pretending it's video footage. |
| Ambient / scene-setter | SLOW PULLBACK REVEAL | Product first, context after — good opener or closer. |
| Closer / logo card | HOLD + SUBTLE ZOOM | For the final frame if the user supplied a brand card; else skip. |

**Product-specific rules:**
- **Never re-describe the product in the prompt.** Especially not brand names — Higgsfield warps text. Overlay copy in the editor afterwards.
- **No compound moves.** Orbit *or* push-in, never both in one clip.
- **Keep orbits short.** More than ~25° drifts geometry, especially on packaging with printed text.
- **Match the vibe.** Luxury → slow (≥3s to reach 80% of the move). Punchy DTC → faster start, still one move.

## Business Ad Camera Moves

*Use this section when `subject_type = business_ad` (restaurant, gym, salon, tour, workshop, clinic, etc.).*

Business ads mix **place** (rooms, signage, atmosphere) and **activity** (people doing the thing you're selling). Blend the RE walkthrough grammar with a couple of activity-specific moves.

| Shot role | Named move | Note for image-to-video |
|-----------|------------|--------------------------|
| Exterior / signage | DRONE AERIAL APPROACH or GIMBAL GLIDE toward the sign | Establishes place. Approach slow so the sign text doesn't bend. |
| Interior wide | STEADICAM WALKTHROUGH or SMOOTH GLIDE | Sells the vibe of the space; human walking pace. |
| Bar / counter / display | LATERAL GLIDE along the counter | Highlights craft, product selection, or menu. |
| Activity in progress (barista, chef, trainer, stylist) | SHOULDER-FOLLOW (close, half-behind subject) or SLOW PUSH-IN | The moneymaker shot. Compresses "we do this well" into 5 seconds. |
| Product / detail (dish, treatment, gear) | SLOW PUSH-IN + RACK FOCUS | Reveals craft. Same grammar as product-ad macro. |
| Customer / vibe | GENTLE ORBIT or PARALLAX | Faces are risky in image-to-video — orbit slowly, keep the arc small. |
| Ambient (steam, sparks, sunlight, plants) | SUBTLE PARALLAX + LIGHT DRIFT | Texture beats; use as connective tissue between hero shots. |
| Closer (finished dish, hero product, "come back") | PULLBACK REVEAL or HOLD + SUBTLE ZOOM | Ends the ad on the takeaway. |

**Business-specific rules:**
- **Faces are the highest-risk element** in image-to-video. Prefer profile or back-of-head shots for activity beats; if a customer is facing camera, prefer parallax over orbit and keep the move tiny.
- **Signage text bends** on aggressive moves. Approach signs slowly and keep the sign roughly centered.
- **Match ad length to vibe.** Fine dining / spa / luxury → 8–10 shots, slow moves. Quick-service / gym / punchy retail → 6–8 shots, tighter moves.
- **Cross-reference the RE mapping.** Any indoor room shot uses the RE walkthrough grammar above (living room ≈ dining floor, primary bath ≈ treatment room, etc.).

## Prompting Rules

- **One move per clip.** Compound moves warp geometry. Single and slow.
- **Slow beats fast.** Real estate reads premium when calm; fast moves expose AI artifacts (melting furniture, bent doorways).
- **Prompt the camera + light, not the scene.** The photo carries content.
- **Engine is independent of the prompt craft.** The camera-move + lighting + cinematic-grade layers are model-agnostic — they apply to whatever Higgsfield video model you pick (Seedance 2.0 default, Kling 3.0, or a future model). Optionally `models_explore(action:'recommend')` per shot.
- **Aspect ratio = master ratio.** Generate at 16:9 for the agent master (or 9:16 if that's the only output). Reframe later; never generate twice.

## Generation + Polling

1. `generate_video` (image-to-video) per source photo with its authored motion prompt → job id.
2. Dispatch all shots, then poll `job_status` per id (don't block shot N on N-1).
3. Download each clip to `scenes/shot-NN-{role}.mp4`, NN = ordered position (walkthrough position for `str_listing`; ad-order position for `product_ad` / `business_ad`).

## Handling Bad Outputs

| Symptom | Fix |
|---------|-----|
| Furniture / product melts / warps | Regenerate with a gentler, shorter move (orbit → short push-in) |
| Doorway / window / packaging edge bends | Reduce move distance; prefer lateral glide over push-in for that shot |
| Text on a sign / label / logo warps | Slow the move; approach text head-on rather than at an angle |
| Face distorts on a person shot | Switch to a smaller move (parallax over orbit); crop tighter to hide the face if permissible |
| Clip too short to feel cinematic | Accept it — stitched short clips still read as a tour/ad; never force one long generation |
| One shot keeps failing | Note it, skip after one retry; never block the whole subject on one shot |

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Re-describing the room in the prompt | Fights the input photo, drifts content | Prompt only the camera move + light |
| Copying the seedance skills' full text-to-video scene prompts | They assume no input image; bloats + drifts | Borrow camera-move + lighting layers only |
| Generating the whole house in one call | Higgsfield can't; incoherent output | One clip per room, stitch later |
| Fast / compound camera moves | Exposes AI artifacts, looks cheap | Single slow move per clip |
| Duplicating the RE Camera Library into this skill | Two sources drift on every Seedance update | Invoke `seedance-real-estate` by name |

## Source

Camera-move grammar: `seedance-real-estate` (15-real-estate) Camera Movement Library + Room-by-Room Showcase Strategy + Lighting & Time-of-Day Guide. Film-look layer: `seedance-cinematic` (01-cinematic). Higgsfield MCP: `generate_video`, `models_explore`, `job_status`, `reframe`.

</higgsfield_camera_moves>
