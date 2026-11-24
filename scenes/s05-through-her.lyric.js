// The words of s05-through-her, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s05-through-her.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["so I may have children"],
  plane: (from) => standing(inView(from, 0.42, 0.78, 6), from, 0.44, 3),
  ink: '243, 235, 222', gaugeInk: '243, 235, 222',
  shade: 0.3,
  anchorAt: 0.8,
});
