// 06 · Evening: close on the great tent as a lamp is lit inside; its light comes through the seams of the cloth.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-9.0, 1.0, 3.0], "target": [-3.6, 1.15, -0.4], "fov": 36};
const B = {"pos": [-8.0, 1.0, 2.4], "target": [-3.6, 1.2, -0.5], "fov": 36};
const LAMPS = [[-2.6, 0.6, -0.6, 3.0]];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's06-listened', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.9952, 0.0436, -0.0871], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uAperture: 0.01, uFocus: 2.6 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uLI.value[0] = 3.0 * ease.inOut3((t - P.from - 0.6) / 1.0);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.4 }),
  };
};
