// Against the low sun: the indigo veil lifts, its shadow falls across the empty cradle, and the cradle begins to rock.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Cradle", 4.2, 6.6, 0.1, 1.0, "0", 0.28], ["Frame", 4.2, 6.6, 0.1], ["Rug", 4.2, 6.6, 0.1], ["Cushion", 5.6, 7.2, 0.5], ["Jar", 2.6, 7.0, 0.4, 1.1], ["Jar", 2.2, 7.5, 1.3, 0.8], ["Bag", 6.1, 6.0, -0.5]];
const LINES = [[[2.6, 2.35, 4.4], [5.8, 2.35, 4.2], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [3.0, 2.35, 4.38], b: [5.3, 2.35, 4.23], h: 1.75, t0: P.from - 2.5, seed: 1, wind: (t) => [0.7 * br(t), 0, 0.5 * br(t + 2) - 1.8 * g(t, 31.0, 0.5, 0.1, 0.3) + 5.2 * g(t, 31.7, 0.4, 1.6, 2.4)], gather: 1.3 });
  const camera = rig({ from: P.from, to: P.to, path: [[8.2, 1.0, 10.6], [7.0, 0.95, 10.0], [5.6, 1.05, 9.8]], look: [[4.6, 1.15, 5.6], [4.4, 1.15, 5.8], [4.2, 1.1, 6.0]], fov: [38, 32], enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's05-through-her', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.2985, 0.2588, -0.9187], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); putCloth(u, 0, C0, t); u.uClN.value = 1;
      { const x = Math.max(0, t - 32.3); u.uA.value[0] = -0.05 * g(t, 32.0, 0.25, 0.05, 0.2) + 0.34 * (1 - Math.exp(-1.4 * x)) * Math.exp(-0.16 * x) * Math.sin(2 * Math.PI * 0.5 * x); }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
