// Ten years on one arc round the camp: the sun swings over again and again, and beside the tent a palm grows year by year.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Pot", 0.4, 5.2, 0.4], ["Jar", -2.6, 3.7, 0.3, 1.15], ["Jar", -3.05, 4.1, 1.2, 0.9], ["Jar", -2.3, 4.25, 2.2, 0.7], ["Quern", 2.0, 5.9, 0.8, 1.0, "3"], ["Cushion", -0.9, 3.5, 0.2], ["Cushion", 0.9, 3.6, -0.5], ["Rug", -0.1, 3.3, 0.05], ["Bag", 3.1, 4.2, -0.6], ["Loom", 5.7, 4.5, -0.7], ["Wood", 1.6, 4.4, 0.7], ["Basket", -1.5, 4.5, 0.0], ["Palm", -19, -14, 0.4], ["Palm", -22.5, -10, 2.0, 0.85], ["Palm", -17.5, -18, 4.0, 1.1], ["Grow", 7.2, 7.4, 0.5, 1.0], ["Jar", 5.6, 8.8, 0.2, "11"], ["Jar", 6.1, 8.3, 1.0, "12"], ["Jar", 5.2, 9.4, 2.0, "13"], ["Fold", -9, 12, 0.6]];
const LINES = [];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const camera = rig({ from: P.from, to: P.to, path: [[-13, 5.0, 19], [-3.5, 3.6, 20.5], [7.5, 3.0, 18.5]], look: [[1, 1.6, 2], [2.2, 1.8, 3.5], [3.6, 2.0, 4.5]], fov: 40, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's07-ten-years', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.7912, 0.4067, -0.4568], uSunCol: [30.0, 30.0, 30.0] },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 0.4, 0.15, 5.2, 0.9); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5);
      { const x2 = (t - P.from) / (P.to - P.from - 0.5); let s = 0.14, st = 0; for (let i = 1; i <= 10; i++) { const ti = P.from + 0.2 + (i - 1) * (P.to - P.from - 0.9) / 10; const q = spring(t, ti, { freq: 3.4, damping: 0.5 }); s += 0.058 * q; const d = t - ti; if (d > 0) st += 0.10 * Math.exp(-7 * d) * Math.sin(20 * d); st -= 0.05 * g(t, ti - 0.1, 0.09, 0.0, 0.05); }
      u.uA.value[28] = s; u.uA.value[29] = st; u.uA.value[11] = spring(t, P.from + 1.0, { freq: 2.6 }); u.uA.value[12] = 0.85 * spring(t, P.from + 1.9, { freq: 2.6 }); u.uA.value[13] = 0.75 * spring(t, P.from + 2.7, { freq: 2.6 }); const a = (t - P.from) * 2.4, sn = Math.sin(a); u.uSunDir.value.set(-0.75 * Math.cos(a), 0.22 + 0.45 * sn * sn, 0.55); }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
