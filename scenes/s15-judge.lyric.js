// The words of s15-judge, on a plane that travels with its camera.
import scene from '/song/scenes/s15-judge.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["I am dishonored"], sy: 0.8, sx: -0.12, frac: 0.6, aspect: 3, shade: 0.3, ink: '44, 30, 20' });
