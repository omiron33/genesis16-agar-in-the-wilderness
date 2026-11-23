// The film's look: one palette that builds across the song, one signal colour, and the grade.
//   the household (dusty amber afternoon)  ->  the quarrel (hard white noon)  ->  the flight (burnt
//   heat)  ->  the spring at dusk (cool teal)  ->  the promise under the stars (indigo)  ->  El Roi,
//   the God who sees (dawn gold)  ->  the return and the child (evening amber into night)
// The signal colour is the light that sees: the only thing that glows (the angel's light, the eye
// opening in the cloud, and the angel's own words).
import { keys, ease, clamp01 } from '/engine.js';

export const SIGNAL = '255, 214, 150';
export const BONE = '243, 235, 222';

// 0 household .. 1 quarrel .. 2 flight .. 3 spring .. 4 promise .. 5 El Roi .. 6 return
export function act(t) {
  return keys(t, [[0, 0], [54, 0], [57, 1], [100, 1], [103, 2], [117, 2], [121, 3], [154, 3], [158, 4], [200, 4], [204, 5], [235, 5], [238, 6], [280, 6]], (x) => x);
}
const GAINS = [
  [1.04, 0.99, 0.92],   // dusty amber
  [1.0, 1.0, 0.98],     // hard white
  [1.07, 0.96, 0.88],   // burnt heat
  [0.96, 0.98, 1.04],   // cool teal
  [0.93, 0.96, 1.07],   // indigo
  [1.05, 1.0, 0.93],    // dawn gold
  [1.04, 0.98, 0.93],   // evening amber
];
export function grade(t, extra = {}) {
  const a = act(t), i = Math.min(5, Math.floor(a)), f = a - i;
  const g = GAINS[i].map((v, k) => v + (GAINS[i + 1][k] - v) * f);
  return {
    exposure: 1, saturation: 0.92, contrast: 1.06,
    lift: [0.004, 0.005, 0.008], gain: g,
    grain: 0.028, vignette: 0.45, ca: 0.25, bloom: 0.09, threshold: 1.0,
    ...extra,
  };
}
export { keys, ease, clamp01 };
