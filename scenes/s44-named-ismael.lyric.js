// The words of s44-named-ismael, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s44-named-ismael.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["and Abram named the boy"],
  plane: (from) => standing(inView(from, 0, 0.5, 14), from, 0.72, 2.6),
});
