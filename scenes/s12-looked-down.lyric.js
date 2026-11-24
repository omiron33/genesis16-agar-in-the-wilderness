// The words of s12-looked-down, on a plane that travels with its camera.
import scene from '/song/scenes/s12-looked-down.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["she looked down"], sy: -0.74, sx: 0, frac: 0.6, aspect: 3, shade: 0.5, ink: '243, 235, 222' });
