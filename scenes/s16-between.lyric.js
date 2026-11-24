// The words of s16-between, on a plane that travels with its camera.
import scene from '/song/scenes/s16-between.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["between you and me"], sy: 0.7, sx: 0, frac: 0.56, aspect: 3, shade: 0.3, ink: '44, 30, 20' });
