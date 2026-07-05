# Walkthrough / Ad Quality Checklist

Validates a finished cinematic video before delivering it. Universal checks apply to every subject type; the subject-specific section runs on top.

## Universal — Assets & Structure
- [ ] `walkthroughs/{subject-slug}/` contains BRIEF.md, source-images/, scenes/, final/
- [ ] BRIEF.md starts with a `Subject type:` header (str_listing / product_ad / business_ad)
- [ ] BRIEF.md records all four build choices (style, shots, ratio, engine)
- [ ] source-images/ has at least one photo per animated shot
- [ ] scenes/ clip count equals the BRIEF.md shot-list row count

## Universal — Video Output
- [ ] final/ contains a non-zero master file at the chosen ratio
- [ ] Master duration ≈ sum of scene durations (no clip silently dropped)
- [ ] If both ratios were requested, the alt cut exists and is correctly reframed (subject not cropped out)

## Universal — Visual Quality
- [ ] No clip has obvious melting / warping (furniture, product edges, faces, signage text)
- [ ] Each clip uses one slow camera move (no fast or compound moves)
- [ ] Order matches the subject-specific spec below

## Universal — Truth-in-Claims
- [ ] Asset is described as a "cinematic walkthrough / ad," not "3D" or "Matterport"
- [ ] Master is silent (v1) — no accidental audio baked in
- [ ] No brand / product / place names baked *into the video* as text (overlays are for the editor step)

---

## STR Listing (str_listing) — Extras
- [ ] BRIEF.md has listing title, listing URL (or "N/A" for self-managed), nightly price, bedrooms/bathrooms/max-guests, property type
- [ ] Shot order: exterior → entry → living → kitchen → beds → baths → outdoor/amenity
- [ ] Exterior opens the tour; an outdoor / amenity shot (pool, balcony, terrace) closes it when available
- [ ] No floorplans, maps, or watermark-heavy photos animated as rooms

## Product Ad (product_ad) — Extras
- [ ] BRIEF.md has product name, brand, one-line pitch, category, target audience
- [ ] Shot order: hero front → angle variations → macro detail → lifestyle → optional closer
- [ ] Hero (front) shot is first and is genuinely the strongest frame
- [ ] Orbits are ≤ ~25° arc (no packaging text warping)
- [ ] No compound moves on the product itself (orbit *or* push-in, never both)
- [ ] Macro / detail shot present (texture, logo, or mechanism) — the "craftsmanship beat"

## Business Ad (business_ad) — Extras
- [ ] BRIEF.md has business name, category, city/neighborhood, vibe/target customer
- [ ] Shot order: exterior/signage → interior wide → activity → detail → vibe → optional closer
- [ ] At least one "activity in progress" shot (the moneymaker beat)
- [ ] Signage text is intact (not bent/warped by too-aggressive a move)
- [ ] Face shots (if any) use small parallax / short orbit — no violent warping
- [ ] Ambient / vibe shots exist as connective tissue between hero beats

---

## Scoring

| Score | Rating | Action |
|-------|--------|--------|
| 100% | Ship it | Deliverable to the client |
| 80-99% | Fix and ship | Regenerate the offending shot(s), then go |
| 50-79% | Rework | Several bad clips or wrong order — rebuild scenes |
| Below 50% | Restart | Bad source set or wrong subject type — re-ingest |
