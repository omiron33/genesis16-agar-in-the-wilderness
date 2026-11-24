// Sunrise, close to the ground: the soil lifts, and a green shoot pushes through, bent, then straightens and opens its two leaves.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Sprout", 0, 12, 0.3, 1.0, "0"], ["Jar", -2.6, 8.2, 0.4, 1.1], ["Jar", -2.1, 8.6, 1.0, 0.8]];
const LINES = [];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const camera = rig({ from: P.from, to: P.to, path: [[0.95, 0.17, 13.5], [0.6, 0.2, 13.3], [0.3, 0.24, 13.15]], look: [[0, 0.22, 12], [0, 0.23, 12], [0, 0.24, 12]], fov: [40, 34], enter: 'moving', exit: 'moving', handheld: 0.05 });
  return {
    name: 's10-conceived', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.0693, 0.1132, -0.9912], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS);
      u.uA.value[0] = 0.10 * ease.inOut3((t - 56.2) / 1.0) + 0.40 * move(t, 57.1, 58.5, weight.heavy) + 0.5 * spring(t, 58.35, { freq: 0.62, damping: 0.45 });
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
