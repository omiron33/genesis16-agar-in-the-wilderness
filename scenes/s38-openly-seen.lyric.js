// The words of s38-openly-seen, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s38-openly-seen.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["She said, \u201cI have openly"],
  plane: (from) => standing(inView(from, 0, 0.52, 9), from, 0.7, 2.6),
});
