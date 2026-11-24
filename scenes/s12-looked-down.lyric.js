// The words of s12-looked-down, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s12-looked-down.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["she looked down"],
  plane: (from) => standing(inView(from, 0, -0.5, 14), from, 0.72, 2.6),
  ink: '243, 235, 222', gaugeInk: '243, 235, 222',
  shade: 0.25,
});
