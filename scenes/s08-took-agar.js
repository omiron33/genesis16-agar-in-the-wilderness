// The indigo veil is drawn along a rope, away from the red cloth, across the camp to the staff at Abram’s side, and swings there.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Staff", -9.4, 2.9, 0.4, 1.05], ["Cushion", -8.2, 3.8, 0.4], ["Jar", -10.0, 3.9, 0.4, 1.1], ["Jar", -7.2, 2.2, 1.0, 0.8], ["Fold", -16, -1, 0.6], ["Palm", -19, -14, 0.4], ["Palm", -22.5, -10, 2.0, 0.85], ["Palm", -17.5, -18, 4.0, 1.1]];
const LINES = [[[4.6, 2.15, 6.9], [-9.0, 2.15, 3.1], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [2.2, 2.1, 6.2], b: [0.4, 2.1, 5.7], h: 1.45, t0: P.from - 2.5, seed: 1, wind: (t) => [0.6 * br(t), 0, 0.6 * br(t + 2)], pinAt: (w, t) => { const A = [4.6, 2.1, 6.9], B = [-9.0, 2.1, 3.1], k = 0.2 + 0.2 * anticipate(t, 45.3, { lead: 0.4, back: 0.15, dur: 1.5, land: weight.normal }) + 0.42 * anticipate(t, 48.75, { lead: 0.4, back: 0.07, dur: 2.0, land: weight.heavy }), s = k + (0.5 - w) * -0.125 * (1 - 0.35 * g(t, 48.7, 0.3, 0.8, 0.5)); return A.map((v, q) => v + (B[q] - v) * s); } });
  const C1 = cloth({ a: [4.3, 2.12, 6.82], b: [2.9, 2.12, 6.42], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [0.8 * br(t) - 3.6 * g(t, 45.2, 0.3, 0.4, 0.9) - 3.0 * g(t, 48.8, 0.3, 0.4, 1.0), 0, 0.5 * br(t + 6)] });
  const camera = (() => { const c = rig({ from: P.from, to: P.to, path: [[4.6, 1.35, 11.8], [0.2, 1.2, 10.8], [-4.6, 1.3, 9.6]], look: [[1.6, 1.4, 5], [-1.6, 1.4, 4.2], [-6, 1.4, 3]], fov: 38, enter: 'moving', exit: 'moving', handheld: 0.18 }); return (t) => { const q = c(t), m = follow((x) => C0.centre(Math.max(P.from, x)), t, 0.22); return { ...q, target: q.target.map((v, i) => v + ([m[0], 1.4, m[2]][i] - v) * 0.75) }; }; })();
  return {
    name: 's08-took-agar', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.9448, 0.2079, 0.2532], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 0.8); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2;
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
