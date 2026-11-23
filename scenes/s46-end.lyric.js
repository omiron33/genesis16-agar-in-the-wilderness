// The words of s46-end, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/s46-end.js';
import { layer, standing, lying, inView, gauge, titleCard, ease } from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {
  lines: [],
  plane: (from) => standing(inView(from, 0, 0.2, 40), from, 0.9, 3),
  gauge: false,
  extra: (ctx, t, H) => { titleCard(ctx, H, ease.inOut3((t - P.to + 14) / 1.4), ease.inOut3((t - P.to + 13.4) / 2.0), 1 - ease.inOut3((t - P.to + 2.4) / 1.6)); },
});
