// 03 · Apart from the others, the small tent; an indigo veil hangs on a line beside it, lifting in the wind.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [20, 1.1, -1.0], "target": [11.5, 1.2, -8.5], "fov": 34};
const B = {"pos": [18.6, 1.0, -2.2], "target": [11.5, 1.25, -8.5], "fov": 34};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's03-maid', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [0.4908, 0.1908, 0.8501], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400, uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uLineOn: 1, uLine: [14.6, 1.55, -9.4], uLineYaw: 0.9, uVeilOn: 1, uVeil: [14.6, 1.55, -9.4], uVeilYaw: 0.9, uVeilTilt: 0.35, uVeilBlow: 0.5 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
