// The words of s13-your-fault, on a plane that travels with its camera.
import scene from '/song/scenes/s13-your-fault.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["Sara said to Abram"], sy: -0.74, sx: 0, frac: 0.62, aspect: 3, shade: 0.45, ink: '243, 235, 222' });
