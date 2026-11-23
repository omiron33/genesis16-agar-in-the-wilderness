// The words of s00-title, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s00-title.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: [],
  plane: (from) => standing(inView(from, 0, 0.18, 60), from, 0.9, 3),
  gauge: false, extra: (ctx, t, H) => { titleCard(ctx, H, ease.inOut3((t - P.from - 0.6) / 1.4), ease.inOut3((t - P.from - 1.8) / 2.0), 1 - ease.inOut3((t - P.to + 1.2) / 1.0)); },
});
