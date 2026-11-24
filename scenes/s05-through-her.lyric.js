// The words of s05-through-her, on a plane that travels with its camera.
import scene from '/song/scenes/s05-through-her.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["so I may have children"], sy: -0.74, sx: 0, frac: 0.6, aspect: 3, shade: 0.45, ink: '243, 235, 222' });
