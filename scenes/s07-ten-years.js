// 07 · Ten years: from a hill above the camp the sun crosses the sky again and again; the tents stay.
import { WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease } from '/song/lib/world2.js';
import { grade } from '/song/lib/look.js';

const A = {"pos": [-30, 14, 40], "target": [0, 0, 0], "fov": 40};
const B = {"pos": [-26, 13, 38], "target": [0, 0.5, 0], "fov": 40};
const LAMPS = [];

export default (P) => {
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {
    name: 's07-ten-years', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) { return world(fc); }`,
    uniforms: { ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uShrubs: 0.2, uLand: 0, uDunes: 0, uMesa: 0, uMie: 1.6, uDust: 0.5, uDustH: 25, uFlatR: 16, uWind: [0.8, 0.6], uSunDir: [-0.7912, 0.4067, -0.4568], uSunCol: [30.0, 30.0, 30.0], uTentsOn: 1, uCamp: [0, 0, 0], uTreeOn: 1, uTree: [-8, 0, 10] },
    camera: (t) => cam(P, t, A, B),
    update(t, u) {
      setLamps(u, LAMPS);
      const a = (t - P.from) * 2.4; const s = Math.sin(a); u.uSunDir.value.set(-0.7 * Math.cos(a), 0.06 + 0.6 * Math.abs(s), -0.5);
      skyLight(u);
    },
    post: (t) => grade(t, { exposure: 1.0 }),
  };
};
