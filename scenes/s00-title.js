// Over a stone fold and palms, down on an arc to the camp at morning: three columns of smoke lean in the wind, cloth moves on its line.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Cushion", 0.9, 3.6, -0.5], ["Rug", -0.1, 3.3, 0.05], ["Bag", 3.1, 4.2, -0.6], ["Loom", 5.7, 4.5, -0.7], ["Wood", 1.6, 4.4, 0.7], ["Basket", -1.5, 4.5, 0.0], ["Jar", 12.0, -2.6, 0.4, 1.0], ["Jar", 12.5, -2.2, 1.0, 0.75], ["Cushion", 10.9, -5.6, 0.3], ["Tripod", 10.3, -2.4, 0.5, 1.0, "4"], ["Fold", -11, 21, 0.6], ["Palm", -27, 17, 1.0, 1.0], ["Palm", -30, 13, 2.6, 0.85], ["Palm", 21, -15, 3.0, 1.1], ["Palm", 25, -18, 0.6, 0.9]];
const LINES = [[[12.2, 2.0, -4.4], [14.8, 2.0, -5.4], true, 0.012]];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [12.5, 2.0, -4.5], b: [14.4, 2.0, -5.25], h: 1.45, t0: P.from - 2.5, seed: 1, wind: (t) => [2.2 * br(t), 0, 1.6] });
  const camera = rig({ from: P.from, to: P.to, path: [[-34, 9.5, 41], [-19, 5.0, 28], [-5.0, 2.0, 15.6]], look: [[-1, 1, -6], [0, 1.2, -3], [1.2, 1.4, 0]], fov: 36, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's00-title', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.9513, 0.1736, 0.2549], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 1.0); u.uFireP.value.splice(4, 4, -10, 0.1, -0.6, 0.8); u.uFireP.value.splice(8, 4, 11, 0.1, -4.4, 0.7); u.uFireN.value = 3; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); u.uClN.value = 1;
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
