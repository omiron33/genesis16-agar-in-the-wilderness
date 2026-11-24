// 13 · Noon, hard and white: the camp with short black shadows; the wind lifts dust between the tents.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-20, 1.6, 14], "target": [0, 1.3, -3], "fov": 36};
const B = {"pos": [-16, 1.6, 15], "target": [0, 1.4, -3], "fov": 36};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's13-your-fault', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.4, uDust: 1.0, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.1606, 0.8829, -0.4412], uSunCol: [24.0, 24.0, 24.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
