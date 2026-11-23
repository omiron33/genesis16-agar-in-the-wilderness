// The words of s07-ten-years, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s07-ten-years.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["After Abram had lived"],
  plane: (from) => standing(inView(from, 0, -0.5, 40), from, 0.72, 2.6),
  ink: '44, 30, 20', gaugeInk: '44, 30, 20',
  shade: 0.85,
  extra: (ctx, t, H) => { const y = Math.max(1, Math.min(10, Math.ceil(10 * ease.inOut3((t - P.from) / (P.to - P.from - 0.6))))); gauge(ctx, `YEAR ${y}`, 1920, H * 0.9, { size: 64, alpha: 0.9, ink: '44, 30, 20' }); },
});
