// The words of s00-title, on a plane that travels with its camera.
import scene from '/song/scenes/s00-title.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: [], sy: 0.42, frac: 0.86, aspect: 3, shade: 0.4, extra: (ctx, t, H) => { titleCard(ctx, H, ease.inOut3((t - P.from - 0.6) / 1.4), ease.inOut3((t - P.from - 1.8) / 2.0), 1 - ease.inOut3((t - P.to + 1.2) / 1.0)); } });
