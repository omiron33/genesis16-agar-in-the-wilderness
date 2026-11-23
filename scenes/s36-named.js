// 36 · First grey light under a low ceiling of cloud over the spring; the deck glows faintly in the east.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-9, 1.2, 9], "target": [45.786, 9.675999999999998, 18.66], "fov": 54};
const B = {"pos": [-8, 1.1, 8], "target": [46.786, 12.576, 17.66], "fov": 54};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's36-named', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 0.3, uDust: 0.7, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 3, uSunDir: [0.9131, 0.3746, 0.161], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.8, uEyeC: [4863.1, 868.1], uEyeYaw: 1.7453, uEyeR: [2600.0, 1500.0], uCloudH: 2000.0, uEye: 0.0, uRays: 0.0 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uEye.value = 0.12 * ease.inOut3(x(t));
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.2 }),
  };
};
