// 18 · The wind tears the indigo veil from its line; it tumbles away over the ground towards the open country.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [20, 1.0, -2], "target": [14.6, 1.0, -9], "fov": 40};
const B = {"pos": [22, 1.2, 1], "target": [19, 0.6, -7], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's18-afflicted', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 2.6, uDust: 1.1, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.5567, 0.5, -0.6634], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uLineOn: 1, uLine: [14.6, 1.55, -9.4], uLineYaw: 0.9, uVeilOn: 1, uVeil: [14.6, 1.55, -9.4], uVeilYaw: 0.9, uVeilTilt: 0.35, uVeilBlow: 1.0 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      const k = ease.in2((t - P.from - 2.2) / 4.5); u.uVeil.value.set(14.6 + 9 * k, 1.55 - 1.2 * Math.min(1, k * 2.5), -9.4 + 6 * k); u.uVeilTilt.value = 0.35 + 1.1 * Math.min(1, k * 1.5); u.uVeilYaw.value = -0.7 + 1.6 * k;
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
