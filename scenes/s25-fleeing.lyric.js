// The words of s25-fleeing, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s25-fleeing.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["She said, \u201cI am fleeing"],
  plane: (from) => standing(inView(from, 0, 0.55, 7), from, 0.68, 2.6),
});
