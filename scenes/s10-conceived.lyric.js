// The words of s10-conceived, on a plane that travels with its camera.
import scene from '/song/scenes/s10-conceived.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["He went in to Agar"], sy: 0.8, sx: 0, frac: 0.56, aspect: 3, shade: 0.3, ink: '44, 30, 20' });
