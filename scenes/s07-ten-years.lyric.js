// The words of s07-ten-years, on a plane that travels with its camera.
import scene from '/song/scenes/s07-ten-years.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["After Abram had lived"], sy: -0.64, sx: 0, frac: 0.62, aspect: 3, shade: 0.3, ink: '44, 30, 20', extra: (ctx, t, H) => { const y = Math.max(1, Math.min(10, Math.ceil(10 * (t - P.from - 0.1) / (P.to - P.from - 0.7)))); gauge(ctx, `YEAR ${y}`, 1920, H * 0.9, { size: 64, alpha: 0.9 }); } });
