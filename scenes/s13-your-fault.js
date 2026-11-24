// Hard noon. The wind drops, the red cloth draws back, then snaps out; the great jar beside the staff rocks, topples and rolls.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Jar", -1.5, 7.0, 0.0, 1.25, "0"], ["Staff", -3.0, 6.4, 0.3, 1.05, 0.12], ["Pot", 2.9, 4.6, 0.4], ["Quern", 4.4, 7.4, 0.8], ["Cushion", -3.8, 6.0, 0.3], ["Cushion", 1.0, 3.5, 0.3], ["Jar", -4.5, 5.0, 1.0, 0.9], ["Bag", 3.1, 4.0, -0.6], ["Rug", -0.1, 3.3, 0.0], ["Basket", -2.4, 7.6, 0.0]];
const LINES = [[[-0.4, 2.15, 6.3], [2.3, 2.15, 6.1], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [0.0, 2.13, 6.27], b: [1.9, 2.13, 6.13], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [0.8 * br(t) + 2.0 * g(t, 69.2, 0.4, 0.4, 1.0) + 2.6 * g(t, 71.9, 0.5, 0.1, 0.2) - 15 * g(t, 72.6, 0.14, 0.3, 1.0), 0, 0.5 * br(t + 5) + 1.4 * g(t, 72.6, 0.16, 0.35, 1.0)] });
  const camera = rig({ from: P.from, to: P.to, path: [[4.2, 1.15, 11.6], [2.6, 1.0, 10.8], [0.6, 0.85, 10.2]], look: [[1.2, 1.2, 6.2], [0.2, 1.0, 6.4], [-1.2, 0.6, 6.6]], fov: [40, 35], enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's13-your-fault', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.4, uDust: 0.8, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.3078, 0.788, -0.5332], uSunCol: [26, 26, 26] },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 2.9, 0.15, 4.6, 0.8); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); u.uClN.value = 1; u.uClOwn.value.set(1, 1, 0);
      { const d = t - 72.78; const rock = t > 72.0 && t < 72.78 ? -0.06 * Math.sin((t - 72.0) / 0.78 * Math.PI * 2) : 0; let fall = 0; if (d > 0) { const x = Math.min(1, d / 0.75); fall = 1.5 * x * x * x; if (d > 0.75) { const q = d - 0.75; fall = 1.5 - 0.22 * Math.abs(Math.sin(8.5 * q)) * Math.exp(-3.4 * q); } } u.uA.value[0] = -rock - fall; }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
