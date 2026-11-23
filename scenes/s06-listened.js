// 06 · Evening comes on: at the door of the great tent a lamp is lit.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [5, 0.7, 11], "target": [0, 0.9, 0], "fov": 34};
const B = {"pos": [3.5, 0.65, 9], "target": [0, 0.95, 0], "fov": 34};
const LAMPS = [[0.3, 0.55, 0.6, 2.2]];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's06-listened', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.9952, 0.0436, -0.0871], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uLI.value[0] = 2.2 * ease.inOut3((t - P.from - 0.8) / 1.2);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.3 }),
  };
};
