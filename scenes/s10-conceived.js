// 10 · Sunrise behind the small tent: a new day comes up over the hills beyond it.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [6.2, 0.8, -2.6], "target": [13, 1.9, -15], "fov": 36};
const B = {"pos": [6.6, 0.85, -3.3], "target": [13, 2.1, -15], "fov": 36};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's10-conceived', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [0.4973, 0.1045, -0.8613], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uLineOn: 1, uLine: [14.6, 1.55, -9.4], uLineYaw: 0.9, uVeilOn: 1, uVeil: [14.6, 1.55, -9.4], uVeilYaw: 0.9, uVeilTilt: 0.35, uVeilBlow: 0.5 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
