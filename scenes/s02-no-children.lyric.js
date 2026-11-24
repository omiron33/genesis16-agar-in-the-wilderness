// The words of s02-no-children, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s02-no-children.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Sara, Abram\u2019s wife"],
  plane: (from) => standing(inView(from, 0, -0.55, 12), from, 0.66, 2.6),
  ink: '243, 235, 222', gaugeInk: '243, 235, 222',
  shade: 0.4,
});
