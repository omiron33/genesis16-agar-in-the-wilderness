// 17 · Abram's tent: the camera draws back from its dark doorway.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-8.0, 1.0, 1.2], "target": [-11, 0.9, -5], "fov": 34};
const B = {"pos": [-5.5, 1.1, 4.0], "target": [-11, 0.9, -5], "fov": 34};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's17-in-your-hands', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.7912, 0.4067, -0.4568], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
