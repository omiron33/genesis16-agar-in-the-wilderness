// The words of s13-your-fault, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s13-your-fault.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Sara said to Abram"],
  plane: (from) => standing(inView(from, -0.48, 0.64, 20), from, 0.44, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.25,
  anchorAt: 0.8,
});
