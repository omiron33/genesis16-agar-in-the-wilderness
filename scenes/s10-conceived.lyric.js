// The words of s10-conceived, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s10-conceived.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["He went in to Agar"],
  plane: (from) => standing(inView(from, 0, 0.55, 8), from, 0.66, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.5,
});
