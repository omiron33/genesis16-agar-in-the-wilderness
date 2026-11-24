// The words of s04-kept-me, on a plane that travels with its camera.
import scene from '/song/scenes/s04-kept-me.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["Sara said to Abram", "from having children"], sy: -0.68, sx: 0, frac: 0.6, aspect: 2.6, shade: 0.5, ink: '243, 235, 222' });
