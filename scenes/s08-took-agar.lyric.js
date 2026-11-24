// The words of s08-took-agar, on a plane that travels with its camera.
import scene from '/song/scenes/s08-took-agar.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["Sara took Agar", "and gave her to Abram"], sy: -0.66, sx: 0, frac: 0.62, aspect: 2.6, shade: 0.45, ink: '243, 235, 222' });
