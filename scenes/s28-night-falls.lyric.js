// The words of s28-night-falls, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s28-night-falls.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["The Lord\u2019s angel said"],
  plane: (from) => standing(inView(from, 0, -0.45, 14), from, 0.72, 2.6),
});
