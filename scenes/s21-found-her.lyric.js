// The words of s21-found-her, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s21-found-her.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["The Lord\u2019s angel found her"],
  plane: (from) => standing(inView(from, 0, 0.5, 20), from, 0.66, 2.6),
  anchorAt: 0.9,
});
