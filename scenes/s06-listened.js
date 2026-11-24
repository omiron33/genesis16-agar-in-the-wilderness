// Evening sky: Abram’s staff leans on one post; it trembles, lifts off, and falls across to lean on the other, where the red cloth hangs; it knocks, and rebounds once.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Staff", 7.5, 3.6, 0.0, 1.15, "0"], ["Jar", 5.9, 4.6, 0.4, 1.0], ["Basket", 6.3, 5.2, 0.0], ["Cushion", 8.6, 5.0, 0.3], ["Wood", 9.8, 4.4, 0.7]];
const LINES = [[[6.75, 2.0, 3.55], [6.75, 1.99, 3.5], true, 0.0], [[8.3, 2.0, 3.55], [10.6, 2.0, 3.3], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [8.5, 1.985, 3.53], b: [10.2, 1.985, 3.34], h: 1.3, t0: P.from - 2.5, seed: 4, wind: (t) => [-1.0 * br(t) - 3.0 * g(t, 37.6, 0.4, 0.3, 1.0), 0, 0.8 * br(t + 4)] });
  const camera = rig({ from: P.from, to: P.to, path: [[6.0, 0.55, 8.6], [7.0, 0.6, 8.0], [7.9, 0.72, 7.7]], look: [[7.6, 1.2, 3.6], [7.8, 1.2, 3.6], [8.0, 1.2, 3.6]], fov: 38, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's06-listened', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.9345, 0.1045, 0.3401], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); putCloth(u, 0, C0, t); u.uClN.value = 1; u.uClOwn.value.set(1, 1, 0);
      { let a = 0.36; if (t > 37.45) a += 0.018 * Math.sin((t - 37.45) * 26) * g(t, 37.45, 0.15, 0.2, 0.1); const k = Math.min(1, Math.max(0, (t - 37.8) / 0.72)); a -= 0.80 * k * k * (1.6 - 0.6 * k); if (t > 38.52) a += 0.075 * Math.abs(Math.sin(7.5 * (t - 38.52))) * Math.exp(-3.6 * (t - 38.52)); u.uA.value[0] = a; }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.35 }),
  };
};
