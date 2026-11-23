// The words of s27-return, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s27-return.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["\u201cReturn to your mistress", "submit yourself"],
  plane: (from) => standing(inView(from, 0, 0.5, 16), from, 0.72, 2.6),
});
