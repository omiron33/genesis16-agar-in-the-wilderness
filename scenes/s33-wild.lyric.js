// The words of s33-wild, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s33-wild.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["\u201cHe will be a wild man"],
  plane: (from) => standing(inView(from, 0, 0.5, 30), from, 0.72, 2.6),
});
