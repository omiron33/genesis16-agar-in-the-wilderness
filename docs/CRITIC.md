# Critic pass on the draft (2026-11-23, one pass)

Read from one frame per scene of the 30 fps draft plates (`out/review/draft-plates-sheet*.png`), the
draft clips themselves, and five rounds of Mac review stills. Checked anatomy, text in pictures, stick
figures, clutter, blood, framing, the theology, and the complaints on earlier films.

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

Checked and fine:
- No people or figures are drawn anywhere. Agar is present only through the veil and the footprints.
- No text inside the pictures. The verse annotations and the YEAR and EIGHTY-SIX YEARS gauges are in
  the lyric overlay layer.
- No blood. No flashing.
- The angel is light only, and his words are set in gold small capitals.
- Every line is on screen as it is sung. Dark ink is used on bright daylight skies.

Left as is (minor): the tents read as dark goat-hair blocks at a distance, and the palm fronds show
slight banding up close.

Verdict: render the final.
