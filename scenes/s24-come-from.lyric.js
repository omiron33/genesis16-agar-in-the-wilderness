// The words of s24-come-from, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s24-come-from.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["where have you come from"],
  plane: (from) => standing(inView(from, 0, 0.5, 14), from, 0.72, 2.6),
});
