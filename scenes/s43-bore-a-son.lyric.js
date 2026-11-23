// The words of s43-bore-a-son, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s43-bore-a-son.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Agar bore Abram a son"],
  plane: (from) => standing(inView(from, 0, 0.5, 24), from, 0.72, 2.6),
});
