// 46 · The camp at night under the whole sky; the small tent's lamp breathes slowly like a cradle rocking; the camera rises.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world3.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [14, 0.9, 16], "target": [6, 3, -10], "fov": 50};
const B = {"pos": [14, 3.4, 18], "target": [6, 7, -10], "fov": 50};
const LAMPS = [[9.6, 0.45, -8.4, 1.6], [0.3, 0.55, 0.6, 1.2], [-10.8, 0.5, -4.2, 1.0]];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's46-end', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.0, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.0, uDust: 0.3, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [0.5868, 0.6428, -0.4924], uSunCol: [4.6, 5.4, 7.6], uNight: 1, uSunDisc: 0, uStars: 1, uAmbK: 3.4, uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10], uStarGain: 1.2, uMilky: 1.2 },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      u.uLI.value[0] = 1.6 + 0.5 * Math.sin((t - P.from) * 2.0 * Math.PI * 79 / 60 / 2); u.uExp.value = 1.0 - 0.95 * ease.inOut3((t - P.to + 2.5) / 2.5);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.5 }),
  };
};
