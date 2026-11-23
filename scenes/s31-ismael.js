// 31 · From the spring's source, ring after ring spreads out across the starlit water.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [3.5, 1.6, 4.0], "target": [0.4, -0.3, -0.5], "fov": 40};
const B = {"pos": [3.0, 1.9, 3.4], "target": [0.5, -0.3, -0.5], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's31-ismael', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 1.0, uDust: 0.3, uDustH: 18, uFlatR: 14, uWind: [1.0, 0.25], uSpringOn: 1, uSpring: [0, 0, 0], uSpringR: 5, uWaterY: -0.3, uSrc: [0.6, -0.4], uPalms: 3, uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [3.0, 3.4, 4.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3, uAngel: [0, 3.0, -0.6], uAngelI: 2.4, uRings: 1.4 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
