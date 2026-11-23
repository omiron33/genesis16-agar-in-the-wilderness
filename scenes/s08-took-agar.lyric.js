// The words of s08-took-agar, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s08-took-agar.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Sara took Agar", "and gave her to Abram"],
  plane: (from) => standing(inView(from, 0, 0.5, 14), from, 0.7, 2.6),
});
