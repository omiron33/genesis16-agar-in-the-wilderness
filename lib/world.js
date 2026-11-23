// Genesis 16's one world: Abram's camp in the hill country, and the wilderness on the road to Sur.
// Every scene of the film is this shader with different switches. Written for this film.
//
//   the land    a raymarched heightfield: stony hill country round the camp, or the desert (wind-cut
//               dunes with ripples, a stepped sandstone escarpment on the horizon); a bowl where the
//               spring wells up; a trail of footprints the wind is filling
//   the air     single-scattering atmosphere (Rayleigh and Mie, a desert's heavy Mie haze), aerial
//               perspective, a low dust layer, stars and the Milky Way at night
//   the cloud   one high cloud deck that can open like an eye (El Roi), with shafts of light under it
//   the water   the spring: a real shoreline, ripples and rings from its source, reflection (sky,
//               palms, banks), refraction to a sandy floor with caustics
//   the things  black goat-hair tents, an acacia, a broom bush, date palms, a stone well-head with dark
//               water inside, an indigo veil, a water skin, lamps, and the angel of the Lord as light
// No people are drawn: Agar is seen only in what she leaves (footprints, the veil, the empty skin).
import { keys, ease } from '/engine.js';

export const WORLD_UNIFORMS = {
  uSunDir: [0.4, 0.3, -0.85], uSunCol: [20, 20, 20], uSunDisc: 1, uNight: 0,
  uMie: 1, uDust: 0.6, uDustH: 18, uExp: 1, uAmbK: 1,
  uStars: 0, uStarGain: 1, uMilky: 0.8,
  uLand: 1, uDunes: 1, uDuneAmp: 5, uMesa: 1, uMesaAz: 0, uFlat: [0, 0, 0], uFlatR: 8, uWind: [1, 0.3], uWindT: 0,
  uCloud: 0, uCloudH: 2600, uCloudCov: 0.5, uEye: 0, uEyeC: [0, 0], uEyeR: [900, 380], uEyeYaw: 0, uRays: 0, uRim: 1,
  uSpring: [0, 0, 0], uSpringOn: 0, uSpringR: 5, uWaterY: -0.3, uWell: 0, uSrc: [0, 0], uRings: 0.3,
  uSteps: [0, 0, 0, 0], uStepsN: 0, uStepsFill: 0, uStepsDir: 0,
  uTentsOn: 0, uCamp: [0, 0, 0], uCampYaw: 0,
  uTreeOn: 0, uTree: [0, 0, 0], uBushOn: 0, uBush: [0, 0, 0], uPalms: 0,
  uWellOn: 0, uWellP: [0, 0, 0],
  uShrubs: 0,
  uLineOn: 0, uLine: [0, 0, 0], uLineYaw: 0,
  uVeilOn: 0, uVeil: [0, 0, 0], uVeilYaw: 0, uVeilTilt: 0.2, uVeilBlow: 0.5,
  uSkinOn: 0, uSkin: [0, 0, 0], uSkinYaw: 0, uSkinEmpty: 0,
  uAmbSky: [0.1, 0.12, 0.16], uSunT: [1, 1, 1],
  uAngel: [0, 2, 0], uAngelI: 0, uAngelCol: [1.0, 0.86, 0.62],
  uLampCol: [1.0, 0.58, 0.24], uL: new Array(24).fill(0), uLI: new Array(8).fill(0),
};

export const WORLD_GLSL = /* glsl */ `
uniform vec3 uAmbSky, uSunT, uLine;
uniform float uLineOn, uLineYaw, uShrubs;
uniform vec3 uSunDir, uSunCol, uFlat, uSpring, uCamp, uTree, uBush, uWellP, uVeil, uSkin, uAngel, uAngelCol, uLampCol;
uniform vec2 uWind, uEyeC, uEyeR, uSrc;
uniform vec4 uSteps;
uniform float uSunDisc, uNight, uMie, uDust, uDustH, uExp, uAmbK, uStars, uStarGain, uMilky;
uniform float uLand, uDunes, uDuneAmp, uMesa, uMesaAz, uFlatR, uWindT;
uniform float uCloud, uCloudH, uCloudCov, uEye, uEyeYaw, uRays, uRim;
uniform float uSpringOn, uSpringR, uWaterY, uWell, uRings;
uniform float uStepsN, uStepsFill, uStepsDir;
uniform float uTentsOn, uCampYaw, uTreeOn, uBushOn, uPalms, uWellOn;
uniform float uVeilOn, uVeilYaw, uVeilTilt, uVeilBlow, uSkinOn, uSkinYaw, uSkinEmpty, uAngelI;
uniform float uL[24];
uniform float uLI[8];

vec3 SUNDIR() { return normalize(uSunDir); }
vec3 lampPos(int i) { return vec3(uL[i * 3], uL[i * 3 + 1], uL[i * 3 + 2]); }
float flick(float s) { return 0.88 + 0.08 * sin(uTime * 11.0 + s * 7.0) + 0.04 * sin(uTime * 23.0 + s * 3.0); }   // ark-shake-ok: a lamp flame
bool gShadowPass = false;
float gGroundH = 0.0;   // the land's height under the current point, set by every caller of things()
float gTree, gBush, gWell, gVeil, gSkin, gCamp;

// ================= the land =================
vec2 windFrame(vec2 p) { vec2 w = normalize(uWind); return vec2(dot(p, w), dot(p, vec2(-w.y, w.x))); }
float duneH(vec2 p) {
  vec2 q = windFrame(p);
  float warp = (fbm(q * vec2(0.004, 0.011) + 3.7, 3) - 0.5) * 70.0;
  float x = (q.x + warp) / 46.0;
  float f = fract(x);
  float prof = f < 0.76 ? smoothstep(0.0, 1.0, f / 0.76) : 1.0 - smoothstep(0.0, 1.0, (f - 0.76) / 0.24);
  prof = pow(prof, 1.35);
  float amp = uDuneAmp * (0.45 + 0.9 * fbm(q * 0.005 + 1.3, 2));
  float big = (fbm(p * 0.0021 + 8.1, 3) - 0.4) * 22.0;
  return prof * amp + big;
}
float hillsH(vec2 p) {   // the stony hill country of the camp
  float h = (fbm(p * 0.012 + 2.3, 4) - 0.45) * 9.0;
  h += (fbm(p * 0.0024 + 5.7, 4) - 0.45) * 60.0;
  h += (fbm(p * 0.05 + 1.1, 3) - 0.5) * 1.6;
  // limestone outcrops and loose boulders
  h += smoothstep(0.7, 0.85, fbm(p * 0.08 + 9.0, 4)) * 0.25;
  return h;
}
float mesaH(vec2 p, float r) {   // stepped sandstone escarpments far off
  float az = atan(p.x - uFlat.x, p.y - uFlat.z) - uMesaAz;
  float side = 0.55 + 0.45 * cos(az);
  float f = fbm(p * 0.0011 + 11.0, 5);
  float h = smoothstep(0.32, 0.62, f) * 150.0 * side;
  float s = 22.0, k = h / s + (fbm(p * 0.006 + 3.3, 3) - 0.5) * 0.8;
  h = (floor(k) + smoothstep(0.3, 0.95, fract(k))) * s * 0.85 + h * 0.15;   // cliff steps: the strata
  return h * smoothstep(250.0, 900.0, r);
}
float footprints(vec2 p) {
  if (uStepsN < 0.5) return 0.0;
  vec2 a = uSteps.xy, d = vec2(sin(uStepsDir), cos(uStepsDir));
  vec2 q = p - a;
  float s = dot(q, d), o = dot(q, vec2(d.y, -d.x));
  if (s < -0.5 || s > uStepsN * 0.68 + 0.5 || abs(o) > 0.5) return 0.0;
  float idx = floor(s / 0.68 + 0.5);
  if (idx < 0.0 || idx >= uStepsN) return 0.0;
  float side = mod(idx, 2.0) < 0.5 ? 1.0 : -1.0;
  float wob = (hash11(idx * 7.3) - 0.5) * 0.06;
  vec2 c = vec2(idx * 0.68, side * 0.11 + wob);
  vec2 l = vec2(s, o) - c;
  float rr = hash11(idx * 3.1 + 0.5) * 0.3 - 0.15;
  l = rot(rr * side) * l;
  float e = length(l / vec2(0.14, 0.05));
  float dent = (1.0 - smoothstep(0.3, 1.0, e)) * 0.034 * (0.8 + 0.4 * smoothstep(-0.1, 0.1, l.x));
  float rim = smoothstep(0.9, 1.2, e) * (1.0 - smoothstep(1.2, 1.9, e)) * 0.008;
  // the wind fills the older steps first
  float age = 1.0 - idx / max(uStepsN, 1.0);
  float fill = sat(uStepsFill * (0.4 + 1.2 * age));
  return (-dent + rim) * (1.0 - fill);
}
float terrainH(vec2 p) {
  float r = length(p - uFlat.xz);
  float near = (vnoise(p * 0.45) - 0.5) * 0.12 + (vnoise(p * 2.1) - 0.5) * 0.03;
  float lw = smoothstep(uFlatR, uFlatR * 5.0 + 8.0, r);
  float land = 0.0;
  if (lw > 0.0) land = uLand > 0.5 ? (uDunes > 0.99 ? duneH(p) : mix(hillsH(p) * 0.25, duneH(p), uDunes)) : hillsH(p);
  float h = near + land * lw + uFlat.y;
  if (uMesa > 0.0 && r > 250.0) h += mesaH(p, r) * uMesa;
  if (uSpringOn > 0.5) {   // the bowl of the spring
    float d = length(p - uSpring.xz);
    float b = 1.0 - smoothstep(uSpringR * 0.6, uSpringR * 2.2, d);
    h = mix(h, uSpring.y - 0.9 + min(d * d / (uSpringR * uSpringR), 1.6) * 0.75 + (vnoise(p * 1.7) - 0.5) * 0.15, b);
  }
  h += footprints(p);
  return h;
}
vec3 terrainN(vec3 p, float t) {
  float e = 0.01 + t * 0.0015;
  return normalize(vec3(terrainH(p.xz - vec2(e, 0)) - terrainH(p.xz + vec2(e, 0)), 2.0 * e,
                        terrainH(p.xz - vec2(0, e)) - terrainH(p.xz + vec2(0, e))));
}
// wind ripples in the sand, as a bump on the normal; faded out with distance before they alias
vec3 ripples(vec3 p, vec3 n, float t) {
  float k = 0.55 * (uSpringOn > 0.5 ? smoothstep(uSpringR * 1.8, uSpringR * 3.2, length(p.xz - uSpring.xz)) : 1.0) * (1.0 - smoothstep(5.0, 24.0, t)) * uDunes * step(0.5, uLand) * smoothstep(0.75, 0.95, n.y);
  if (k <= 0.0) return n;
  vec2 q = windFrame(p.xz);
  float ph = (q.x + 0.5 * vnoise(q * vec2(0.6, 0.25)) + 0.12 * vnoise(q * 3.0) + uWindT * 0.02) / 0.13;
  float f = fract(ph);
  float slope = f < 0.7 ? 1.0 / 0.7 : -1.0 / 0.3;   // gentle up, steep down: asymmetric like real ripples
  float amp = 0.012 * smoothstep(0.25, 0.7, vnoise(q * 0.35));
  vec2 w = normalize(uWind);
  vec2 g = w * slope * amp / 0.13 * 6.2832 * 0.16;
  return normalize(n - vec3(g.x, 0, g.y) * k);
}

// ================= things =================
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdCyl(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }

// a black goat-hair tent, 8 by 4.5 m: the roof high over the open front, sloping to the back
float sdTent(vec3 p, float s) {
  p /= s;
  float sag = 0.2 * (0.5 - 0.5 * cos(p.x * 6.2832 / 2.7));
  float roof = 1.95 - sag - 0.19 * (2.2 - p.z);
  float outer = max(sdBox(p - vec3(0, 1.0, 0), vec3(4.0, 1.0, 2.2)), (p.y - roof) * 0.85);
  float d = abs(outer) - 0.03 + 0.025 * sin(p.x * 7.0 + 0.6 * sin(p.y * 3.0)) * smoothstep(0.3, 1.4, p.y) * step(abs(p.z), 2.0);
  d = max(d, -sdBox(p - vec3(0.0, 0.95, 2.2), vec3(3.75, 0.95, 0.3)));
  vec3 q = p; q.x = abs(q.x);
  float poles = min(sdCapsule(q, vec3(1.35, 0, 2.15), vec3(1.35, 1.8, 2.15), 0.04), sdCapsule(q, vec3(3.9, 0, 2.15), vec3(3.9, 1.85, 2.15), 0.035));
  float ropes = min(sdCapsule(q, vec3(3.9, 1.8, 2.2), vec3(5.4, 0.0, 3.6), 0.012), sdCapsule(q, vec3(1.35, 1.8, 2.2), vec3(1.9, 0.0, 4.6), 0.012));
  ropes = min(ropes, sdCapsule(q, vec3(4.0, 1.0, -2.2), vec3(5.2, 0.0, -3.4), 0.012));
  return min(d, min(poles, ropes)) * s;
}
float sdRug(vec3 p, float s) { p /= s; return sdBox(p - vec3(0, 0.02, 0.6), vec3(2.6, 0.015, 1.2)) * s; }
// the camp: Sara's great tent, Abram's, and a smaller one apart (the maid's)
float sdCampTents(vec3 p, out float isRope) {
  isRope = 0.0;
  vec3 a = p;                                   float d = sdTent(a, 1.0);
  isRope = sdRug(a, 1.0);
  vec3 b = p - vec3(-11.0, 0, -5.0); b.xz = rot(0.5) * b.xz;  d = min(d, sdTent(b, 0.85));
  vec3 c = p - vec3(9.5, 0, -9.0); c.xz = rot(-0.7) * c.xz;   d = min(d, sdTent(c, 0.62));
  return d;
}

// an acacia: a forked trunk and a flat, wind-cut crown
float sdAcaciaWood(vec3 p) {
  float d = sdRoundCone(p, vec3(0, 0, 0), vec3(0.2, 1.6, 0.1), 0.22, 0.14);
  d = smin(d, sdCapsule(p, vec3(0.2, 1.5, 0.1), vec3(1.9, 3.3, 0.6), 0.1), 0.15);
  d = smin(d, sdCapsule(p, vec3(0.2, 1.5, 0.1), vec3(-1.6, 3.5, -0.4), 0.09), 0.15);
  d = smin(d, sdCapsule(p, vec3(0.2, 1.6, 0.1), vec3(0.4, 3.7, -1.5), 0.08), 0.12);
  d = smin(d, sdCapsule(p, vec3(1.1, 2.4, 0.35), vec3(2.6, 3.4, -0.6), 0.05), 0.08);
  return d;
}
float sdAcaciaLeaves(vec3 p) {
  float d = sdEllipsoid(p - vec3(0.2, 3.75, -0.1), vec3(3.7, 0.5, 3.1));
  d = smin(d, sdEllipsoid(p - vec3(2.1, 3.5, 0.4), vec3(1.7, 0.42, 1.5)), 0.5);
  d = smin(d, sdEllipsoid(p - vec3(-1.8, 3.65, -0.5), vec3(1.6, 0.4, 1.6)), 0.5);
  if (d < 0.8) d += (fbm(p * 2.2, 4) - 0.5) * 0.55 + (vnoise(p * 9.0) - 0.5) * 0.12;
  return d;
}
// a white broom (retem) bush: a loose dome of thin grey-green rods
float sdBroom(vec3 p) {
  float d = sdEllipsoid(p - vec3(0, 0.7, 0), vec3(1.5, 0.95, 1.4));
  if (d > 0.5) return d;
  vec3 q = p; q.xz = rot(q.y * 0.6) * q.xz;
  float rods = (vnoise(vec3(q.x * 9.0, q.y * 1.3, q.z * 9.0)) - 0.55) * 0.35;
  return max(d, rods) * 0.7 + (fbm(p * 3.0, 3) - 0.5) * 0.15;
}
// a date palm: a gently curved, ringed trunk and a crown of arching feathered fronds
float sdPalm(vec3 p, float hgt, float bend, out float frond) {
  frond = 0.0;
  float yy = sat(p.y / hgt);
  vec3 q = p; q.x -= bend * yy * yy;
  float r = mix(0.22, 0.16, yy) + 0.06 * exp(-p.y * 3.0);
  float trunk = max(length(q.xz) - r - 0.01 * sin(p.y * 24.0), abs(p.y - hgt * 0.5) - hgt * 0.5) * 0.8;
  vec3 c = p - vec3(bend, hgt, 0);
  if (length(c) > 4.6) { float sph = length(c) - 4.0; if (sph < trunk) frond = 1.0; return min(trunk, sph); }
  float best = 1e9;
  for (int layer = 0; layer < 2; layer++) {
    float N = layer == 0 ? 8.0 : 7.0;
    float sec = 6.2832 / N;
    float a = atan(c.z, c.x) + float(layer) * 0.4;
    float id = floor(a / sec + 0.5);
    float aa = a - id * sec;
    float h = hash11(id * 3.7 + float(layer) * 11.0);
    float L = 3.2 + 0.7 * h;
    float up = layer == 0 ? 0.9 : 0.25;           // the young fronds stand up, the old ones arch over
    float droop = layer == 0 ? 0.2 : 0.32;
    float rl = length(c.xz);
    vec3 f = vec3(rl * cos(aa), c.y, rl * sin(aa));
    float x = clamp(f.x, 0.0, L);
    float yMid = up * x - droop * x * x;
    float w = 0.55 * pow(sin(3.1416 * x / L), 0.6);
    float az = abs(f.z);
    float dy = f.y - yMid + az * 0.5;              // leaflets fold up in a V from the midrib
    float serr = 0.035 * abs(sin((x + az * 0.9) * 26.0 + h * 6.0)) * smoothstep(0.05, 0.2, az);
    float dd = max(max(abs(dy) - 0.012, az - w + serr), max(-f.x, f.x - L));
    best = min(best, dd * 0.55);
  }
  if (best < trunk) frond = 1.0;
  return min(trunk, best);
}
// the well-head: a ring of stones round a dark shaft
float sdWellHead(vec3 p) {
  float ring = max(abs(length(p.xz) - 1.0) - 0.28, abs(p.y - 0.36) - 0.36);
  float course = floor(p.y / 0.18);
  float ang = atan(p.z, p.x) * 1.0 / 0.4 + course * 0.5;
  float jx = abs(fract(ang) - 0.5), jy = abs(fract(p.y / 0.18) - 0.5);
  float joint = min((0.5 - jx) * 0.4, (0.5 - jy) * 0.18);
  ring += 0.02 * (1.0 - smoothstep(0.0, 0.02, joint)) + (vnoise(p * 9.0) - 0.5) * 0.02;
  return ring * 0.8;
}
// the veil: an indigo linen sheet, pinned along its top edge, streaming and rippling in the wind.
// tilt 0 hangs, 1.57 lies flat on the ground
float sdVeil(vec3 p) {
  float th = uVeilTilt;
  vec3 dir = vec3(0, -cos(th), sin(th)), n = vec3(0, sin(th), cos(th));
  float L = 1.35, W = 0.4;
  float v = dot(p, dir);
  float vc = clamp(v, 0.0, L);
  float wave = sin(vc * 4.2 - uTime * 6.0 * uVeilBlow + p.x * 3.0) * (0.06 + 0.12 * uVeilBlow * uVeilBlow) * vc * uVeilBlow   // ark-shake-ok: cloth in the wind
             + sin(p.x * 7.0 - uTime * 4.0 * uVeilBlow + vc * 2.0) * 0.025 * vc * uVeilBlow     // ark-shake-ok: cloth in the wind
             + (vnoise(vec2(p.x * 2.5, vc * 2.5)) - 0.5) * 0.05 * (1.0 - uVeilBlow)
             + sin(p.x * 11.0 + sin(vc * 3.0) * 1.5) * 0.012 * (1.0 - 0.4 * vc / L) * (1.0 - smoothstep(1.2, 1.5, uVeilTilt));
  float dp = abs(dot(p, n) - wave) - 0.006;
  float edge = max(abs(p.x) - W * (1.0 + 0.2 * vc), abs(v - L * 0.5) - L * 0.5);
  return max(dp, edge) * 0.55;
}
// the water skin: a goatskin bag, full or empty, its neck tied
float sdSkin(vec3 p) {
  float e = uSkinEmpty;
  float body = sdEllipsoid(p - vec3(0, 0.17 - 0.1 * e, 0), vec3(0.34, 0.17 - 0.11 * e, 0.22 + 0.04 * e));
  float neck = sdRoundCone(p, vec3(0.3, 0.14 - 0.08 * e, 0), vec3(0.52, 0.24 - 0.14 * e, 0.02), 0.07, 0.045);
  float tie = sdTorus(p - vec3(0.46, 0.21 - 0.13 * e, 0.015), vec2(0.05, 0.012));
  vec3 q = p; q.z = abs(q.z);
  float legs = sdCapsule(q, vec3(-0.22, 0.12 - 0.08 * e, 0.15), vec3(-0.34, 0.05, 0.27), 0.03);
  return min(smin(smin(body, neck, 0.06), legs, 0.04), tie);
}

vec2 opU(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
// materials: 1 land, 2 tent, 3 rope, 4 wood, 5 leaves, 6 broom, 7 palm trunk, 8 frond, 9 well stone,
// 10 well water, 11 veil, 12 skin
vec2 things(vec3 p) {
  vec2 r = vec2(1e9, 0);
  if (uTentsOn > 0.5) {
    vec3 q = p - uCamp - vec3(0, gCamp, 0); q.xz = rot(uCampYaw) * q.xz;
    float b = sdBox(q - vec3(-1, 1.5, -4), vec3(17, 3, 11));
    float ir;
    if (b > 0.5) r = opU(r, vec2(b, -1));
    else { r = opU(r, vec2(sdCampTents(q, ir), 2)); r = opU(r, vec2(ir, 13)); }
  }
  if (uTreeOn > 0.5) {
    vec3 q = p - uTree - vec3(0, gTree, 0);
    float b = length(q - vec3(0.2, 2.6, 0)) - 4.8;
    if (b > 0.5) r = opU(r, vec2(b, -1));
    else { r = opU(r, vec2(sdAcaciaWood(q), 4)); r = opU(r, vec2(sdAcaciaLeaves(q) * 0.6, 5)); }
  }
  if (uBushOn > 0.5) {
    vec3 q = p - uBush - vec3(0, gBush, 0);
    float b = length(q - vec3(0, 0.7, 0)) - 2.0;
    r = opU(r, b > 0.4 ? vec2(b, -1) : vec2(sdBroom(q), 6));
  }
  if (uPalms > 0.5) {
    for (int i = 0; i < 4; i++) {
      if (float(i) >= uPalms) break;
      float fi = float(i);
      float a = fi * 2.1 + 0.6;
      vec3 base = uSpring + vec3(cos(a), 0, sin(a)) * (uSpringR * 1.25 + fi * 0.7);
      base.y = uSpring.y - 0.05;
      vec3 q = p - base; q.xz = rot(a + 1.4) * q.xz;
      float hgt = 6.5 + fi * 1.6;
      float b = sdBox(q - vec3(0.6, hgt * 0.5 + 1.0, 0), vec3(5.0, hgt * 0.5 + 3.0, 5.0));
      if (b > 0.5) { r = opU(r, vec2(b, -1)); continue; }
      float fr;
      float d = sdPalm(q, hgt, 0.5 + 0.35 * fi, fr);
      r = opU(r, vec2(d, fr > 0.5 ? 8.0 : 7.0));
    }
  }
  if (uWellOn > 0.5) {
    vec3 q = p - uWellP - vec3(0, gWell, 0);
    float b = length(q) - 2.0;
    if (b > 0.4) r = opU(r, vec2(b, -1));
    else {
      r = opU(r, vec2(sdWellHead(q), 9));
      r = opU(r, vec2(sdCyl(q - vec3(0, -0.9, 0), 0.72, 0.01), 10));
    }
  }
  if (uVeilOn > 0.5 && !gShadowPass) {
    vec3 q = p - uVeil - vec3(0, gVeil, 0); q.xz = rot(uVeilYaw) * q.xz;
    float b = length(q) - 1.8;
    r = opU(r, b > 0.4 ? vec2(b, -1) : vec2(sdVeil(q), 11));
  }
  if (uShrubs > 0.0 && p.y - gGroundH > 1.8) r = opU(r, vec2(p.y - gGroundH - 1.6, -1));
  else if (uShrubs > 0.0) {   // scattered scrub: low dark bushes, one at most in each 5 m cell
    vec2 c = floor(p.xz / 5.0);
    vec2 h = hash22(c + 17.0);
    if (h.x < uShrubs) {
      vec2 cc = (c + 0.2 + 0.6 * hash22(c + 3.1)) * 5.0;
      float rr = 0.35 + 0.5 * h.y;
      vec2 dxz = p.xz - cc;
      bool clear = (uLineOn < 0.5 || length(cc - uLine.xz) > 5.0) && (uTentsOn < 0.5 || length(cc - uCamp.xz) > 16.0) && (uSpringOn < 0.5 || length(cc - uSpring.xz) > uSpringR * 1.3) && length(cc - uFlat.xz) > 3.0;
      if (clear && dot(dxz, dxz) < (rr + 1.0) * (rr + 1.0)) {
        vec3 q = vec3(dxz.x, p.y - terrainH(cc), dxz.y);
        vec3 o1 = (hash33(vec3(c, 1.0)) - 0.5) * rr * 1.4, o2 = (hash33(vec3(c, 2.0)) - 0.5) * rr * 1.4;
        float d = sdEllipsoid(q - vec3(0, rr * 0.3, 0), vec3(rr, rr * 0.5, rr * 0.85));
        d = smin(d, sdEllipsoid(q - vec3(o1.x, rr * 0.25, o1.z), vec3(rr * 0.6, rr * 0.45, rr * 0.55)), 0.15);
        d = smin(d, sdEllipsoid(q - vec3(o2.x, rr * 0.2, o2.z), vec3(rr * 0.5, rr * 0.35, rr * 0.6)), 0.15);
        if (d < 0.3) d += (fbm(q * 9.0 + c.x, 3) - 0.5) * 0.22;
        r = opU(r, vec2(d * 0.6, 6));
      } else r = opU(r, vec2(max(length(dxz) - rr - 0.9, 0.3), -1));
    }
  }
  if (uLineOn > 0.5 && !gShadowPass) {   // a line between two posts that the veil hangs from
    vec3 q = p - uLine; q.xz = rot(uLineYaw) * q.xz;
    {
      float line = sdCapsule(q, vec3(-1.6, 0.01, 0), vec3(1.6, -0.06, 0), 0.008);
      line = min(line, sdCapsule(q, vec3(1.6, -0.06, 0), vec3(1.62, -uLine.y - 0.2, 0.02), 0.022));
      line = min(line, sdCapsule(q, vec3(-1.6, 0.01, 0), vec3(-1.63, -uLine.y - 0.2, -0.02), 0.022));
      r = opU(r, vec2(line, 3));
    }
  }
  if (uSkinOn > 0.5) {
    vec3 q = p - uSkin - vec3(0, gSkin, 0); q.xz = rot(uSkinYaw) * q.xz;
    float b = length(q) - 0.9;
    r = opU(r, b > 0.3 ? vec2(b, -1) : vec2(sdSkin(q), 12));
  }
  return r;
}

// ================= the air =================
const float RE = 6360e3, RA = 6440e3;
const vec3 BR = vec3(5.8e-6, 13.5e-6, 33.1e-6);
const vec3 BO = vec3(0.65e-6, 1.881e-6, 0.085e-6);
float BM() { return 4.0e-6 * uMie; }
vec2 rsph(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd), c = dot(ro, ro) - r * r, d = b * b - c;
  if (d < 0.0) return vec2(1e9, -1e9);
  d = sqrt(d); return vec2(-b - d, -b + d);
}
float phaseR(float mu) { return 0.0597 * (1.0 + mu * mu); }
float phaseM(float mu, float g) { float g2 = g * g; return 0.1194 * (1.0 - g2) * (1.0 + mu * mu) / ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5)); }
vec3 sunCol() { return uSunCol; }
vec3 gSunT = vec3(1);
bool gCheap = false;
vec3 sunLit() { return uSunCol * 0.065 * gSunT; }
// single scattering along a ray from the camera, up to tmax metres; returns in-scatter, t = transmittance
vec3 atmo(vec3 rd, float tmax, out vec3 trans) {
  vec3 ro = vec3(0, RE + max(uCamPos.y, 0.0) + 2.0, 0);
  vec3 sd = SUNDIR();
  vec2 ta = rsph(ro, rd, RA);
  float tEnd = min(ta.y, tmax);
  vec2 tg = rsph(ro, rd, RE);
  if (tg.x > 0.0) tEnd = min(tEnd, tg.x);
  float mu = dot(rd, sd);
  float pr = phaseR(mu), pm = phaseM(mu, 0.76);
  vec3 sumR = vec3(0), sumM = vec3(0);
  float odR = 0.0, odM = 0.0;
  const int N = 11;
  float dt = tEnd / float(N);
  float bm = BM();
  for (int i = 0; i < N; i++) {
    float t = (float(i) + 0.5) * dt;
    vec3 p = ro + rd * t;
    float h = length(p) - RE;
    float dR = exp(-h / 7994.0) * dt, dM = exp(-h / 1200.0) * dt;
    odR += dR; odM += dM;
    vec2 tl = rsph(p, sd, RA);
    float lt = tl.y / 5.0, lR = 0.0, lM = 0.0;
    bool blocked = false;
    for (int j = 0; j < 5; j++) {
      vec3 q = p + sd * (float(j) + 0.5) * lt;
      float hh = length(q) - RE;
      if (hh < 0.0) { blocked = true; break; }
      lR += exp(-hh / 7994.0) * lt; lM += exp(-hh / 1200.0) * lt;
    }
    if (blocked) continue;
    vec3 tau = (BR + BO) * (odR + lR) + bm * 1.1 * (odM + lM);
    vec3 att = exp(-tau);
    sumR += dR * att; sumM += dM * att;
  }
  trans = exp(-((BR + BO) * odR + bm * 1.1 * odM));
  return sunCol() * (sumR * BR * pr + sumM * bm * pm);
}
// how much of the sun reaches the ground (reddens and dims it near the horizon)
vec3 sunTransmit() {
  vec3 ro = vec3(0, RE + 2.0, 0), sd = SUNDIR();
  if (rsph(ro, sd, RE).x > 0.0) return vec3(0);
  float L = rsph(ro, sd, RA).y / 8.0, oR = 0.0, oM = 0.0;
  for (int i = 0; i < 8; i++) { float h = length(ro + sd * (float(i) + 0.5) * L) - RE; oR += exp(-h / 7994.0) * L; oM += exp(-h / 1200.0) * L; }
  return exp(-((BR + BO) * oR + BM() * 1.1 * oM));
}
// sky radiance seen along rd
float skylineMask;
vec3 starsOf(vec3 d);
float cloudDensity(vec2 xz, out float eyeRim);
vec3 skyNoClouds(vec3 rd) {
  vec3 tr;
  vec3 c = atmo(rd, 1e12, tr) * (1.0 - 0.55 * uNight);
  vec3 sd = SUNDIR();
  float s = dot(rd, sd);
  // the sun's disc with limb darkening
  float disc = smoothstep(0.99996, 0.999985, s);
  float limb = sqrt(sat(1.0 - (1.0 - s) / 1.5e-5));
  c += sunCol() * tr * disc * (0.4 + 0.6 * limb) * 120.0 * uSunDisc * (1.0 - uNight);
  if (uStars > 0.0) c += starsOf(rd) * uStars * tr * smoothstep(-0.02, 0.1, rd.y);
  return c;
}
vec3 sky(vec3 rd);

// ---- the cloud deck and the eye ----
float eyeMask(vec2 xz, out float rimD) {
  vec2 q = rot(uEyeYaw) * (xz - uEyeC);
  float a = uEyeR.x * (0.02 + 0.98 * uEye), hh = uEyeR.y * uEye;
  float x = q.x / max(a, 1.0);
  float edge = hh * max(1.0 - x * x, 0.0);         // an almond: two arcs meeting at points
  float d = abs(q.y) - edge;                        // < 0 inside the opening
  d = max(d, (abs(q.x) - a) * 0.5);
  rimD = d;
  return d;
}
float cloudDensity(vec2 xz, out float eyeRim) {
  eyeRim = 1e9;
  if (uCloud <= 0.0) return 0.0;
  vec2 w = xz * 0.00045 + vec2(uTime * 0.004, 0.0);
  float n = fbm(w, 6);
  n += (fbm(xz * 0.0019 + 4.0, 4) - 0.5) * 0.3 + (fbm(xz * 0.006 + 2.0, 3) - 0.5) * 0.18;
  float d = sat((n - (1.0 - uCloudCov)) * 1.8) * uCloud;
  if (uEye > 0.0) {
    float rd;
    float m = eyeMask(xz, rd);
    float soft = 160.0 + 260.0 * fbm(xz * 0.004, 3);
    d *= smoothstep(-soft * 0.3, soft, m + (fbm(xz * 0.003 + 9.0, 4) - 0.5) * 140.0 * uEye);
    eyeRim = m;
  }
  return d;
}
vec3 cloudLayer(vec3 rd, vec3 bg, out float alpha) {
  alpha = 0.0;
  if (uCloud <= 0.0 || rd.y <= 0.0) return bg;
  float t = (uCloudH - uCamPos.y) / rd.y;
  vec3 p = uCamPos + rd * t;
  float rim;
  float d = cloudDensity(p.xz, rim);
  vec3 sd = SUNDIR();
  // lighting: thick cloud dark below, thin edges silver where the sun is behind them
  float thick = d;
  float dl;
  float dsun = cloudDensity(p.xz + sd.xz / max(sd.y, 0.08) * 120.0, dl);
  float mu = dot(rd, sd);
  vec3 amb = uAmbSky * 3.2;
  float fwd = phaseM(mu, 0.75) * 0.35;
  vec3 lit = sunLit() * (0.04 * exp(-dsun * 2.0) + 6.0 * fwd * exp(-thick * 5.0)) * (1.0 - uNight);
  vec3 col = lit + amb * (0.02 + 0.1 * (1.0 - thick));
  if (uEye > 0.0 && uRim > 0.0) col += sunLit() * vec3(1.0, 0.72, 0.4) * (2.0 * exp(-max(rim, 0.0) / 90.0) * smoothstep(-200.0, 0.0, rim) + 0.06 * exp(-abs(rim) / 400.0)) * uRim * smoothstep(0.0, 0.3, uEye) * (1.0 - uNight) * (0.4 + 2.0 * fwd);
  // haze between the camera and the deck
  vec3 tr;
  vec3 ins = atmo(rd, t * 0.08, tr);
  col = col * tr + ins;
  alpha = sat(d * 1.6) * smoothstep(0.0, 0.06, rd.y);
  return mix(bg, col, alpha);
}
vec3 sky(vec3 rd) {
  vec3 c = skyNoClouds(rd);
  float a;
  return cloudLayer(rd, c, a);
}
// shafts of light under the deck: march the near air, test the sun's way up through the cloud
vec3 shafts(vec3 ro, vec3 rd, float tmax) {
  if (uRays <= 0.0 || uCloud <= 0.0) return vec3(0);
  vec3 sd = SUNDIR();
  float tEnd = min(tmax, 1400.0);
  const int N = 28;
  float dt = tEnd / float(N);
  float jit = hash12(gl_FragCoord.xy + fract(uTime * 7.3) * 37.0);
  vec3 acc = vec3(0);
  float mu = dot(rd, sd);
  float ph = phaseM(mu, 0.55) + 0.05;
  for (int i = 0; i < N; i++) {
    vec3 p = ro + rd * (float(i) + jit) * dt;
    if (p.y > uCloudH) break;
    float up = (uCloudH - p.y) / max(sd.y, 0.05);
    vec2 cx = p.xz + sd.xz * up;
    float rim;
    float d = cloudDensity(cx, rim);
    float vis = exp(-d * 5.0);
    float dens = exp(-max(p.y, 0.0) / 400.0);
    acc += vis * dens * dt;
  }
  return sunLit() * acc * ph * 2.5e-5 * uRays * (1.0 + 2.0 * uDust);
}

// ---- stars ----
vec3 starLayer(vec3 d, float scale, float dens, float seed, float px) {
  vec3 q = d * scale; vec3 id = floor(q); vec3 f = fract(q) - 0.5;
  vec3 h = hash33(id + seed);
  if (h.x > dens) return vec3(0);
  vec3 off = (hash33(id + seed + 7.1) - 0.5) * 0.6;
  vec3 v = f - off; v -= d * dot(v, d);
  float pr = max(px * scale * 0.9, 0.012);
  float g = exp(-dot(v, v) / (pr * pr));
  float b = pow(hash11(h.y * 91.7 + h.z), 6.0) * 3.0 + 0.05;
  vec3 col = mix(vec3(0.72, 0.8, 1.0), vec3(1.0, 0.86, 0.7), h.z);
  float tw = 0.88 + 0.12 * sin(uTime * (2.0 + h.z * 3.0) + h.y * 40.0);   // ark-shake-ok: stars twinkling
  return col * b * g * tw;
}
vec3 starsOf(vec3 d) {
  float px = 2.0 * tan(radians(uFov) * 0.5) / uRes.y;
  vec3 nMW = normalize(vec3(0.3, 0.45, 0.84));
  float band = exp(-pow(dot(d, nMW) / 0.22, 2.0)) * uMilky;
  vec3 c = vec3(0);
  c += starLayer(d, 60.0, 0.07, 1.0, px) * 1.4;
  c += starLayer(d, 150.0, 0.04 + 0.14 * band, 2.0, px) * 0.75;
  c += starLayer(d, 330.0, 0.02 + 0.2 * band, 3.0, px) * 0.4;
  float dust = fbm(d * 9.0, 5);
  c += band * vec3(0.12, 0.13, 0.18) * (0.35 + smoothstep(0.3, 0.75, dust)) * (0.6 + 0.8 * fbm(d * 30.0, 3));
  c *= mix(1.0, 0.3, band * smoothstep(0.55, 0.7, fbm(d * 14.0 + 3.0, 4)));
  return c * uStarGain * 0.35;
}

// ================= light =================
float shadow(vec3 ro, vec3 rd) {
  gShadowPass = true;
  float res = 1.0, ph = 1e10;
  float t = 0.02 + 0.05 * hash12(gl_FragCoord.xy + fract(uTime * 13.7) * 91.0);
  for (int i = 0; i < 56; i++) {
    vec3 p = ro + rd * t;
    gGroundH = terrainH(p.xz);
    vec2 o = things(p);
    float hg = (p.y - gGroundH) * 0.6;
    float h = (o.y < 0.0 || (o.y > 7.5 && o.y < 8.5) || (o.y > 10.5 && o.y < 11.5)) ? hg : min(o.x, hg);
    float stepH = min(o.x, hg);
    float y = h * h / (2.0 * ph); float d = sqrt(max(h * h - y * y, 0.0));
    float kk = (o.y > 4.5 && o.y < 5.5) || (o.y > 7.5 && o.y < 8.5) ? 90.0 : 26.0;
    res = min(res, kk * d / max(t - y, 1e-3));
    ph = h;
    if (res < 0.002 || t > 260.0) break;
    t += clamp(stepH, 0.02, 3.0 + t * 0.15);
  }
  gShadowPass = false;
  return sat(res);
}
float ao(vec3 p, vec3 n) {
  float o = 0.0, w = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.06 * float(i * i);
    vec3 q = p + n * h;
    gGroundH = terrainH(q.xz);
    vec2 tq = things(q);
    float d = min(tq.y < 0.0 ? 1e3 : tq.x, q.y - gGroundH);
    o += w * (h - d); w *= 0.6;
  }
  return sat(1.0 - 1.4 * o);
}
vec3 normalThing(vec3 p) {
  gGroundH = terrainH(p.xz);
  const vec2 k = vec2(1, -1); const float h = 0.0015;
  return normalize(k.xyy * things(p + k.xyy * h).x + k.yyx * things(p + k.yyx * h).x + k.yxy * things(p + k.yxy * h).x + k.xxx * things(p + k.xxx * h).x);
}

vec3 albedo(float m, vec3 p, vec3 n, float t) {
  if (m < 1.5) {
    vec3 a;
    if (uLand > 0.5) {   // the desert: sand over sandstone
      vec3 sand = vec3(0.64, 0.43, 0.25), pale = vec3(0.72, 0.56, 0.38), rock = vec3(0.46, 0.25, 0.15), dark = vec3(0.22, 0.13, 0.08);
      a = mix(sand, pale, smoothstep(0.3, 0.8, fbm(p.xz * 0.05, 4)) * 0.6);
      a *= 0.9 + 0.2 * vnoise(p.xz * 3.0);
      float steep = smoothstep(0.32, 0.6, 1.0 - n.y);
      float strata = 0.5 + 0.5 * sin(p.y * 1.7 + fbm(p.xz * 0.02, 3) * 4.0);
      vec3 rk = mix(rock, mix(rock * 1.3, dark, 0.3), strata) * (0.75 + 0.4 * vnoise(p.xz * 0.5 + p.y));
      a = mix(a, rk, steep);
      // scattered dark flint on the hard ground between dunes
      float flint = step(0.9, hash12(floor(p.xz * 3.0))) * (1.0 - smoothstep(0.1, 0.22, length(fract(p.xz * 3.0) - 0.5 - (hash22(floor(p.xz * 3.0)) - 0.5) * 0.4))) * (1.0 - uDunes * 0.8) * (1.0 - smoothstep(10.0, 40.0, t));
      a = mix(a, dark, flint * 0.7);
    } else {               // the hill country: pale limestone, dry grass and scrub
      vec3 lime = vec3(0.46, 0.41, 0.34), soil = vec3(0.3, 0.2, 0.12), straw = vec3(0.42, 0.31, 0.17), scrub = vec3(0.08, 0.085, 0.04);
      a = mix(soil, straw, 0.55 + 0.35 * smoothstep(0.3, 0.7, fbm(p.xz * 0.06, 4)));
      float rock = smoothstep(0.7, 0.85, fbm(p.xz * 0.08 + 9.0, 4)) * 0.6 + step(0.97, hash12(floor(p.xz * 2.0))) * (1.0 - smoothstep(0.12, 0.2, length(fract(p.xz * 2.0) - 0.5))) * (1.0 - smoothstep(10.0, 30.0, t)) * 0.35;
      a = mix(a, lime * (0.8 + 0.25 * vnoise(p.xz * 4.0)), max(rock * 0.8, smoothstep(0.35, 0.6, 1.0 - n.y) * 0.6));
      float tuft = smoothstep(0.6, 0.85, fbm(p.xz * 0.9, 3)) * (1.0 - rock);
      a = mix(a, scrub, tuft * 0.25);
      a *= 0.82 + 0.3 * vnoise(p.xz * 7.0);
    }
    // wet sand at the water's edge
    if (uSpringOn > 0.5) {
      float wet = 1.0 - smoothstep(uWaterY, uWaterY + 0.18, p.y);
      float dS = length(p.xz - uSpring.xz);
      a *= mix(1.0, 0.55, wet * (1.0 - smoothstep(uSpringR * 1.2, uSpringR * 1.7, dS)));
      float green = (1.0 - smoothstep(uSpringR * 1.1, uSpringR * 2.3, dS + (fbm(p.xz * 0.8, 3) - 0.5) * 3.0)) * smoothstep(uWaterY + 0.05, uWaterY + 0.25, p.y);
      a = mix(a, vec3(0.11, 0.15, 0.05) * (0.7 + 0.6 * vnoise(p.xz * 6.0)), green * 0.85);
    }
    return a;
  }
  if (m < 2.5) return vec3(0.1, 0.085, 0.072) * (0.75 + 0.35 * smoothstep(0.3, 0.7, fract(p.x * 1.4 + 0.06 * sin(p.y * 9.0)))) * (0.85 + 0.3 * vnoise(p * 14.0));
  if (m < 3.5) return vec3(0.2, 0.14, 0.085) * (0.8 + 0.4 * vnoise(p * 20.0));
  if (m < 4.5) return vec3(0.13, 0.09, 0.065) * (0.7 + 0.5 * vnoise(p * vec3(4, 14, 4)));
  if (m < 5.5) return vec3(0.12, 0.15, 0.06) * (0.7 + 0.6 * vnoise(p * 5.0));
  if (m < 6.5) return vec3(0.1, 0.11, 0.065) * (0.6 + 0.8 * vnoise(p * 9.0));
  if (m < 7.5) return vec3(0.2, 0.15, 0.1) * (0.6 + 0.5 * smoothstep(0.2, 0.8, fract(p.y * 4.5)));
  if (m < 8.5) return vec3(0.1, 0.17, 0.06) * (0.75 + 0.5 * vnoise(p * 3.0));
  if (m < 9.5) return vec3(0.66, 0.47, 0.3) * (0.6 + 0.5 * vnoise(p * 8.0)) * (0.8 + 0.4 * hash12(floor(vec2(atan(p.z - uWellP.z, p.x - uWellP.x) / 0.4, p.y / 0.18))));
  if (m > 12.5) { float st = step(0.5, fract(p.z * 3.0 + 0.25 * step(0.5, fract(p.x * 1.5)))); return mix(vec3(0.32, 0.06, 0.04), vec3(0.45, 0.32, 0.12), st) * (0.8 + 0.3 * vnoise(p.xz * 20.0)); }
  if (m < 11.5) return vec3(0.035, 0.04, 0.1) * (0.92 + 0.16 * vnoise(p * 6.0));   // indigo linen
  return vec3(0.16, 0.1, 0.06) * (0.75 + 0.35 * vnoise(p * 20.0));
}

vec3 lampLight(vec3 p, vec3 n) {
  vec3 L = vec3(0);
  for (int i = 0; i < 8; i++) {
    if (uLI[i] <= 0.0) continue;
    vec3 d = lampPos(i) - p; float r2 = dot(d, d);
    L += uLampCol * uLI[i] * flick(float(i)) * max(dot(n, d * inversesqrt(r2)), 0.0) / (r2 + 0.15);
  }
  if (uAngelI > 0.0) {
    vec3 d = uAngel - p; float r2 = dot(d, d);
    L += uAngelCol * uAngelI * 6.0 * (0.25 + 0.75 * max(dot(n, d * inversesqrt(r2)), 0.0)) / (r2 + 1.0);
  }
  return L;
}
// in-scattered glow of a point light in the air (closed form of the 1/r^2 integral along the ray)
float pointGlow(vec3 ro, vec3 rd, vec3 c, float tmax) {
  vec3 oc = c - ro; float s0 = dot(oc, rd);
  float d2 = max(dot(oc, oc) - s0 * s0, 1e-4), d = sqrt(d2);
  return (atan((tmax - s0) / d) - atan(-s0 / d)) / d;
}
vec3 lampGlow(vec3 ro, vec3 rd, float tmax) {
  vec3 g = vec3(0);
  for (int i = 0; i < 8; i++) {
    if (uLI[i] <= 0.0) continue;
    vec3 lp = lampPos(i) - ro; float s = dot(lp, rd);
    if (s < 0.0 || s > tmax + 0.05) continue;
    float a2 = (dot(lp, lp) - s * s) / (s * s);
    g += uLampCol * uLI[i] * flick(float(i)) * (exp(-a2 * 2.0e6) * 5.0 + exp(-a2 * 1.5e4) * 0.12);
  }
  return g;
}
// the angel of the Lord: light only. A small unbearable core, a wide glow in the air, a slow breath.
vec3 angelGlow(vec3 ro, vec3 rd, float tmax) {
  if (uAngelI <= 0.0) return vec3(0);
  vec3 lp = uAngel - ro; float s = dot(lp, rd);
  float breath = 0.92 + 0.08 * sin(uTime * 1.3);
  float g = pointGlow(ro, rd, uAngel, tmax) * 0.025;
  vec3 c = uAngelCol * uAngelI * g * breath * (0.6 + uDust);
  if (s > 0.0 && s < tmax) {
    float a2 = (dot(lp, lp) - s * s) / (s * s);
    c += mix(uAngelCol, vec3(1.0), 0.6) * uAngelI * breath * (exp(-a2 * 6.0e4) * 4.0 + exp(-a2 * 900.0) * 0.25);
    // a faint vertical stream of light through the core
    vec3 rp = ro + rd * s - uAngel;
    c += uAngelCol * uAngelI * 0.2 * exp(-abs(rp.x * rp.x + rp.z * rp.z) * 40.0 / max(s * 0.02, 0.05)) * exp(-abs(rp.y) * 0.4) * breath;
  }
  return c;
}

// ================= shading =================
vec3 ambientSky() { return uAmbSky * 3.6 * uAmbK + vec3(0.006, 0.008, 0.014) * uNight; }
vec3 shadeSurface(vec3 p, vec3 n, vec3 rd, float m, float t, vec3 amb) {
  vec3 sd = SUNDIR();
  vec3 a = albedo(m, p, n, t) * (m < 1.5 ? 1.0 - 0.25 * uNight : 1.0);
  float sh = gCheap ? 1.0 : shadow(p + n * 0.03, sd);
  // the cloud deck's shadow on the land
  if (uCloud > 0.0) { float rim; float d = cloudDensity(p.xz + sd.xz * (uCloudH - p.y) / max(sd.y, 0.05), rim); sh *= mix(1.0, exp(-d * 4.0), uEye > 0.0 ? 1.0 : 0.55); }
  float occ = gCheap ? 0.8 : ao(p, n);
  float dif = max(dot(n, sd), 0.0);
  vec3 bounce = vec3(0.6, 0.42, 0.28) * dot(sunLit(), vec3(0.33)) * 0.04 * max(sd.y, 0.0);
  vec3 L = sunLit() * dif * sh + amb * (0.5 + 0.5 * n.y) * occ + bounce * (0.5 - 0.5 * n.y) * occ;
  L += lampLight(p, n) * (0.4 + 0.6 * occ);
  vec3 col = a * L;
  if (m < 1.5) {   // sand glints
    float g = step(0.996, hash12(floor(p.xz * 90.0))) * (1.0 - smoothstep(4.0, 18.0, t));
    vec3 h = normalize(sd - rd);
    col += sunLit() * g * pow(max(dot(n, h), 0.0), 30.0) * sh * 0.4 * uLand;
  }
  if (m > 10.5 && m < 11.5) {   // linen lit through from behind
    float back = pow(max(dot(rd, sd), 0.0), 3.0);
    col += vec3(0.14, 0.2, 0.6) * sunLit() * (0.02 + back * 0.3) * sh;
    col += uAngelCol * uAngelI * 0.02 * pow(max(dot(rd, normalize(uAngel - p)), 0.0), 3.0);
  }
  if (m > 4.5 && m < 8.5) {   // leaves pass a little light
    col += a * sunLit() * 0.18 * pow(max(dot(rd, sd), 0.0), 4.0);
  }
  if (m > 1.5 && m < 2.5) col += a * sunLit() * 0.2 * pow(1.0 - max(dot(n, -rd), 0.0), 4.0) * sh;
  return col;
}
// near-ground dust: extra haze in the lowest air, lit by the sun (warm forward glow)
vec3 dustFog(vec3 col, vec3 ro, vec3 rd, float t, vec3 amb) {
  if (uDust <= 0.0) return col;
  float k = 0.0009 * uDust;
  float H = uDustH;
  float a = k * H * exp(-max(ro.y, 0.0) / H) * (1.0 - exp(-t * rd.y / H)) / max(rd.y, 1e-4);
  if (abs(rd.y) < 1e-3) a = k * exp(-max(ro.y, 0.0) / H) * t;
  a = sat(1.0 - exp(-max(a, 0.0)));
  vec3 sd = SUNDIR();
  vec3 fc = amb * 0.25 + sunLit() * (0.1 + phaseM(dot(rd, sd), 0.65) * 1.2) * (1.0 - uNight) * vec3(1.0, 0.82, 0.62);
  return mix(col, fc, a);
}

// march the land and the things together
float gLastT = 0.0;
float march(vec3 ro, vec3 rd, out float mat, int steps, float tmax) {
  float t = 0.02, lastStep = 0.0; mat = 0.0;
  for (int i = 0; i < 360; i++) {
    if (i >= steps) break;
    vec3 p = ro + rd * t;
    gGroundH = terrainH(p.xz);
    float hT = (p.y - gGroundH) * 0.5;
    vec2 o = things(p);
    float eps = 0.0004 * t + 0.0006;
    if (o.x < eps && o.x <= hT) { mat = o.y; return t; }
    if (hT < eps) {
      float a = t - max(lastStep, 0.0), b = t;
      for (int k = 0; k < 8; k++) { float mm = 0.5 * (a + b); vec3 q = ro + rd * mm; if (q.y - terrainH(q.xz) > 0.0) a = mm; else b = mm; }
      mat = 1.0; return a;
    }
    lastStep = max(min(hT, o.x), 0.002 * t + 0.002);
    t += lastStep;
    if (t > tmax || (p.y > 700.0 && rd.y > 0.0)) break;
  }
  gLastT = t;
  // a grazing ray that ran out of steps just above the land: take the land where it stopped
  vec3 pe = ro + rd * t;
  if (t < tmax && rd.y < 0.02 && pe.y - terrainH(pe.xz) < 0.02 * t + 0.5) { mat = 1.0; return t; }
  return -1.0;
}

vec3 waterNormal(vec2 xz) {
  vec2 d = xz - uSrc;
  float r = length(d);
  vec2 g = vec2(0);
  // rings from where the spring wells up
  float k = 9.0, ph = r * k - uTime * 3.2;
  float amp = uRings * 0.02 * exp(-r * 0.45);
  g += (r > 1e-3 ? d / r : vec2(0)) * cos(ph) * k * amp;
  // the wind on the surface
  vec2 w = normalize(uWind);
  float e = 0.04;
  float n0 = fbm(xz * 1.6 + w * uTime * 0.35, 4), nx = fbm((xz + vec2(e, 0)) * 1.6 + w * uTime * 0.35, 4), nz = fbm((xz + vec2(0, e)) * 1.6 + w * uTime * 0.35, 4);
  g += vec2(nx - n0, nz - n0) / e * 0.012 * (1.0 - 0.8 * uEye);
  return normalize(vec3(-g.x, 1.0, -g.y));
}

vec3 world(vec2 fc) {
  vec3 ro; vec3 rd = camRay(fc, ro);
  vec3 sd = SUNDIR();
  gSunT = uSunT;
  gCamp = uTentsOn > 0.5 ? terrainH(uCamp.xz) : 0.0; gTree = uTreeOn > 0.5 ? terrainH(uTree.xz) : 0.0;
  gBush = uBushOn > 0.5 ? terrainH(uBush.xz) : 0.0; gWell = uWellOn > 0.5 ? terrainH(uWellP.xz) : 0.0;
  gVeil = uVeilOn > 0.5 ? terrainH(uVeil.xz) * step(0.5, uVeilTilt) + uVeil.y * 0.0 : 0.0;
  gSkin = uSkinOn > 0.5 ? terrainH(uSkin.xz) : 0.0;
  if (uVeilOn > 0.5 && uVeilTilt < 0.5) gVeil = 0.0;
  float m;
  float hit = march(ro, rd, m, 360, 6000.0);
  // the spring's water plane
  float tw = -1.0;
  if (uSpringOn > 0.5 && rd.y < 0.0 && ro.y > uWaterY) {
    float tt = (uWaterY - ro.y) / rd.y;
    vec3 pw = ro + rd * tt;
    if (length(pw.xz - uSpring.xz) < uSpringR * 1.6 && terrainH(pw.xz) < uWaterY && (hit < 0.0 || tt < hit)) tw = tt;
  }
  vec3 amb = ambientSky();
  vec3 col;
  float tmax;
  if (tw > 0.0) {
    tmax = tw;
    vec3 p = ro + rd * tw;
    vec3 n = waterNormal(p.xz);
    float fres = 0.02 + 0.9 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
    vec3 rr = reflect(rd, n);
    // reflection: the sky, and the palms and banks marched along the reflected ray
    float rm;
    float rh = march(p + n * 0.02, rr, rm, 90, 300.0);
    vec3 refl;
    if (rh > 0.0) {
      vec3 q = p + rr * rh;
      vec3 qn = rm < 1.5 ? terrainN(q, rh) : normalThing(q);
      gCheap = true; refl = shadeSurface(q, qn, rr, rm, rh, amb); gCheap = false;
    } else refl = sky(rr);
    refl += angelGlow(p, rr, 1e4) + lampGlow(p, rr, 1e4);
    // refraction: down to the sandy floor
    vec3 fr = refract(rd, n, 0.75);
    float tb = 0.0;
    vec3 q = p;
    for (int i = 0; i < 24; i++) { q = p + fr * tb; if (q.y < terrainH(q.xz)) break; tb += 0.06 + tb * 0.08; }
    float depth = max(uWaterY - terrainH(q.xz), 0.0);
    vec3 bn = terrainN(q, 1.0);
    vec3 ba = albedo(1.0, q, bn, 1.0) * 0.8;
    float caus = pow(sat(1.0 - abs(fbm(q.xz * 2.4 + uTime * 0.25, 3) - 0.5) * 4.0), 3.0);
    vec3 bl = sunLit() * max(sd.y, 0.0) * (0.6 + 1.6 * caus) + amb + lampLight(q, bn);
    vec3 absorb = exp(-(tb + depth * 2.0) * vec3(0.9, 0.3, 0.22));
    vec3 below = ba * bl * absorb + vec3(0.01, 0.035, 0.035) * amb * (1.0 - absorb);
    col = mix(below, refl, fres);
    // the sun's glitter on the ripples
    col += sunCol() * pow(max(dot(rr, sd), 0.0), 900.0) * 0.6 * (1.0 - uNight);
  } else if (hit < 0.0) {
    tmax = 1e7;
    col = sky(rd);
  } else {
    tmax = hit;
    vec3 p = ro + rd * hit;
    if (m < 1.5) p.y = terrainH(p.xz);
    vec3 n = m < 1.5 ? ripples(p, terrainN(p, hit), hit) : normalThing(p);
    if (m > 9.5 && m < 10.5) {   // the water deep in the well: a dark mirror
      vec3 rr = reflect(rd, normalize(vec3(0, 1, 0) + vec3(waterNormal(p.xz * 2.0).x, 0, waterNormal(p.xz * 2.0).z) * 0.3));
      col = sky(rr) * 0.5 + angelGlow(p, rr, 1e4) * 0.5;
      col *= smoothstep(0.75, 0.55, length(p.xz - uWellP.xz)) * 0.8 + 0.2;
    } else col = shadeSurface(p, n, rd, m, hit, amb);
    vec3 tr;
    vec3 ins = atmo(rd, hit * 6.0, tr);   // distances stretched: a desert's deep air
    col = col * tr + ins;
  }
  col = dustFog(col, ro, rd, min(tmax, 20000.0), amb);
  col += shafts(ro, rd, tmax);
  col += lampGlow(ro, rd, tmax);
  col += angelGlow(ro, rd, tmax);
  return col * uExp;
}
`;

// ---- the sky's light on the land, computed once per frame (the same single scattering as the shader) ----
const RE = 6360e3, RA = 6440e3, BR = [5.8e-6, 13.5e-6, 33.1e-6], BO = [0.65e-6, 1.881e-6, 0.085e-6];
const norm3 = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
function rsph(ro, rd, r) { const b = ro[0] * rd[0] + ro[1] * rd[1] + ro[2] * rd[2], c = ro[0] ** 2 + ro[1] ** 2 + ro[2] ** 2 - r * r, d = b * b - c; if (d < 0) return [1e9, -1e9]; const q = Math.sqrt(d); return [-b - q, -b + q]; }
function atmoJS(rd, sd, sunCol, mie) {
  const ro = [0, RE + 2, 0], bm = 4e-6 * mie;
  let tEnd = rsph(ro, rd, RA)[1]; const tg = rsph(ro, rd, RE); if (tg[0] > 0) tEnd = Math.min(tEnd, tg[0]);
  const mu = rd[0] * sd[0] + rd[1] * sd[1] + rd[2] * sd[2];
  const pr = 0.0597 * (1 + mu * mu), g = 0.76, g2 = g * g, pm = 0.1194 * (1 - g2) * (1 + mu * mu) / ((2 + g2) * Math.pow(Math.max(1 + g2 - 2 * g * mu, 1e-4), 1.5));
  const N = 24, dt = tEnd / N; let odR = 0, odM = 0; const sR = [0, 0, 0], sM = [0, 0, 0];
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) * dt, p = ro.map((v, k) => v + rd[k] * t), h = Math.hypot(...p) - RE;
    const dR = Math.exp(-h / 7994) * dt, dM = Math.exp(-h / 1200) * dt; odR += dR; odM += dM;
    const lt = rsph(p, sd, RA)[1] / 8; let lR = 0, lM = 0, blocked = false;
    for (let j = 0; j < 8; j++) { const q = p.map((v, k) => v + sd[k] * (j + 0.5) * lt), hh = Math.hypot(...q) - RE; if (hh < 0) { blocked = true; break; } lR += Math.exp(-hh / 7994) * lt; lM += Math.exp(-hh / 1200) * lt; }
    if (blocked) continue;
    for (let k = 0; k < 3; k++) { const a = Math.exp(-((BR[k] + BO[k]) * (odR + lR) + bm * 1.1 * (odM + lM))); sR[k] += dR * a; sM[k] += dM * a; }
  }
  return [0, 1, 2].map((k) => sunCol[k] * (sR[k] * BR[k] * pr + sM[k] * bm * pm));
}
function sunTransJS(sd, mie) {
  const ro = [0, RE + 2, 0]; if (rsph(ro, sd, RE)[0] > 0) return [0, 0, 0];
  const L = rsph(ro, sd, RA)[1] / 16; let oR = 0, oM = 0;
  for (let i = 0; i < 16; i++) { const h = Math.hypot(...ro.map((v, k) => v + sd[k] * (i + 0.5) * L)) - RE; oR += Math.exp(-h / 7994) * L; oM += Math.exp(-h / 1200) * L; }
  return [0, 1, 2].map((k) => Math.exp(-((BR[k] + BO[k]) * oR + 4e-6 * mie * 1.1 * oM)));
}
export function skyLight(u) {
  const sd = norm3(Array.from(u.uSunDir.value.toArray ? u.uSunDir.value.toArray() : u.uSunDir.value));
  const sc = Array.from(u.uSunCol.value.toArray ? u.uSunCol.value.toArray() : u.uSunCol.value);
  const mie = u.uMie.value;
  const a = atmoJS(norm3([0, 1, 0.25]), sd, sc, mie), b = atmoJS(norm3([0.6, 0.5, 0.0]), sd, sc, mie), c = atmoJS(norm3([-0.6, 0.5, 0.0]), sd, sc, mie);
  const amb = [0, 1, 2].map((k) => 0.5 * a[k] + 0.25 * (b[k] + c[k]));
  const st = sunTransJS(sd, mie);
  const set = (U, v) => { if (U.value.set) U.value.set(...v); else U.value = v; };
  set(u.uAmbSky, amb); set(u.uSunT, st);
}

// ---- camera helpers ----
export const lerp = (a, b, p) => a.map((v, i) => v + (b[i] - v) * p);
export function glide(P, t) {
  const x = Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return 0.25 * x + 0.75 * ease.inOut3(x);
}
export function cam(P, t, a, b, extra = {}) {
  const p = glide(P, t);
  return { pos: lerp(a.pos, b.pos, p), target: lerp(a.target, b.target, p), fov: (a.fov ?? 40) + ((b.fov ?? a.fov ?? 40) - (a.fov ?? 40)) * p, roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * p, ...extra };
}
export function setLamps(u, lamps) {
  const L = u.uL.value, I = u.uLI.value;
  for (let i = 0; i < 8; i++) {
    const l = lamps[i];
    if (l) { L[i * 3] = l[0]; L[i * 3 + 1] = l[1]; L[i * 3 + 2] = l[2]; I[i] = l[3]; } else I[i] = 0;
  }
}
export { keys, ease };
