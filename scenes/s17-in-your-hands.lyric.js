// The words of s17-in-your-hands, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s17-in-your-hands.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Abram said to Sara", "Treat her as you think"],
  plane: (from) => standing(inView(from, 0, 0.55, 12), from, 0.72, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.5,
});
