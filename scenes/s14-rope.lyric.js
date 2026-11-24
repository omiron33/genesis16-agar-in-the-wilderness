// The words of s14-rope, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s14-rope.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["I gave my maid to you"],
  plane: (from) => standing(inView(from, 0, 0.6, 8), from, 0.7, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.25,
});
