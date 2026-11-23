// 19 · Low over the sand: one of her footprints, and the wind already filling it, the trail running on up the dune.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [0.35, 0.6, 4.2], "target": [0.0, 0.0, 2.4], "fov": 40};
const B = {"pos": [0.3, 0.7, 4.0], "target": [0.0, 0.05, 2.0], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's19-flight', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 1.2, uDust: 0.4, uDustH: 18, uFlatR: 4, uWind: [1.0, 0.25], uSunDir: [0.9576, 0.2756, -0.0838], uSunCol: [30.0, 30.0, 30.0], uFlat: [0, 0, 0], uSteps: [0, 2.5, 0, 0], uStepsN: 40, uStepsDir: 3.14159 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uStepsFill.value = 0.75 * ease.inOut3(x(t)); u.uWindT.value = t * 30.0;
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
