// The words of s22-road-to-sur, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s22-road-to-sur.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["in the wilderness"],
  plane: (from) => standing(inView(from, 0, 0.5, 40), from, 0.72, 2.6),
});
