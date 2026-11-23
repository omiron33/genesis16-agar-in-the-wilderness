// 14 · Low by the small tent in the hard noon light: its ropes taut in the gusts.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [16.5, 0.4, -3.5], "target": [11, 1.1, -8], "fov": 40};
const B = {"pos": [15.8, 0.4, -4.2], "target": [11, 1.2, -8], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's14-rope', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.4, uDust: 1.0, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.1606, 0.8829, -0.4412], uSunCol: [24.0, 24.0, 24.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
