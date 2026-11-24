// The words of s18-afflicted, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s18-afflicted.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Sara afflicted Agar"],
  plane: (from) => standing(inView(from, 0, 0.58, 14), from, 0.62, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.25,
  anchorAt: 0.75,
});
