// 37 · El Roi: the cloud opens like an eye in the east, the sun in it; shafts of light fall across the desert onto the spring.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [2, 1.0, 12], "target": [56.786, 13.475999999999999, 21.66], "fov": 62};
const B = {"pos": [2.3, 0.95, 11.8], "target": [57.086, 19.426, 21.46], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's37-sees-me', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 0.3, uDust: 0.7, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 2, uSunDir: [0.9131, 0.3746, 0.161], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.8, uEyeC: [4863.1, 868.1], uEyeYaw: 1.7453, uEyeR: [2600.0, 1500.0], uCloudH: 2000.0, uEye: 0.12, uRays: 1.0 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uEye.value = 0.12 + 0.88 * ease.inOut3((t - P.from - 0.2) / 2.6); u.uRays.value = 1.6 * ease.inOut3((t - P.from - 0.6) / 2.0);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
