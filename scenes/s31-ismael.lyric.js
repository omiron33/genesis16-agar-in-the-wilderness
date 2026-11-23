// The words of s31-ismael, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s31-ismael.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["you will bear a son"],
  plane: (from) => standing(inView(from, 0, 0.55, 8), from, 0.7, 2.6),
});
