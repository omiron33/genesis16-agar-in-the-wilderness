// One corner of the indigo is held fast to Abram’s staff. It pulls; on "treat her as you think best" the corner comes away, and the cloth swings across to the red.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Staff", -2.35, 8.9, 0.0, 1.15, "0"], ["Jar", -3.3, 9.4, 0.4, 1.1], ["Cushion", -2.9, 10.2, 0.4], ["Basket", 4.9, 9.2, 0.0], ["Rug", -2.6, 9.6, 0.2], ["Wood", 3.2, 9.4, 0.5]];
const LINES = [[[-0.9, 2.3, 8.7], [1.5, 2.3, 8.5], true, 0.012], [[1.9, 2.1, 8.4], [4.3, 2.1, 8.2], true, 0.012]];
const LAMPS = [null, [0.4, 0.5, 5.2, 1.4]];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  const gw = (t) => 2.6 * g(t, 94.9, 0.4, 0.4, 0.8) + 3.2 * g(t, 96.4, 0.35, 0.5, 0.8);
  const C0 = cloth({ a: [-0.6, 2.285, 8.68], b: [1.2, 2.285, 8.52], h: 1.7, t0: P.from - 2.5, seed: 1, more: [{ i: 0, j: 13, until: 97.75, at: (t) => [-2.3 + 0.03 * gw(t), 1.45, 8.9] }], wind: (t) => [0.6 * br(t) + gw(t) + 7.5 * g(t, 97.6, 0.3, 1.2, 1.6), 0.4 * g(t, 97.6, 0.3, 1.2, 1.6), 0.5 * br(t + 2)] });
  const C1 = cloth({ a: [2.3, 2.085, 8.37], b: [3.9, 2.085, 8.23], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [0.7 * br(t) + 0.8 * gw(t) - 2.0 * g(t, 97.2, 0.3, 0.4, 0.5) + 3.0 * g(t, 98.3, 0.3, 0.8, 1.4), 0, 0.6 * br(t + 5)] });
  const camera = rig({ from: P.from, to: P.to, path: [[-2.6, 1.0, 14.6], [-0.6, 1.1, 14.0], [1.2, 1.3, 13.8]], look: [[0.2, 1.35, 8.6], [0.5, 1.4, 8.5], [0.8, 1.4, 8.4]], fov: 40, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's17-in-your-hands', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.7198, 0.342, 0.604], uSunCol: [28, 28, 28], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 0.8); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5);
      putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2; u.uA.value[0] = -0.05 * gw(t) * 0.25 + 0.10 * (spring(t, 97.78, { freq: 1.6, damping: 0.25 }) - rise(t, 97.78, 0.6)) ;
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
