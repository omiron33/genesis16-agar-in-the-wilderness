# Critic pass on the draft (2026-11-23, one pass)

A self-review by the author of the code, not an independent critic. It used single frames from 41 of
the 47 draft scenes (s28, s30, s33, s35, s44 and s46 were missing from the sheet), three frames from
each of three draft clips, and Mac review stills. The draft was not watched end to end.

Fixed before the final, in the final's code:
- A black band across the land at the horizon. Grazing rays ran out of march steps over the flat
  ground and fell through to the sky below the horizon. They now take the land where they stopped.
- False shadows and dark discs on the ground (round under the veil, blob-shaped under the palms).
  Ambient occlusion and the shadow pass were reading the bounding volumes and the conservative frond
  and cloth distance fields. Bounding volumes are now ignored, and the veil, its line and the palm
  fronds cast no shadow pass.
- El Roi read as a pale glare. The cloud deck is now dark slate. The almond opening has a warm gold
  rim and shows blue sky with the sun as its pupil. The light shafts no longer wash out the frame.
  In "openly seen" the camera looks along the line of the eye's reflection in the spring.
- The spring water was opaque and beige. It now absorbs and refracts clear teal over a sandy floor.
  The stripes from the sand ripples on its banks are gone.
- Stray props: the water skin read as a dark blob or a ball, so it was removed. The veil was a
  saturated blue panel and is now dark indigo linen with finer folds.
- The posts and line stay standing when the wind tears the veil away.
- Framing:
  - The sunrise now rises behind the small tent.
  - The rope shot moved to the small tent.
  - The footprint trail is a high oblique shot.
  - "Where have you come from" holds on the light.
  - The flight and the wilderness shots see the dune sea.
  - The terraced cliffs, which looked artificial, were replaced by moonlit dunes in ranks.
  - The aerial over the spring has no cloud shadow.
- Night scenes looked like snow, then too dark. The moon level and the night exposure were balanced.
- The hill country had flat camouflage blotches and square pebbles. It now has soft ground variation,
  round stones and scattered scrub bushes, which give depth.
- Clouds were added to the golden afternoon of the household.
- The tent interior is lit by its lamp, and the tents have woven panels and wall folds.

Seen in the frames: no people or figures, no text in the pictures, no blood; the angel is light only.
Not checked at the time: flashing, motion, and whether every line is on screen as it is sung (a line
in s15 was in fact cut off). 71 of 322 aligned words had no Whisper match within 0.6 s. Many are name
spellings (Agar, Sara, Sur), but "and now that she is pregnant" is not in Whisper's text at all.

# Known faults in the final (frames from 42 finished segments, 2026-11-23)

- s19: the footprints are gone about half way through; the rest of the shot is blank grey sand.
- s04, s15: dark words cross the black tree crown and are hard to read.
- s29, s37: the line sits against the bottom edge of the frame.
- s40, s41: the well is faceted blue-grey blocks, not convincing fieldstone.
- The tents are still near-black shapes in daylight scenes; the dropped veil (s25) is a flat blue slab.
- s21 to s32 night and spring scenes rendered before the realism pass keep the even scatter of rocks.
- s34: flat blue ground with visible noise. Palms and acacia were not reworked.
