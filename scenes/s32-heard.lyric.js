// The words of s32-heard, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s32-heard.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["for the Lord has heard"],
  plane: (from) => standing(inView(from, 0, 0.5, 10), from, 0.72, 2.6),
});
