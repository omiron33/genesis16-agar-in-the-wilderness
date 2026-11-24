// The indigo veil, caught at its four corners, slackens, then fills and stays full, like a sail.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Jar", 3.6, 9.0, 0.4, 1.1], ["Cushion", -1.6, 10.8, 0.3], ["Basket", 3.9, 9.9, 0.0], ["Palm", -17, -8, 0.5], ["Palm", -20, -12, 2.2, 0.85]];
const LINES = [[[-1.2, 2.75, 9.2], [2.2, 2.75, 9.2], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [-0.8, 2.735, 9.2], b: [1.8, 2.735, 9.2], h: 2.0, t0: P.from - 2.5, seed: 1, wind: (t) => [0.3 * br(t), 0, 0.2 * br(t) - 1.4 * g(t, 62.0, 0.4, 0.1, 0.25) + 7.5 * rise(t, 62.5, 1.0)], gather: 1.3, turb: 0.15, fold: 0.1, more: [[0, 0.35, -0.8], [11, 0.65, 1.8]].map(([i, w, x]) => ({ i, j: 13, at: (t) => { const k = anticipate(t, 62.6, { lead: 0.4, back: 0.08, dur: 1.0, land: weight.normal }); return [(-0.8 + 2.6 * w) * (1 - k) + x * k, 0.8 + 0.38 * k, 9.2 + 0.15 * k]; } })) });
  const camera = rig({ from: P.from, to: P.to, path: [[6.4, 0.7, 14.6], [5.9, 1.0, 13.2], [5.4, 1.4, 12.0]], look: [[0.6, 1.5, 9.4], [0.7, 1.65, 9.4], [0.8, 1.75, 9.5]], fov: 40, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's11-pregnant', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.3171, 0.3746, -0.8713], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); putCloth(u, 0, C0, t); u.uClN.value = 1;
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
