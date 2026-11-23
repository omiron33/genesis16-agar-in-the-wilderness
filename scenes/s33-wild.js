// 33 · A moonlit wind over open dunes; sand streams off their crests.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [0, 3.0, 20], "target": [0, 1.5, -60], "fov": 40};
const B = {"pos": [4, 3.0, 12], "target": [2, 1.8, -60], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's33-wild', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.06, uLand: 1, uDunes: 1, uMesa: 1, uMie: 1.0, uDust: 1.0, uDustH: 18, uFlatR: 8, uWind: [1.0, 0.25], uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [3.0, 3.4, 4.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3, uFlat: [0, 0, 0], uDuneAmp: 7 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uWindT.value = t * 40.0;
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.1 }),
  };
};
