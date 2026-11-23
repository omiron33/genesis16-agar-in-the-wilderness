// 23 · Over the water, a light gathers: the angel of the Lord. Its reflection lies on the spring.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [6, 0.9, 9], "target": [0, 1.6, 0], "fov": 40};
const B = {"pos": [5, 0.8, 7.6], "target": [0, 1.8, 0], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's23-angel', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 2.6, uDust: 0.8, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 3, uSunDir: [-0.9959, -0.0262, -0.0871], uSunCol: [30.0, 30.0, 30.0], uSteps: [14, 22, 0, 0], uStepsN: 30, uStepsDir: -2.55, uAmbK: 2.2, uAngelI: 0 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uAngel.value.set(0, 2.2, -0.6); u.uAngelI.value = 3.0 * ease.inOut3((t - P.from - 0.3) / 2.2);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.3 }),
  };
};
