// The words of s45-eighty-six, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s45-eighty-six.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: ["Abram was eighty-six", "when Agar bore Ismael"],
  plane: (from) => standing(inView(from, 0, 0.52, 20), from, 0.72, 2.6),
  extra: (ctx, t, H) => { gauge(ctx, 'EIGHTY-SIX YEARS', 1920, H * 0.92, { size: 58, alpha: 0.85 * ease.inOut3((t - P.from - 1.0) / 1.5) }); },
});
