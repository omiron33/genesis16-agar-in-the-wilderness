// 20 · High above: the tiny line of footprints across an endless field of dunes; heat haze.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [8, 26, 30], "target": [0, 16, -90], "fov": 44};
const B = {"pos": [5, 27, 24], "target": [0, 17, -100], "fov": 44};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's20-wilderness', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 2.6, uDust: 1.1, uDustH: 18, uFlatR: 4, uWind: [1.0, 0.25], uSunDir: [0.3288, 0.2756, -0.9033], uSunCol: [30.0, 30.0, 30.0], uFlat: [0, 0, 0], uSteps: [0, 20, 0, 0], uStepsN: 120, uStepsDir: 3.14159 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
