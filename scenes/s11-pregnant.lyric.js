// The words of s11-pregnant, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s11-pregnant.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["When she knew"],
  plane: (from) => standing(inView(from, 0, 0.5, 18), from, 0.72, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.25,
});
