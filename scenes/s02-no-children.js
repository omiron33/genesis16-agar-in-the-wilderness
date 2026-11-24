// An empty cradle hangs in the mouth of the great tent, still swinging; it slows, and stops.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Cradle", 0.1, 1.7, 0.15, 1.0, "0", 0.35], ["Rug", 0.1, 1.9, 0.0], ["Cushion", -1.7, 2.6, 0.4], ["Cushion", 2.0, 2.9, -0.6], ["Jar", -2.9, 3.0, 0.4, 1.0], ["Jar", 3.1, 3.2, 1.4, 0.8]];
const LINES = [[[-3.4, 1.9, 1.7], [3.4, 1.9, 1.7], false, 0.03]];
const LAMPS = [[-1.3, 0.55, 0.7, 3.6]];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const camera = rig({ from: P.from, to: P.to, path: [[3.0, 1.15, 6.6], [2.2, 1.05, 5.7], [1.35, 1.0, 5.0]], look: [[0.1, 0.95, 1.6], [0.1, 0.95, 1.6], [0.15, 0.85, 1.6]], fov: [38, 33], enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's02-no-children', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.8471, 0.2079, 0.4891], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS);
      u.uA.value[0] = 0.5 * Math.exp(-0.28 * Math.max(0, t - P.from)) * Math.sin(2 * Math.PI * 0.46 * (t - P.from) + 1.2) * (1 - 0.92 * ease.inOut3((t - 14.2) / 1.5));
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
