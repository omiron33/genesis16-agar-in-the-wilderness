// 25 · Low at the water's edge: the indigo veil where it was dropped; a drop falls into the spring.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [6.9, 1.9, 6.6], "target": [3.7, -0.35, 3.0], "fov": 38};
const B = {"pos": [6.5, 1.75, 6.1], "target": [3.6, -0.35, 2.9], "fov": 38};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's25-fleeing', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 1, uDunes: 1, uMesa: 1, uMie: 2.6, uDust: 0.8, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 3, uSunDir: [-0.9959, -0.0262, -0.0871], uSunCol: [30.0, 30.0, 30.0], uSteps: [14, 22, 0, 0], uStepsN: 30, uStepsDir: -2.55, uAmbK: 2.2, uAngel: [0, 2.2, -0.6], uAngelI: 3.0, uVeilOn: 1, uVeil: [4.0, 0.0, 3.3], uVeilYaw: -0.6, uVeilTilt: 1.5708, uVeilBlow: 0.0, uSkinOn: 0, uAperture: 0.01, uFocus: 4.2, uDropOn: 1, uDrop: [2.3, 1.7] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uDropT.value = P.from + 2.6;
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.75 }),
  };
};
