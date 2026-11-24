// The words of s39-appeared, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s39-appeared.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["him who appeared"],
  plane: (from) => standing(inView(from, 0, -0.5, 30), from, 0.72, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.2,
});
