// 09 · Night over the camp: Abram's tent lit, the small tent dark, the great tent's lamp low. Stars.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-4, 1.2, 26], "target": [0, 2.5, -6], "fov": 44};
const B = {"pos": [-3, 1.4, 22], "target": [0, 3.0, -6], "fov": 44};
const LAMPS = [[0.3, 0.55, 0.6, 0.8], [-10.8, 0.5, -4.2, 1.8]];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's09-night-tents', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.0, uDust: 0.3, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [4.6, 5.4, 7.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3.4, uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.6 }),
  };
};
