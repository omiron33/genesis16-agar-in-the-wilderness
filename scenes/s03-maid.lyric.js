// The words of s03-maid, on a plane that travels with its camera.
import scene from '/song/scenes/s03-maid.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["She had an Egyptian maid"], sy: -0.7, sx: 0, frac: 0.6, aspect: 3, shade: 0.45, ink: '243, 235, 222' });
