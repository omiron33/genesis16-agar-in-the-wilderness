// 34 · Moonlit dunes in hard ranks, one against the next, to the horizon.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [0, 16, 12], "target": [20, 4, -140], "fov": 38};
const B = {"pos": [6, 16, 6], "target": [26, 4, -140], "fov": 38};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's34-against-all', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 0, uMie: 1.0, uDust: 0.3, uDustH: 18, uFlatR: 4, uWind: [0.3, 1.0], uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [3.0, 3.4, 4.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3, uFlat: [0, 0, 0], uDuneAmp: 8 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
