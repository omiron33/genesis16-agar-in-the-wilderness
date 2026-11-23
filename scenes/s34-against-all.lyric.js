// The words of s34-against-all, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s34-against-all.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["his hands against all"],
  plane: (from) => standing(inView(from, 0, -0.45, 40), from, 0.72, 2.6),
});
