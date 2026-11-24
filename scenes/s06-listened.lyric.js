// The words of s06-listened, on a plane that travels with its camera.
import scene from '/song/scenes/s06-listened.js';
import { layer, gauge, titleCard, ease } from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), { lines: ["Abram listened to Sara"], sy: -0.76, sx: 0, frac: 0.56, aspect: 3, shade: 0.3, ink: '243, 235, 222' });
