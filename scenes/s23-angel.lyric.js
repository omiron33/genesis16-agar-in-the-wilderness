// The words of s23-angel, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s23-angel.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["The angel said"],
  plane: (from) => standing(inView(from, 0, 0.55, 14), from, 0.75, 2.4),
});
