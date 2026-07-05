<stitch_pipeline>

## Purpose

How to assemble the per-room Higgsfield clips into one finished walkthrough, and how to produce the optional 9:16 social cut. Stitching happens on our side with ffmpeg — the skill owns the edit, not Claude eyeballing it and not Higgsfield.

## Walkthrough / Ad Order

Concatenate in the natural order for the subject type, NOT the order the actor / user provided the photos in (unless the user explicitly asked to preserve their order):

- **STR listing:** `exterior → entry/foyer → living → dining → kitchen → bedrooms → bathrooms → outdoor/amenity`
- **Product ad:** `hero → 3/4 angle → macro detail → lifestyle in-use → closer`
- **Business ad:** `exterior/signage → interior wide → activity in progress → product/detail → customer/vibe → closer`

The `scenes/` files are already named `shot-NN-{role}.mp4` with NN encoding this order, so a sorted concat is correct.

## Normalize Before Concat

Higgsfield clips can differ in fps, resolution, or codec. Concatenating mismatched clips causes stutter or failure. Normalize each clip to the same fps + resolution + codec first, then concat.

```bash
# 1. Normalize every scene to 1080p, 30fps, h264 (master = 16:9)
for f in scenes/shot-*.mp4; do
  ffmpeg -y -i "$f" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30" \
    -c:v libx264 -pix_fmt yuv420p -an "norm-$(basename "$f")"
done

# 2. Concat in sorted (walkthrough / ad) order
ls norm-shot-*.mp4 | sort | sed "s/^/file '/;s/$/'/" > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c:v libx264 -pix_fmt yuv420p -an final/master-16x9.mp4
```

The final filename should reflect the subject type: `walkthrough-16x9.mp4` for STR listings, `ad-16x9.mp4` or `ad-9x16.mp4` for product / business ads.

Silent master by design (v1): `-an` drops audio. Add music/VO in your editor later.

## Optional Transitions

Hard cuts on the beat are clean and safe (default). If you want crossfades between shots, use `xfade` — but keep them short (0.3–0.5s) so the tour / ad stays brisk. Hard cuts are the recommended default; only add crossfades if the user asks.

## Alt Ratio (9:16 or 16:9)

If the user requested both ratios, produce the alt cut FROM the finished master, not by regenerating:

- **Preferred:** Higgsfield `reframe` on the master (content-aware — keeps the subject framed).
- **Fallback (ffmpeg center-crop + scale):**

```bash
# 16:9 master → 9:16 social cut
ffmpeg -y -i final/master-16x9.mp4 \
  -vf "scale=-1:1920,crop=1080:1920" -c:v libx264 -pix_fmt yuv420p -an final/master-9x16.mp4

# 9:16 master → 16:9 alt cut (adds letterbox unless subject centered)
ffmpeg -y -i final/master-9x16.mp4 \
  -vf "scale=1920:-1,crop=1920:1080" -c:v libx264 -pix_fmt yuv420p -an final/master-16x9.mp4
```

Center-crop loses edges; `reframe` is better for shots where the focal point isn't centered (especially product ads where the item may sit off-center in the source frame).

## Verify Output

After producing each final file:
- File exists and is non-zero.
- Duration ≈ sum of scene durations (catches a silently dropped clip).
- Plays start-to-finish (a quick `ffprobe` for duration + stream count is enough; no need to watch).

```bash
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 final/master-16x9.mp4
```

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Concat without normalizing | Stutter, A/V desync, or ffmpeg errors on mismatched clips | Normalize fps/res/codec first |
| Regenerating rooms at 9:16 for the social cut | Double Higgsfield spend | Reframe the finished master |
| Long fancy transitions | Drags the tour, looks like a screensaver | Hard cuts (or ≤0.5s crossfade) |
| Trusting the concat blindly | A dropped clip yields a short video nobody notices | Check duration ≈ sum of scenes |
| Baking in music in v1 | Locks the edit, licensing headaches | Ship silent master; sound added downstream |

## Source

ffmpeg (concat demuxer, scale/pad/crop, xfade) + Higgsfield `reframe`. Commands are reference patterns — adjust resolution/fps to the chosen master ratio.

</stitch_pipeline>
