// The words of s05-through-her, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s05-through-her.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["so I may have children"],
  plane: (from) => standing(inView(from, 0, 0.55, 6), from, 0.6, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.85,
});
