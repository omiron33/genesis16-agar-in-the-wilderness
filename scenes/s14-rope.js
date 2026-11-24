// Close on one tent peg: the rope lies slack, then each gust draws it tight, the ground cracks and the peg starts up a little more.
import { worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease } from '/song/lib/world4.js';
import { cloth, putCloth } from '/song/lib/cloth.js';
import { grade } from '/song/lib/look.js';
import { rig, spring, anticipate, follow, fractal, weight, move } from '/kit/motion.js';

const PROPS = [["PegRope", 6.3, 5.0, 0.0], ["Bag", 3.4, 4.8, -0.5], ["Jar", 2.4, 4.6, 0.4, 1.0], ["Basket", 4.4, 6.2, 0.0]];
const LINES = [];
const LAMPS = [];
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, { seed: 3, octaves: 3 }) + 0.25 * fractal(t * 1.4, { seed: 8, octaves: 2 });
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  
  const camera = rig({ from: P.from, to: P.to, path: [[7.35, 0.4, 5.75], [7.2, 0.36, 5.55], [7.0, 0.3, 5.5]], look: [[6.2, 0.2, 4.9], [6.18, 0.22, 4.88], [6.15, 0.26, 4.85]], fov: [40, 36], enter: 'moving', exit: 'moving', handheld: 0.06 });
  return {
    name: 's14-rope', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], uLand: 0, uDunes: 0, uMesa: 0.55, uMesaAz: 3.0, uMie: 1.4, uDust: 0.9, uDustH: 25, uFlatR: 18, uWind: [0.8, 0.6], uTentsOn: 1, uCamp: [0, 0, 0], uShrubs: 0, uSunDir: [-0.383, 0.6428, -0.6634], uSunCol: [26, 26, 26], uAperture: 0.006, uFocus: 1.15 },
    camera,
    update(t, u) {
      setLamps(u, LAMPS);
      { let y = 0, sl = 0.30; for (const [a, d] of [[77.15, 0.022], [78.25, 0.03], [79.25, 0.034], [80.25, 0.045]]) { y += d * spring(t, a + 0.1, { freq: 5, damping: 0.4 }) - 0.010 * g(t, a - 0.08, 0.1, 0.02, 0.06); sl -= 0.30 * g(t, a - 0.12, 0.14, 0.3, 0.5); } u.uA.value[5] = Math.max(0, y); u.uA.value[6] = Math.max(0.0, sl) + 0.012 * Math.sin(t * 31) * Math.max(0, 1 - sl / 0.1); u.uFlap.value = 1.5 + 2.5 * (g(t, 77.1, 0.2, 0.2, 0.5) + g(t, 78.2, 0.2, 0.2, 0.5) + g(t, 79.2, 0.2, 0.2, 0.5) + g(t, 80.2, 0.2, 0.4, 0.8)); }
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
