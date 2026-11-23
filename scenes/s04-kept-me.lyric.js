// The words of s04-kept-me, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s04-kept-me.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Sara said to Abram", "from having children"],
  plane: (from) => standing(inView(from, 0, 0.52, 22), from, 0.7, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.5,
});
