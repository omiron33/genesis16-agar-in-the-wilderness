// The words of s11-pregnant, on a plane that travels with its camera.
import scene from '/song/scenes/s11-pregnant.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["When she knew"], sy: -0.72, sx: 0, frac: 0.6, aspect: 3, shade: 0.45, ink: '243, 235, 222' });
