// The words of s41-whom-seen, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s41-whom-seen.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["whom I have openly seen"],
  plane: (from) => standing(inView(from, 0, 0.55, 4), from, 0.7, 2.6),
});
