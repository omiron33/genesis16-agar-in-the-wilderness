// The words of s37-sees-me, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s37-sees-me.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["\u201cYou are God who sees me"],
  plane: (from) => standing(inView(from, 0, -0.6, 18), from, 0.95, 3.0),
  anchorAt: 0.95,
});
