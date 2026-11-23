// The words of s29-multiply, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s29-multiply.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["\u201cI will greatly multiply", "they will be too many"],
  plane: (from) => standing(inView(from, 0, -0.45, 30), from, 0.72, 2.6),
});
