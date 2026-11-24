// From behind the raised indigo, down past its flicking hem, on the red cloth below, which shrinks back on its line.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Basket", 1.6, 8.6, 0.0], ["Wood", 5.4, 7.4, 0.5], ["Rug", 3.4, 8.8, 0.1]];
const LINES = [[[2.2, 4.1, 10.9], [5.4, 4.1, 10.6], true, 0.012], [[2.2, 1.65, 7.5], [4.9, 1.65, 7.3], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [2.6, 4.085, 10.86], b: [5.0, 4.085, 10.64], h: 1.35, t0: P.from - 2.5, seed: 1, wind: (t) => [1.2 * br(t) - 3.0 * g(t, 64.6, 0.3, 0.4, 0.8), 0.3 + 3.6 * g(t, 65.1, 0.25, 0.9, 1.2), -1.0 - 6.0 * g(t, 65.1, 0.25, 0.9, 1.2)] });
  const C1 = cloth({ a: [2.6, 1.635, 7.47], b: [4.5, 1.635, 7.33], h: 1.15, t0: P.from - 2.5, seed: 4, wind: (t) => [0.4 * br(t), 0, 0.5 * br(t) + 2.4 * g(t, 64.8, 0.3, 0.1, 0.2) - 8.5 * g(t, 65.3, 0.22, 1.0, 1.8)], gather: 1.35 });
  const camera = rig({ from: P.from, to: P.to, path: [[6.6, 4.6, 15.0], [5.4, 4.2, 14.0], [4.6, 3.8, 13.4]], look: [[3.7, 2.2, 8.4], [3.6, 2.15, 8.4], [3.6, 2.1, 8.4]], fov: 40, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's12-looked-down', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.4698, 0.342, -0.8138], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 0.9); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2;
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
