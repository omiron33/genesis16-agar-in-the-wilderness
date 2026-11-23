// The words of s40-the-well, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s40-the-well.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["She called it"],
  plane: (from) => standing(inView(from, 0, 0.55, 8), from, 0.7, 2.6),
});
