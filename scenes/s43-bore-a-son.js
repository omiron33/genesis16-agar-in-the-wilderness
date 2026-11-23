// 43 · Evening: a fresh line of footprints comes back over the hill to the camp, where the lamps are being lit.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [34, 2.0, 30], "target": [0, 0.6, -2], "fov": 38};
const B = {"pos": [30, 1.8, 26], "target": [0, 0.8, -2], "fov": 38};
const LAMPS = [[0.3, 0.55, 0.6, 2.2], [-10.8, 0.5, -4.2, 1.8], [9.6, 0.45, -8.4, 1.6]];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's43-bore-a-son', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.9952, 0.0436, -0.0871], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uSteps: [30, 24, 0, 0], uStepsN: 34, uStepsDir: -2.25 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.3 }),
  };
};
