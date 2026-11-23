// The words of s01-camp, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s01-camp.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: [],
  plane: (from) => standing(inView(from, 0, 0.42, 30), from, 0.4, 3),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.85,
  gauge: "GENESIS 16",
});
