// The words of s17-in-your-hands, on a plane that travels with its camera.
import scene from '/song/scenes/s17-in-your-hands.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["Abram said to Sara", "Treat her as you think"], sy: -0.7, sx: 0, frac: 0.6, aspect: 2.6, shade: 0.5, ink: '243, 235, 222' });
