// 19 · The desert: a single line of footprints climbs the long back of a dune into the glare.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [0.8, 1.5, 6], "target": [0, 3.0, -30], "fov": 44};
const B = {"pos": [0.6, 1.9, 4], "target": [0, 3.5, -34], "fov": 44};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's19-flight', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 2.6, uDust: 1.1, uDustH: 18, uFlatR: 4, uWind: [1.0, 0.25], uSunDir: [0.3319, 0.2419, -0.9118], uSunCol: [30.0, 30.0, 30.0], uFlat: [0, 0, 0], uSteps: [0, 2.5, 0, 0], uStepsN: 40, uStepsDir: 3.14159 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
