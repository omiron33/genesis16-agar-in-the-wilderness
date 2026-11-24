// Low through the camp, past the water skin on its tripod and the jars, to the fire; a gust crosses and everything answers it in turn.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Cushion", 0.9, 3.6, -0.5], ["Rug", -0.1, 3.3, 0.05], ["Bag", 3.1, 4.2, -0.6], ["Loom", 5.7, 4.5, -0.7], ["Wood", 1.6, 4.4, 0.7], ["Basket", -1.5, 4.5, 0.0], ["Tripod", -4.4, 6.2, 0.3, 1.0, "4"], ["Jar", -5.9, 7.6, 0.2, 1.1], ["Jar", -6.4, 7.2, 1.0, 0.8], ["Fold", -15, -2, 0.6], ["Palm", -19, -14, 0.4], ["Palm", -22.5, -10, 2.0, 0.85], ["Palm", -17.5, -18, 4.0, 1.1]];
const LINES = [[[3.7, 1.95, 2.6], [6.3, 1.95, 3.5], true, 0.012]];
const LAMPS = [null, [0.4, 0.5, 5.2, 2.0]];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [4.0, 1.95, 2.7], b: [5.9, 1.95, 3.4], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [1.2 * br(t) + 5 * g(t, 9.2, 0.5, 0.5, 1.2), 0, 1.2 + 2 * g(t, 9.2, 0.5, 0.5, 1.2)] });
  const camera = rig({ from: P.from, to: P.to, path: [[-8.6, 1.0, 11.0], [-5.0, 0.8, 8.9], [-1.6, 1.0, 8.6]], look: [[-2.5, 0.9, 3.5], [0.2, 0.9, 3.2], [2.4, 1.1, 1.8]], fov: 42, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's01-camp', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.9482, 0.1908, 0.2541], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 1.0); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); u.uClN.value = 1; u.uClOwn.value.set(1, 1, 0);
      u.uA.value[4] = 0.06 * Math.sin(t * 3.1) + 0.42 * ring(t, 8.5, 0.55, 0.45); u.uSmk.value.set(0.7 + 7 * follow((q) => g(q, 8.9, 0.4, 0.4, 1.0), t, 0.3), 0, 0.5); u.uFlap.value = 1 + 2.5 * g(t, 9.3, 0.4, 0.6, 1.2);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
