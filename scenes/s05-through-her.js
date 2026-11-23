// 05 · Close and low on the indigo veil lifting on its line, the camp soft behind it.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [16.2, 0.95, -7.9], "target": [14.6, 1.0, -9.4], "fov": 40};
const B = {"pos": [15.9, 0.9, -8.2], "target": [14.5, 1.05, -9.4], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's05-through-her', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [0.4908, 0.1908, 0.8501], uSunCol: [30.0, 30.0, 30.0], uCloud: 1, uCloudCov: 0.42, uCloudH: 2400, uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uLineOn: 1, uLine: [14.6, 1.55, -9.4], uLineYaw: 0.9, uVeilOn: 1, uVeil: [14.6, 1.55, -9.4], uVeilYaw: 0.9, uVeilTilt: 0.35, uVeilBlow: 0.8, uAperture: 0.045, uFocus: 2.1 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
