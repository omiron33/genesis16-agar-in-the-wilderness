// The words of s35-brothers, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s35-brothers.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["He will live before all"],
  plane: (from) => standing(inView(from, 0, 0.5, 30), from, 0.72, 2.6),
});
