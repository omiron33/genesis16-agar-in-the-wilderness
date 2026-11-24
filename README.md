# Agar in the Wilderness (Genesis 16)

Built with the Ark engine: https://github.com/omiron33/ark-video-studio

A code-rendered lyric film of Genesis 16. Sara has no child and gives her Egyptian maid Agar to Abram.
Agar conceives, the household turns bitter, and she flees into the wilderness. The angel of the Lord
finds her by a spring on the road to Sur, sends her back with a promise for her son Ismael, and she
names the Lord "You are God who sees me". The well is called Beer-lahai-roi.

[Listen at TechnoChristianity](https://technochristianity.com/music/) · [More films on YouTube](https://www.youtube.com/@technochristianity)

## How it is made

47 short scenes cut on measured beats, one world for the whole film, and the lyrics set as their own
sharp type layer on planes placed in that world. No person is drawn. Agar is seen only in what she
leaves: an indigo veil on a line, footprints that the wind fills in, the veil dropped by the water.
The angel of the Lord is shown only as light.

- `lib/world3.js`: the film's one raymarched world (`world.js` and `world2.js` are v1).
  - The land: stony hill country round the camp, and the desert with wind-cut dunes and ripples, a
    stepped sandstone escarpment, the spring's hollow and the footprints.
  - The air: single scattering (Rayleigh, Mie and ozone), aerial perspective, a low dust layer, and
    stars with the Milky Way.
  - The sky: one cloud deck that opens like an eye, with shafts of light under it.
  - The spring: a real shoreline, rings from its source, reflection, refraction and caustics.
  - The things: goat-hair tents, an acacia, date palms, the stone well-head, the veil, scattered scrub,
    lamps, and the angel's light.
- `lib/look.js`: the palette that builds across the song and the grade. `lib/type.js`: the two
  typefaces (EB Garamond, Inter Tight) and the voices. The narrator is roman. Sara, Abram and Agar
  are italic. The angel speaks in small capitals in the signal gold, and Agar's naming of God is
  italic gold.
- `lib/world4.js`, `lib/props.js`, `lib/cloth.js`, `lib/type3.js` and `tools/early.py`: the opening (s00 to
  s18), where objects act: a simulated indigo veil (Agar) and red cloth (Sara), Abram's staff, and the
  things of the camp. Run `tools/early.py` after `tools/scenes.py`.
- `scenes/sNN-*.js` and `scenes/sNN-*.lyric.js`: one picture and one lyric layer per scene,
  generated from the authored table in `tools/scenes.py`.
- `data/lyrics.json`, `data/audio.json`: the sung words, force-aligned to the separated vocal and
  checked against local Whisper (machine estimates), and the measured beats (79 BPM).
- `docs/BRIEF.md`: the design system. `docs/STORYBOARD.md`: the scene table with cut times.

## Rendering

Put the original 48 kHz stereo recording at `media/song.wav`. It is not in this repository.

- `python3 tools/scenes.py` regenerates the scene modules, `film.json` and the storyboard from the
  authored table.
- `film.json` lists the scenes, their cut times on measured beats, and the finish: 1920 × 1080 at
  60 fps, 8 sub-frames (16 on the fast-motion scenes), CRF 12.
- A fast review draft renders the same scenes at 30 fps with 2 sub-frames.

## License

The source code is released under the [MIT License](LICENSE). The song recording and the finished
film are separate media releases. The source-code license grants no rights to the recording, to its
lyrics as a recorded work, or to the rendered film.
