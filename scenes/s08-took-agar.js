// 08 · In the late light, a trail of a woman's footprints in the dust leads from the small tent across to Abram's.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [9.6, 1.25, -5.0], "target": [-6, -0.2, -8.6], "fov": 40};
const B = {"pos": [8.6, 1.2, -5.2], "target": [-6, -0.2, -8.6], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's08-took-agar', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [0.4908, 0.1908, 0.8501], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400, uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uSteps: [8.0, -6.6, 0, 0], uStepsN: 26, uStepsDir: -1.72 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
