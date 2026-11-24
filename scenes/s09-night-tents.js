// Night: the lamp in the small tent flares, shrinks and goes out; the fire before it sinks to embers. Far off, Abram’s lamp burns on.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["Jar", 12.0, -2.6, 0.4, 1.0], ["Jar", 12.5, -2.2, 1.0, 0.75], ["Cushion", 10.9, -5.6, 0.3], ["Tripod", 10.3, -2.4, 0.5, 1.0, "4"]];
const LINES = [[[12.2, 2.0, -4.4], [14.8, 2.0, -5.4], true, 0.012]];
const LAMPS = [[9.0, 0.5, -8.0, 4.5], [-11.6, 0.6, -4.0, 4.0], [9.4, 0.4, -2.6, 2.2]];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const C0 = cloth({ a: [12.5, 2.0, -4.5], b: [14.4, 2.0, -5.25], h: 1.45, t0: P.from - 2.5, seed: 1, wind: (t) => [0.4 * br(t), 0, 0.5 * br(t + 2)] });
  const camera = rig({ from: P.from, to: P.to, path: [[17.4, 1.5, 0.6], [15.6, 1.35, 0.0], [13.4, 1.3, 0.0]], look: [[10, 1.2, -7.5], [9.2, 1.2, -7], [7.6, 1.2, -6]], fov: 40, enter: 'moving', exit: 'moving', handheld: 0.18 });
  return {
    name: 's09-night-tents', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0, uMesaAz: 3.0, uMie: 1.0, uDust: 0.3, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [4.6, 5.4, 7.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3.4 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS); u.uFireP.value.splice(0, 4, 9.4, 0.1, -2.6, 0.42); u.uFireN.value = 1; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5); putCloth(u, 0, C0, t); u.uClN.value = 1;
      { const f = t < 53.5 ? 1 : t < 53.9 ? 1 + 0.9 * Math.sin((t - 53.5) / 0.4 * Math.PI * 0.5) : Math.max(0.001, 1.9 * Math.exp(-5.5 * (t - 53.9))); u.uLI.value[0] = 4.5 * f; }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 2.2 }),
  };
};
