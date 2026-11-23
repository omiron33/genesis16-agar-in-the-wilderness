// The words of s06-listened, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s06-listened.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Abram listened to Sara"],
  plane: (from) => standing(inView(from, 0, 0.5, 12), from, 0.72, 2.6),
});
