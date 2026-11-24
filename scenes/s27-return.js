// 27 · Looking back up the line of footprints, towards the far hills of home, as the last light goes.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [4.6, 1.5, 6.6], "target": [14.5, 0.9, 23], "fov": 44};
const B = {"pos": [5.4, 1.5, 8.0], "target": [14.5, 1.1, 23], "fov": 44};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's27-return', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 1, uDunes: 1, uMesa: 1, uMie: 2.6, uDust: 0.8, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 3, uSunDir: [-0.9959, -0.0262, -0.0871], uSunCol: [30.0, 30.0, 30.0], uSteps: [14, 22, 0, 0], uStepsN: 30, uStepsDir: -2.55, uAmbK: 2.2, uAngel: [0, 3.0, -0.6], uAngelI: 3.0, uStepsFill: 0.3 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.35 }),
  };
};
