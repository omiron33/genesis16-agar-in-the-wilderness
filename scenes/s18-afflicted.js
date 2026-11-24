// The red cloth gusts and the indigo strains on its line; its pins go one after another, then it tears free and flies on an arc into the open country, and the camera goes after it.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Jar", -5.2, 9.2, 0.4, 1.15], ["Jar", -4.8, 9.7, 1.0, 0.8], ["Cushion", -1.0, 10.4, 0.4], ["Quern", 3.4, 9.9, 0.5], ["Fold", 17, 2, 0.6], ["Palm", 33, -15, 0.4], ["Palm", 37, -18, 2.0, 0.85]];
const LINES = [[[-4.6, 2.15, 8.6], [-2.2, 2.15, 8.5], true, 0.012], [[-0.8, 2.2, 8.8], [1.7, 2.2, 8.6], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  const gw = (t) => 2.2 * rise(t, 101.2, 1.2) + 2.4 * rise(t, 103.2, 1.2) + 4.6 * g(t, 102.3, 0.2, 0.2, 0.5) + 5 * g(t, 103.6, 0.2, 0.2, 0.5) + 5.5 * g(t, 104.8, 0.25, 0.2, 0.4);
const C0 = cloth({ a: [-0.45, 2.18, 8.77], b: [1.35, 2.18, 8.63], h: 1.5, t0: P.from - 2.5, seed: 1, release: { 0: 102.5, 1: 102.55, 2: 103.8, 3: 103.83, 4: 103.88, 5: 105.0, 6: 105.04, 7: 105.08, 8: 105.12, 9: 105.7, 10: 105.73, 11: 105.78 }, flutter: (t) => 10 * rise(t, 102.4, 0.6) + 34 * rise(t, 105.7, 0.4), wind: (t) => [1.2 * br(t) + 1.25 * gw(t) + 9.0 * rise(t, 105.6, 0.4), 11.0 * rise(t, 105.65, 0.4) * (1 - 0.45 * rise(t, 106.9, 1.2)), 0.6 * br(t + 3) - 6.0 * rise(t, 105.9, 0.8)] });
const C1 = cloth({ a: [-4.2, 2.13, 8.58], b: [-2.6, 2.13, 8.52], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [1.0 * br(t) + 1.15 * gw(t) * (1 - rise(t, 105.9, 1.0)), 0, 0.6 * br(t + 5)] });
  const camera = (() => { const c = rig({ from: P.from, to: P.to, path: [[-2.6, 1.15, 14.2], [-0.4, 1.1, 13.6], [3.2, 1.5, 13.2]], look: [[-0.6, 1.4, 8.8], [0, 1.45, 8.6], [0.4, 1.5, 8.4]], fov: (t) => 40 - 21 * ease.inOut3((t - 106.2) / 1.9), enter: 'moving', exit: 'moving', handheld: 0.15 }); return (t) => { const q = c(t), k = ease.inOut3((t - 105.6) / 1.0), m = follow((x) => C0.centre(Math.max(P.from, x)), t, 0.1); return { ...q, target: q.target.map((v, i) => v + (m[i] - v) * k) }; }; })();
  return {
    name: 's18-afflicted', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 2.0, uDust: 0.9, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.5567, 0.5, -0.6634], uSunCol: [28, 28, 28] },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 0.9); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5);
      putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2; u.uFlap.value = 1 + 0.5 * gw(t); u.uSmk.value.set(1.0 + 0.6 * follow(gw, t, 0.4), 0, 0.3);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
