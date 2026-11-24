// A bronze balance against the sun: one pan drops, then the other; slowly the beam comes level as the camera rises into the light.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Balance", 0, 9.5, 0.0, 1.0, "0"], ["Cushion", -2.2, 8.6, 0.4], ["Cushion", 2.3, 8.7, -0.4], ["Rug", 0, 9.5, 0.0], ["Jar", -3.2, 8.2, 0.4, 1.1]];
const LINES = [];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const camera = rig({ from: P.from, to: P.to, path: [[1.7, 0.6, 12.6], [0.9, 1.0, 12.3], [0.15, 1.7, 12.1]], look: [[0, 1.1, 9.5], [0, 1.3, 9.5], [0, 1.65, 9.5]], fov: [40, 36], enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's15-judge', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.0169, 0.2588, -0.9658], uSunCol: [28, 28, 28], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS);
      { const b = (q) => 0.30 * anticipate(q, 82.4, { lead: 0.35, back: 0.15, dur: 0.6, land: weight.heavy }) - 0.56 * spring(q, 83.5, { freq: 0.7, damping: 0.35 }) + 0.26 * spring(q, 85.0, { freq: 0.55, damping: 0.3 }); u.uA.value[0] = b(t); const v = (q) => (b(q + 0.02) - b(q - 0.02)) / 0.04; u.uA.value[30] = follow(v, t, 0.16) * 0.14 + 0.03 * Math.sin(t * 2.6); u.uA.value[31] = follow(v, t, 0.2) * 0.14 + 0.03 * Math.sin(t * 2.4 + 1); }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 0.95 }),
  };
};
