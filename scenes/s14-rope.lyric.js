// The words of s14-rope, on a plane that travels with its camera.
import scene from '/song/scenes/s14-rope.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["I gave my maid to you"], sy: -0.8, sx: 0, frac: 0.6, aspect: 3, shade: 0.5, ink: '243, 235, 222' });
