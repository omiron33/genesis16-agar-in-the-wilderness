// The words of s15-judge, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s15-judge.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["I am dishonored"],
  plane: (from) => standing(inView(from, 0, 0.35, 20), from, 0.72, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.5,
  anchorAt: 0.9,
});
