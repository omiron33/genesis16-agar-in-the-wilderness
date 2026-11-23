// 40 · The well-head of stones beside the spring, in the long morning light.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-11, 1.0, 6.5], "target": [-7.5, 0.4, 3], "fov": 36};
const B = {"pos": [-10.2, 1.1, 5.6], "target": [-7.5, 0.4, 3], "fov": 36};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's40-the-well', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 0.3, uDust: 0.7, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 3, uSunDir: [0.9131, 0.3746, 0.161], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.8, uWellOn: 1, uWellP: [-7.5, 0, 3], uEyeC: [4861.6, 865.2], uEyeYaw: 1.7453, uEyeR: [2600.0, 1500.0], uCloudH: 2000.0, uEye: 1.0, uRays: 1.2 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
