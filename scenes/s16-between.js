// The red cloth and the indigo face each other across the fire; the wind takes the smoke to one, then to the other.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0, 7.2, 0.4], ["Rug", -2.6, 8.2, 0.3], ["Rug", 2.7, 8.3, -0.3], ["Jar", -4.4, 8.2, 0.4, 1.1], ["Jar", 4.6, 8.0, 1.0, 1.0], ["Cushion", -1.5, 9.4, 0.4], ["Cushion", 1.7, 9.5, -0.4], ["Quern", 4.0, 9.6, 0.5]];
const LINES = [[[-4.4, 2.15, 6.9], [-1.7, 2.15, 6.7], true, 0.012], [[1.7, 2.15, 6.7], [4.4, 2.15, 6.9], true, 0.012]];
const LAMPS = [null, [0, 0.5, 7.2, 1.5]];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [2.1, 2.13, 6.73], b: [3.9, 2.13, 6.87], h: 1.45, t0: P.from - 2.5, seed: 1, wind: (t) => [0.6 * br(t) + 7 * g(t, 88.5, 0.3, 0.5, 0.6) - 7.5 * g(t, 89.8, 0.3, 0.5, 0.6) + 5.0 * g(t, 91.6, 0.25, 0.7, 0.9), 0, 0.5 * br(t + 2)] });
  const C1 = cloth({ a: [-3.9, 2.13, 6.87], b: [-2.1, 2.13, 6.73], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [0.6 * br(t) + 7 * g(t, 88.4, 0.3, 0.5, 0.6) - 7.5 * g(t, 89.9, 0.3, 0.5, 0.6) - 4.8 * g(t, 91.5, 0.25, 0.7, 0.9), 0, 0.5 * br(t + 7)] });
  const camera = rig({ from: P.from, to: P.to, path: [[-3.4, 1.2, 12.8], [0, 1.05, 12.2], [3.4, 1.25, 12.8]], look: [[-0.4, 1.25, 6.8], [0, 1.25, 6.8], [0.4, 1.25, 6.8]], fov: 40, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's16-between', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.5, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.5329, 0.5592, -0.6351], uSunCol: [26, 26, 26], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0, 0.2, 7.2, 0.9); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2;
      { const wx = (q) => 11 * g(q, 88.5, 0.3, 0.7, 0.6) - 12 * g(q, 89.9, 0.3, 0.7, 0.6); u.uSmk.value.set(follow(wx, t, 0.35) + 0.6 * br(t), 0, 0.4); }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
