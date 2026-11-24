// The words of s16-between, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s16-between.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["between you and me"],
  plane: (from) => standing(inView(from, 0, 0.5, 14), from, 0.72, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.25,
});
