// The words of s03-maid, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s03-maid.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["She had an Egyptian maid"],
  plane: (from) => standing(inView(from, 0, 0.5, 16), from, 0.7, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.85,
});
