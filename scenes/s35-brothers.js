// 35 · The Milky Way over the dunes, star beyond star, the dunes going on to the horizon.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [0, 30, 30], "target": [0, 60, -300], "fov": 56};
const B = {"pos": [0, 30, 22], "target": [0, 70, -300], "fov": 56};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's35-brothers', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 1, uDunes: 1, uMesa: 1, uMie: 1.0, uDust: 0.3, uDustH: 18, uFlatR: 4, uWind: [1.0, 0.25], uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [4.6, 5.4, 7.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3.4, uStarGain: 1.5, uMilky: 1.4, uFlat: [0, 0, 0] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.2 }),
  };
};
