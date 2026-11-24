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
  uShrubs: 0, uAperture: 0, uFocus: 10, uDropOn: 0, uDrop: [0, 0], uDropT: 0, uFlap: 1,
  uLineOn: 0, uLine: [0, 0, 0], uLineYaw: 0,
  uVeilOn: 0, uVeil: [0, 0, 0], uVeilYaw: 0, uVeilTilt: 0.2, uVeilBlow: 0.5,
  uSkinOn: 0, uSkin: [0, 0, 0], uSkinYaw: 0, uSkinEmpty: 0,
  uAmbSky: [0.1, 0.12, 0.16], uSunT: [1, 1, 1],
  uAngel: [0, 2, 0], uAngelI: 0, uAngelCol: [1.0, 0.86, 0.62],
  uLampCol: [1.0, 0.58, 0.24], uL: new Array(24).fill(0), uLI: new Array(8).fill(0),
};

export const WORLD_GLSL = /* glsl */ `
uniform vec3 uAmbSky, uSunT, uLine;
uniform float uLineOn, uLineYaw, uShrubs, uAperture, uFocus, uDropOn, uDropT, uFlap;
uniform vec2 uDrop;
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
vec2 gFr = vec2(0), gFrT = vec2(0);   // where on a frond the nearest palm leaf was hit (along it, across it)
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
  float eh = length((l + vec2(0.085, 0.0)) / vec2(0.05, 0.036)), eb = length((l - vec2(0.045, 0.006)) / vec2(0.075, 0.05)), et = length((l - vec2(0.125, -0.012)) / vec2(0.028, 0.034)), ea = length((l + vec2(0.02, -0.014)) / vec2(0.085, 0.026));
  e = min(min(eh, eb), min(et, ea * 1.05));
  float dent = (1.0 - smoothstep(0.55, 1.08, e)) * 0.034 * (0.85 + 0.3 * smoothstep(0.0, 0.1, l.x));
  float rim = smoothstep(0.9, 1.2, e) * (1.0 - smoothstep(1.2, 1.9, e)) * 0.008;
  // the wind fills the older steps first
  float age = 1.0 - idx / max(uStepsN, 1.0);
  float fill = sat(uStepsFill * (0.4 + 1.2 * age));
  return (-dent + rim) * (1.0 - fill);
}
float terrainH(vec2 p) {
  float r = length(p - uFlat.xz);
  float near = (fbm(p * 0.35, 2) - 0.5) * (uTentsOn > 0.5 ? mix(0.03, 0.16, smoothstep(7.0, 22.0, length(p - uCamp.xz))) : 0.16) + (uLand > 0.5 ? 0.0 : (vnoise(p * 14.0) - 0.5) * 0.008);
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
  if (uWellOn > 0.5) { float dw = length(p - uWellP.xz); h += 0.22 * exp(-(dw - 1.35) * (dw - 1.35) * 3.0) * (0.7 + 0.6 * vnoise(p * 2.0)) * step(1.25, dw); }
  return h;
}
vec3 terrainN(vec3 p, float t) {
  float e = 0.01 + t * 0.0015;
  return normalize(vec3(terrainH(p.xz - vec2(e, 0)) - terrainH(p.xz + vec2(e, 0)), 2.0 * e,
                        terrainH(p.xz - vec2(0, e)) - terrainH(p.xz + vec2(0, e))));
}
// wind ripples in the sand, as a bump on the normal; faded out with distance before they alias
vec3 ripples(vec3 p, vec3 n, float t) {
  float k = 0.7 * (uSpringOn > 0.5 ? smoothstep(uSpringR * 1.8, uSpringR * 3.2, length(p.xz - uSpring.xz)) : 1.0) * (1.0 - smoothstep(6.0, 45.0, t)) * uDunes * step(0.5, uLand) * smoothstep(0.75, 0.95, n.y);
  if (k <= 0.0) return n;
  vec2 q = windFrame(p.xz);
  { float kk = 0.5 * (1.0 - smoothstep(14.0, 70.0, t)); float a1 = (q.x + 2.2 * fbm(q * vec2(0.16, 0.07), 2)) / 1.7; float f1 = fract(a1); float s1 = f1 < 0.7 ? 0.7 : -1.6; vec2 ww = normalize(uWind); n = normalize(n - vec3(ww.x, 0, ww.y) * s1 * 0.10 * kk * smoothstep(0.3, 0.65, vnoise(q * 0.09))); }
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

// a black goat-hair tent, 8 by 4.5 m: cloth sagging between the poles, high over the open front,
// sloping to the back, a valance along the front edge that moves in the wind, ropes that sag
float catenary(vec3 p, vec3 a, vec3 b, float sag, float r) {
  vec3 m = 0.5 * (a + b) - vec3(0, sag, 0);
  return min(sdCapsule(p, a, m, r), sdCapsule(p, m, b, r));
}
float sdTent(vec3 p, float s) {
  p /= s;
  float bay = 0.5 - 0.5 * cos(p.x * 6.2832 / 2.7);
  float roof = 2.0 - 0.34 * bay - 0.2 * (2.2 - p.z) - 0.1 * (0.5 - 0.5 * cos(p.z * 6.2832 / 2.2)) - 0.03 * max(abs(p.x) - 3.2, 0.0) * max(abs(p.x) - 3.2, 0.0);
  float pleat = 0.035 * sin(p.x * 5.2 + sin(p.y * 2.3)) * (1.0 - smoothstep(0.9, 1.6, p.y)) + 0.03 * sin(p.z * 6.1 + sin(p.y * 2.0)) * (1.0 - smoothstep(0.9, 1.6, p.y));
  float wallX = (abs(p.x) - 4.25 + 0.24 * p.y + pleat) * 0.95;
  float wallZ = (abs(p.z) - 2.45 + 0.2 * p.y * step(p.z, 0.0) + pleat) * 0.95;
  float outer = max(max(wallX, wallZ), (p.y - roof) * 0.85);
  outer = max(outer, -0.5 - p.y);   // the cloth runs into the ground; no floor
  float d = abs(outer) - 0.022;
  d = max(d, -sdBox(p - vec3(0.0, 0.85, 2.5), vec3(3.5, 0.85, 0.55)));
  float vy = 2.0 - 0.34 * bay;
  float wv = 0.07 * sin(p.x * 2.3 - uTime * 2.2) * uFlap * smoothstep(vy, vy - 0.4, p.y);   // ark-shake-ok: cloth in the wind
  float val = max(max(abs(p.z - 2.42 - wv) - 0.014, abs(p.x) - 3.7), max(p.y - vy, vy - 0.36 - p.y + 0.07 * abs(sin(p.x * 3.6))));
  d = min(d, val * 0.75);
  vec3 q = p; q.x = abs(q.x);
  float poles = min(sdCapsule(q, vec3(1.35, 0, 2.4), vec3(1.35, 2.0, 2.4), 0.04), sdCapsule(q, vec3(3.7, 0, 2.4), vec3(3.7, 1.9, 2.4), 0.036));
  float ropes = min(catenary(q, vec3(3.7, 1.85, 2.4), vec3(5.4, 0.0, 3.9), 0.12, 0.011), catenary(q, vec3(1.35, 1.95, 2.4), vec3(1.9, 0.0, 4.9), 0.14, 0.011));
  ropes = min(ropes, catenary(q, vec3(4.0, 1.1, -2.2), vec3(5.4, 0.0, -3.6), 0.08, 0.011));
  return min(d, min(poles, ropes)) * s;
}
float sdRug(vec3 p, float s) { p /= s; return (sdBox(p - vec3(0, 0.045, 0.6), vec3(2.1, 0.02, 0.95)) - 0.008) * s; }
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
  float d = sdRoundCone(p, vec3(0, -0.2, 0), vec3(0.18, 1.5, 0.1), 0.24, 0.15) + (vnoise(p * vec3(9, 2, 9)) - 0.5) * 0.05;
  d = smin(d, sdRoundCone(p, vec3(0.18, 1.45, 0.1), vec3(1.0, 2.5, 0.4), 0.13, 0.075), 0.12); d = smin(d, sdRoundCone(p, vec3(1.0, 2.5, 0.4), vec3(2.3, 3.5, 0.7), 0.075, 0.025), 0.06);
  d = smin(d, sdRoundCone(p, vec3(0.18, 1.45, 0.1), vec3(-0.8, 2.6, -0.2), 0.12, 0.07), 0.12); d = smin(d, sdRoundCone(p, vec3(-0.8, 2.6, -0.2), vec3(-2.1, 3.4, -0.5), 0.07, 0.022), 0.06);
  d = smin(d, sdRoundCone(p, vec3(0.2, 1.5, 0.1), vec3(0.3, 2.8, -0.9), 0.1, 0.06), 0.1); d = smin(d, sdRoundCone(p, vec3(0.3, 2.8, -0.9), vec3(0.6, 3.8, -1.9), 0.06, 0.02), 0.05);
  d = min(d, sdRoundCone(p, vec3(1.0, 2.5, 0.4), vec3(1.5, 3.7, -0.6), 0.055, 0.018)); d = min(d, sdRoundCone(p, vec3(-0.8, 2.6, -0.2), vec3(-0.5, 3.8, 0.9), 0.055, 0.018));
  return d * 0.85;
}
float sdAcaciaLeaves(vec3 p) {
  float w = (fbm(p.xz * 0.9, 2) - 0.5) * 0.5; vec3 q = p; q.y -= w;
  float d = sdEllipsoid(q - vec3(0.3, 4.0, -0.6), vec3(2.0, 0.2, 1.7));
  d = min(d, sdEllipsoid(q - vec3(2.3, 3.62, 0.6), vec3(1.6, 0.17, 1.25))); d = min(d, sdEllipsoid(q - vec3(-2.1, 3.5, -0.5), vec3(1.5, 0.17, 1.2)));
  d = min(d, sdEllipsoid(q - vec3(0.5, 3.75, -2.1), vec3(1.4, 0.16, 1.0))); d = min(d, sdEllipsoid(q - vec3(-0.5, 3.85, 1.1), vec3(1.3, 0.16, 0.95)));
  if (d < 0.6) d += (fbm(p * 2.6, 3) - 0.5) * 0.34;
  return d * 0.8;
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
  float r = mix(0.2, 0.14, yy) + 0.07 * exp(-p.y * 3.0) + 0.05 * smoothstep(0.93, 1.0, yy);
  float trunk = max(length(q.xz) - r - 0.006 * abs(sin(p.y * 17.0 + 1.5 * sin(atan(q.z, q.x) * 3.0))), abs(p.y - hgt * 0.5) - hgt * 0.5) * 0.8;
  vec3 c = p - vec3(bend, hgt, 0);
  if (length(c) > 4.6) { float sph = length(c) - 4.0; if (sph < trunk) frond = 1.0; return min(trunk, sph); }
  float best = 1e9;
  for (int layer = 0; layer < 2; layer++) {
    float N = layer == 0 ? 11.0 : 9.0;
    float sec = 6.2832 / N;
    float a = atan(c.z, c.x) + float(layer) * 0.4;
    float id = floor(a / sec + 0.5);
    float aa = a - id * sec;
    float h = hash11(id * 3.7 + float(layer) * 11.0);
    float L = 2.9 + 0.9 * h;
    float up = layer == 0 ? 0.9 : 0.25;           // the young fronds stand up, the old ones arch over
    float droop = layer == 0 ? 0.2 : 0.32;
    float rl = length(c.xz);
    vec3 f = vec3(rl * cos(aa), c.y, rl * sin(aa));
    float x = clamp(f.x, 0.0, L);
    float yMid = up * x - droop * x * x;
    float w = 0.5 * pow(sin(3.1416 * clamp(x / L, 0.02, 0.985)), 0.5);
    float az = abs(f.z);
    float dy = f.y - yMid + az * 0.5;              // leaflets fold up in a V from the midrib
    float dd = max(max(abs(dy) - 0.012, az - w), max(-f.x, f.x - L));
    if (dd * 0.55 < best) gFrT = vec2(x, az / max(w, 0.02));
    best = min(best, dd * 0.55);
  }
  if (best < trunk) frond = 1.0;
  return min(trunk, best);
}
// the well-head: a ring of rough fieldstone laid in mortar round a dark shaft, a beam across on two posts
vec4 wellCell(vec3 p) {   // local coordinates in the stone nearest, and its id
  const float H = 0.185, R = 1.05; float row = clamp(floor(p.y / H), -1.0, 3.0);
  float n = 13.0, W = 6.2832 * R / n, u = (atan(p.z, p.x) / 6.2832 + 0.5) * n + 0.5 * mod(row, 2.0) + 0.13 * hash11(row + 4.0);
  float id = mod(floor(u), n) + row * 31.0;
  float shift = (hash11(id * 1.7 + 2.0) - 0.5) * 0.06;
  return vec4((fract(u) - 0.5) * W + shift, p.y - (row + 0.5) * H, length(p.xz) - R, id);
}
float sdWellHead(vec3 p) {
  vec4 c = wellCell(p); float h1 = hash11(c.w * 3.1), h2 = hash11(c.w * 5.7 + 1.0), h3 = hash11(c.w * 9.3 + 2.0);
  vec3 b = vec3(0.2 + 0.03 * h1, 0.068 + 0.02 * h2, 0.24 + 0.07 * h3);
  vec3 q = c.xyz; q.xy = rot((h1 - 0.5) * 0.16) * q.xy;
  float r = 0.05; float st = sdBox(q, b - r) - r + (vnoise(p * 7.0) - 0.5) * 0.05 + (vnoise(p * 23.0) - 0.5) * 0.014;
  st = max(st, p.y - 0.75 - 0.05 * h2);
  float core = max(max(abs(length(p.xz) - 1.05) - 0.2, p.y - 0.66), -p.y - 0.4) + (vnoise(p * 15.0) - 0.5) * 0.02;
  float beam = sdBox(p - vec3(0, 1.62, 0), vec3(1.6, 0.06, 0.07)) - 0.015 + (vnoise(p * vec3(3, 18, 18)) - 0.5) * 0.02;
  vec3 k = p; k.x = abs(k.x);
  float posts = sdCapsule(k, vec3(1.5, -0.2, 0), vec3(1.44, 1.72, 0), 0.075) + (vnoise(p * vec3(18, 3, 18)) - 0.5) * 0.02;
  float rope = min(sdCapsule(p, vec3(0.1, 1.6, 0), vec3(0.1, 0.1, 0.03), 0.013), sdTorus((p - vec3(0.1, 1.62, 0)).yxz, vec2(0.085, 0.016)));
  return min(min(st, core) * 0.6, min(min(beam, posts) * 0.8, rope));
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
  if (uTentsOn > 0.5 && uLI[0] > 0.0) {   // a clay lamp on its stand
    vec3 q = p - lampPos(0); float b = length(q) - 1.2;
    if (b > 0.4) r = opU(r, vec2(b, -1)); else r = opU(r, vec2(min(sdEllipsoid(q + vec3(0, 0.07, 0), vec3(0.11, 0.045, 0.085)), sdCapsule(q, vec3(0, -0.09, 0), vec3(0, -lampPos(0).y, 0), 0.02)), 4));
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
      float a = fi * 2.1 - 0.5;
      vec3 base = uSpring + vec3(cos(a), 0, sin(a)) * (uSpringR * 1.25 + fi * 0.7);
      base.y = uSpring.y - 0.05;
      vec3 q = p - base; q.xz = rot(a + 1.4) * q.xz;
      float hgt = 6.5 + fi * 1.6;
      float b = sdBox(q - vec3(0.6, hgt * 0.5 + 1.0, 0), vec3(5.0, hgt * 0.5 + 3.0, 5.0));
      if (b > 0.5) { r = opU(r, vec2(b, -1)); continue; }
      float fr;
      float d = sdPalm(q, hgt, 0.5 + 0.35 * fi, fr);
      if (d < r.x && fr > 0.5) gFr = gFrT;
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
  if (uShrubs > 0.0 && p.y - gGroundH > 1.8) r = opU(r, vec2(p.y - gGroundH - 1.6, -1));
  else if (uShrubs > 0.0) {   // scattered scrub: low dark bushes, one at most in each 5 m cell
    vec2 c = floor(p.xz / 5.0);
    vec2 h = hash22(c + 17.0);
    float clump = smoothstep(0.5, 0.72, fbm(c * 0.09 + 5.0, 3));
    if (h.x < uShrubs * clump * 1.8) {
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
        if (hash11(c.x * 7.1 + c.y * 3.3) > 0.62) {   // a half-buried stone instead of a bush
          float st = sdEllipsoid(q - vec3(0, -rr * 0.12, 0), vec3(rr * 0.8, rr * 0.38, rr * 0.6)) + (vnoise(q * 9.0) - 0.5) * 0.04;
          r = opU(r, vec2(st * 0.8, 15));
        } else r = opU(r, vec2(d * 0.6, 6));
      } else r = opU(r, vec2(max(length(dxz) - rr - 0.9, 0.3), -1));
    }
  }
  if (uDropOn > 0.5 && uTime < uDropT && !gShadowPass) {
    float tt = uDropT - uTime;
    vec3 c = vec3(uDrop.x, uWaterY + 0.03 + 4.9 * tt * tt, uDrop.y);
    float b = length(p - c);
    r = opU(r, vec2(b > 0.5 ? b - 0.4 : sdEllipsoid(p - c, vec3(0.012, 0.016, 0.012)), 16));
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

// is this point of a leaf surface a gap between leaflets (8) or between acacia leaves (5)?
bool leafGap(float m, vec3 p) {
  if (m > 7.5 && m < 8.5) { float s = abs(fract((gFr.x + gFr.y * 0.35) * 8.0) - 0.5); return gFr.y > 0.09 && s > 0.5 * (0.86 - 0.62 * gFr.y); }
  if (m > 4.5 && m < 5.5) return vnoise(p * 7.0) * 0.6 + vnoise(p * 19.0) * 0.4 > 0.5;
  return false;
}
// the veil as a real sheet: a smooth height over its own plane, found along the ray by sign change
float veilWave(vec2 u) {
  float b = uVeilBlow, t = uTime;
  if (uVeilTilt > 1.3) {   // lying: crumpled into soft ridges
    vec2 q = u * vec2(3.4, 1.5) + 3.0; float r1 = sqrt(pow(2.0 * vnoise(q + 0.6 * vnoise(q * 1.3)) - 1.0, 2.0) + 0.01), r2 = sqrt(pow(2.0 * vnoise(q * 2.1 + 7.0) - 1.0, 2.0) + 0.015);
    float ed = smoothstep(0.0, 0.22, u.y) * smoothstep(1.35, 1.1, u.y) * smoothstep(0.55, 0.36, abs(u.x));
    return 0.012 + (0.11 * (1.0 - r1) + 0.04 * (1.0 - r2)) * (0.25 + 0.75 * ed);
  }
  float v = clamp(u.y / 1.35, 0.0, 1.0);
  float fold = 0.055 * sin(u.x * 13.0 + 1.2 * sin(u.y * 2.1)) + 0.025 * sin(u.x * 29.0 + 2.0 * sin(u.y * 3.3));   // gathers from the line
  float wind = (0.10 + 0.22 * b) * b * v * sin(u.y * 3.4 - t * 5.0 + u.x * 1.8) + 0.07 * b * v * sin(u.y * 6.1 - t * 8.2 + u.x * 5.0);   // ark-shake-ok: cloth in the wind
  return fold * (0.35 + 0.65 * v) + wind + 0.3 * b * v * v;
}
vec2 veilXZ(vec2 u) { vec2 q = vec2(u.x, u.y * sin(uVeilTilt)); return uVeil.xz + q * rot(uVeilYaw); }
float gVeilT; vec3 gVeilN; vec2 gVeilUV;
bool veilFrame(vec3 p, out vec3 q) { q = p - uVeil - vec3(0, gVeil, 0); q.xz = rot(uVeilYaw) * q.xz; return true; }
float veilF(vec3 q, out vec2 u) {
  vec3 dir = vec3(0, -cos(uVeilTilt), sin(uVeilTilt)), n = vec3(0, sin(uVeilTilt), cos(uVeilTilt));
  u = vec2(q.x, dot(q, dir)); float w = veilWave(u);
  if (uVeilTilt > 1.3) w = w * 0.62 + 0.03 + (terrainH(veilXZ(u)) - gVeil); else w += uVeilBlow * uVeilBlow * 0.34 * u.x * sin(u.y * 2.6 + uTime * 2.1) * smoothstep(0.6, 1.0, uVeilTilt);   // ark-shake-ok: cloth turning in the wind
  return dot(q, n) - w;
}
float veilHit(vec3 ro, vec3 rd, float tmax) {
  if (uVeilOn < 0.5) return -1.0;
  vec3 q0, q1; veilFrame(ro, q0); veilFrame(ro + rd, q1); vec3 d = q1 - q0;
  vec3 c = vec3(0, -0.65 * cos(uVeilTilt), 0.65 * sin(uVeilTilt));
  float b = dot(q0 - c, d), cc = dot(q0 - c, q0 - c) - 1.5, h = b * b - cc; if (h < 0.0) return -1.0;
  h = sqrt(h); float t0 = max(-b - h, 0.0), t1 = min(-b + h, tmax); if (t1 <= t0) return -1.0;
  const int N = 44; float dt = (t1 - t0) / float(N), pt = t0; vec2 u; float pf = veilF(q0 + d * t0, u);
  for (int i = 1; i <= N; i++) {
    float t = t0 + dt * float(i); float f = veilF(q0 + d * t, u);
    if (f * pf < 0.0) {
      float a = pt, e = t; for (int k = 0; k < 7; k++) { float m = 0.5 * (a + e); vec2 uu; if (veilF(q0 + d * m, uu) * pf > 0.0) a = m; else e = m; }
      vec3 q = q0 + d * a; veilF(q, u);
      float hem = 0.03 * sin(u.x * 9.0) + 0.02 * (vnoise(u * 7.0) - 0.5), side = 0.04 * sin(u.y * 6.0) + 0.05 * (vnoise(u.yx * 5.0) - 0.5) + (uVeilTilt > 1.3 ? 0.15 * (vnoise(u * 2.3 + 5.0) - 0.45) : 0.0); hem += uVeilTilt > 1.3 ? 0.2 * (vnoise(vec2(u.x * 2.6, 9.0)) - 0.5) : 0.0;
      if (abs(u.x) < 0.5 + 0.06 * u.y + side && u.y > 0.0 && u.y < 1.35 + hem) {
        float ep = 0.004; vec2 x; float g0 = veilF(q, x);
        vec3 g = vec3(veilF(q + vec3(ep, 0, 0), x) - g0, veilF(q + vec3(0, ep, 0), x) - g0, veilF(q + vec3(0, 0, ep), x) - g0);
        g = normalize(g); g.xz = g.xz * rot(uVeilYaw); gVeilN = dot(g, rd) > 0.0 ? -g : g; gVeilUV = u; return a;
      }
    }
    pf = f; pt = t;
  }
  return -1.0;
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
  { float ly = dot(c, vec3(0.3, 0.5, 0.2)); c = mix(c, vec3(ly) * vec3(1.02, 0.98, 0.98), 0.24 * (1.0 - uNight)); c.g *= 0.97; }
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
  vec3 nMW = normalize(vec3(0.85, 0.35, 0.1));
  float band = exp(-pow(dot(d, nMW) / 0.22, 2.0)) * uMilky;
  vec3 c = vec3(0);
  c += starLayer(d, 60.0, 0.07, 1.0, px) * 1.4;
  c += starLayer(d, 150.0, 0.04 + 0.14 * band, 2.0, px) * 0.75;
  c += starLayer(d, 330.0, 0.02 + 0.2 * band, 3.0, px) * 0.4;
  float dust = fbm(d * 9.0, 5);
  c += band * vec3(0.2, 0.2, 0.25) * (0.55 + 0.6 * dust) * (0.7 + 0.6 * fbm(d * 22.0, 3));
  { float lane = exp(-pow((dot(d, nMW) + 0.06 * (fbm(d * 7.0, 3) - 0.5)) / 0.05, 2.0)); c *= mix(1.0, 0.45, uMilky * lane * smoothstep(0.35, 0.65, fbm(d * 5.0 + 3.0, 3))); }
  return c * uStarGain * 0.62;
}

// ================= light =================
float gShT0 = 0.0;
float shadow(vec3 ro, vec3 rd) {
  gShadowPass = true;
  float res = 1.0, ph = 1e10;
  float t = gShT0 + 0.02 + 0.05 * hash12(gl_FragCoord.xy + fract(uTime * 13.7) * 91.0);
  for (int i = 0; i < 56; i++) {
    vec3 p = ro + rd * t;
    gGroundH = terrainH(p.xz);
    vec2 o = things(p);
    float hg = (p.y - gGroundH) * 0.6;
    bool leaf = (o.y > 7.5 && o.y < 8.5) || (o.y > 4.5 && o.y < 5.5);
    if (leaf && o.x < 0.02) { if (!leafGap(o.y, p)) { res = min(res, 0.12); break; } t += 0.06; continue; }
    float h = (o.y < 0.0 || leaf) ? hg : min(o.x, hg);
    float stepH = min(o.x, hg);
    float y = h * h / (2.0 * ph); float d = sqrt(max(h * h - y * y, 0.0));
    float kk = (o.y > 4.5 && o.y < 5.5) || (o.y > 7.5 && o.y < 8.5) ? 90.0 : 26.0;
    res = min(res, kk * d / max(t - y, 1e-3));
    ph = h;
    if (res < 0.002 || t > 260.0) break;
    t += clamp(stepH, 0.02, 3.0 + t * 0.15);
  }
  gShadowPass = false;
  if (uVeilOn > 0.5 && res > 0.02) { vec3 kn = gVeilN; vec2 ku = gVeilUV; if (veilHit(ro + rd * 0.05, rd, 30.0) > 0.0) res *= 0.22; gVeilN = kn; gVeilUV = ku; }
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
      { float g1 = 1.0 - smoothstep(4.0, 22.0, t), g2 = 1.0 - smoothstep(1.0, 7.0, t); a *= 1.0 + 0.16 * (vnoise(p.xz * 26.0) - 0.5) * g1 + (0.2 * (vnoise(p.xz * 160.0) - 0.5) + 0.22 * (vnoise(p.xz * 420.0) - 0.5) * (1.0 - smoothstep(0.5, 2.5, t))) * g2; }
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
      float rock = smoothstep(0.7, 0.85, fbm(p.xz * 0.08 + 9.0, 4)) * 0.6 + 0.0 * step(0.97, hash12(floor(p.xz * 2.0))) * (1.0 - smoothstep(0.12, 0.2, length(fract(p.xz * 2.0) - 0.5))) * (1.0 - smoothstep(10.0, 30.0, t)) * 0.35;
      a = mix(a, lime * (0.8 + 0.25 * vnoise(p.xz * 4.0)), max(rock * 0.8, smoothstep(0.35, 0.6, 1.0 - n.y) * 0.6));
      float tuft = smoothstep(0.6, 0.85, fbm(p.xz * 0.9, 3)) * (1.0 - rock);
      a = mix(a, scrub, tuft * 0.25);
      { float g1 = 1.0 - smoothstep(5.0, 30.0, t), g2 = 1.0 - smoothstep(1.5, 9.0, t); a *= 1.0 + 0.35 * (vnoise(p.xz * 24.0) - 0.5) * g1 + 0.45 * (vnoise(p.xz * 75.0) - 0.5) * g2 + 0.14 * (fbm(p.xz * 1.3, 3) - 0.5); vec2 pc = floor(p.xz * 9.0); vec2 pq = fract(p.xz * 9.0) - 0.5 - (hash22(pc) - 0.5) * 0.5; float pr = 0.1 + 0.2 * hash12(pc + 3.0); float peb = step(0.8, hash12(pc)) * (1.0 - smoothstep(pr * 0.6, pr, length(pq))) * (1.0 - smoothstep(3.0, 14.0, t)); a = mix(a, vec3(0.4, 0.35, 0.28) * (0.6 + 0.7 * hash12(pc + 9.0)), peb * 0.8); float straw = smoothstep(0.62, 0.8, fbm(p.xz * 0.8 + 4.0, 3)) * (0.5 + 0.5 * vnoise(p.xz * vec2(60.0, 9.0))) * g1; a = mix(a, vec3(0.42, 0.34, 0.17), straw * 0.45); }
    }
    // wet sand at the water's edge
    if (uSpringOn > 0.5) {
      float wet = 1.0 - smoothstep(uWaterY, uWaterY + 0.18, p.y);
      float dS = length(p.xz - uSpring.xz);
      a *= mix(1.0, 0.55, wet * (1.0 - smoothstep(uSpringR * 1.2, uSpringR * 1.7, dS)));
      float green = (1.0 - smoothstep(uSpringR * 1.1, uSpringR * 2.3, dS + (fbm(p.xz * 0.8, 3) - 0.5) * 3.0)) * smoothstep(uWaterY + 0.05, uWaterY + 0.25, p.y);
      a = mix(a, vec3(0.12, 0.15, 0.06) * (0.55 + 0.5 * vnoise(p.xz * 6.0) + 0.5 * (vnoise(p.xz * 34.0) - 0.5) + 0.9 * (vnoise(p.xz * vec2(120.0, 95.0)) - 0.5) * (1.0 - smoothstep(2.0, 12.0, t))), green * 0.85);
    }
    return a;
  }
  if (m < 2.5) { float k = abs(n.y) > 0.55 ? p.z * 1.25 + 40.0 : p.y * 1.5, id = floor(k), e = abs(fract(k) - 0.5); vec3 c = mix(vec3(0.115, 0.08, 0.055), vec3(0.3, 0.215, 0.14), step(0.62, hash11(id * 3.7))); c = mix(c, vec3(0.2, 0.15, 0.1), step(0.45, hash11(id * 9.1 + 2.0)) * 0.6); float far = smoothstep(60.0, 8.0, t); float weave = (vnoise(vec2(p.x * 70.0, k * 45.0)) - 0.5) * smoothstep(4.0, 1.0, t) + (fbm(p * vec3(1.6, 2.2, 1.6), 3) - 0.5) * 0.7 * far; return c * (1.0 + 0.5 * weave) * (0.55 + 0.45 * smoothstep(0.5, 0.47, e)); }
  if (m < 3.5) return vec3(0.2, 0.14, 0.085) * (0.8 + 0.4 * vnoise(p * 20.0));
  if (m < 4.5) return vec3(0.13, 0.09, 0.065) * (0.7 + 0.5 * vnoise(p * vec3(4, 14, 4)));
  if (m < 5.5) return vec3(0.15, 0.18, 0.075) * (0.6 + 0.8 * vnoise(p * 13.0));
  if (m < 6.5) return vec3(0.1, 0.11, 0.065) * (0.6 + 0.8 * vnoise(p * 9.0));
  if (m < 7.5) return vec3(0.2, 0.15, 0.1) * (0.6 + 0.5 * smoothstep(0.2, 0.8, fract(p.y * 4.5)));
  if (m < 8.5) return mix(vec3(0.13, 0.2, 0.07), vec3(0.3, 0.27, 0.11), smoothstep(0.55, 1.0, gFr.x / 3.4)) * (0.75 + 0.4 * hash11(floor((gFr.x + gFr.y * 0.35) * 8.0)));
  if (m < 9.5) { vec3 wq = p - uWellP - vec3(0, gWell, 0); if (length(wq.xz) < 1.42 && wq.y < 0.85) { vec4 c = wellCell(wq); float h = hash11(c.w * 2.3); vec3 st = mix(mix(vec3(0.55, 0.43, 0.3), vec3(0.42, 0.36, 0.3), h), vec3(0.62, 0.53, 0.4), hash11(c.w * 7.7) * 0.6); st *= 0.72 + 0.35 * vnoise(p * 9.0) + 0.2 * (vnoise(p * 41.0) - 0.5); float joint = smoothstep(0.0, 0.05, 0.2 - abs(c.x)) * smoothstep(0.0, 0.03, 0.075 - abs(c.y)); return mix(vec3(0.34, 0.29, 0.22) * (0.8 + 0.3 * vnoise(p * 30.0)), st, joint); } return vec3(0.24, 0.16, 0.1) * (0.65 + 0.5 * vnoise(p * vec3(26, 4, 26))); }
  if (m > 14.5) return vec3(0.34, 0.27, 0.2) * (0.6 + 0.5 * vnoise(p * 7.0));
  if (m > 12.5) { float st = step(0.5, fract(p.z * 3.0 + 0.25 * step(0.5, fract(p.x * 1.5)))); return mix(vec3(0.26, 0.12, 0.07), vec3(0.4, 0.31, 0.2), st) * (0.8 + 0.3 * vnoise(p.xz * 20.0)); }
  if (m < 11.5) return vec3(0.055, 0.065, 0.135) * (0.92 + 0.16 * vnoise(p * 6.0));   // indigo linen
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
    c += uAngelCol * uAngelI * 0.0 * exp(-abs(rp.x * rp.x + rp.z * rp.z) * 40.0 / max(s * 0.02, 0.05)) * exp(-abs(rp.y) * 0.4) * breath;
  }
  return c;
}

// ================= shading =================
vec3 ambientSky() { return uAmbSky * 3.6 * uAmbK + vec3(0.006, 0.008, 0.014) * uNight; }
vec3 shadeSurface(vec3 p, vec3 n, vec3 rd, float m, float t, vec3 amb) {
  vec3 sd = SUNDIR();
  vec3 a = albedo(m, p, n, t) * (m < 1.5 ? 1.0 - 0.5 * uNight : 1.0);
  gShT0 = m > 1.5 && m < 2.5 ? 0.55 : 0.0;
  float sh = gCheap ? 1.0 : shadow(p + n * (m > 1.5 && m < 2.5 ? 0.09 : 0.03), sd);
  // the cloud deck's shadow on the land
  if (uCloud > 0.0) { float rim; float d = cloudDensity(p.xz + sd.xz * (uCloudH - p.y) / max(sd.y, 0.05), rim); sh *= mix(1.0, exp(-d * 4.0), uEye > 0.0 ? 1.0 : 0.55); }
  float occ = gCheap ? 0.8 : ao(p, n);
  float dif = max(dot(n, sd), 0.0);

  vec3 ga = uLand > 0.5 ? vec3(0.62, 0.43, 0.27) : vec3(0.46, 0.35, 0.23);
  vec3 am = mix(amb, vec3(dot(amb, vec3(0.3, 0.5, 0.2))), 0.42 * (1.0 - uNight)) * (1.0 - 0.5 * uNight);
  vec3 bounce = ga * (sunLit() * max(sd.y, 0.10) * (1.0 - 0.8 * uNight) + am) * 0.75 * (1.0 - 0.6 * uNight);
  bool cloth = m > 1.5 && m < 2.5;
  vec3 L = sunLit() * dif * sh + am * (0.5 + 0.5 * n.y) * occ * 1.15 + bounce * (0.62 - 0.38 * n.y) * (0.35 + 0.65 * occ);
  if (cloth) L += sunLit() * vec3(1.0, 0.72, 0.45) * 0.28 * max(-dot(n, sd), 0.0) * (1.0 - 0.8 * uNight);
  L += lampLight(p, n) * (0.4 + 0.6 * occ);
  vec3 col = a * L;
  if (m < 1.5 && uLand > 0.5) col += a * sunLit() * vec3(1.0, 0.62, 0.36) * 0.12 * (1.0 - dif) * sat(dot(n, sd) + 0.6) * sh;
  if (m < 1.5) {   // sand glints
    float g = step(0.993, hash12(floor(p.xz * 110.0))) * (1.0 - smoothstep(3.0, 22.0, t));
    vec3 h = normalize(sd - rd);
    col += sunLit() * g * pow(max(dot(n, h), 0.0), 30.0) * sh * 0.4 * uLand;
  }
  if (m > 10.5 && m < 11.5) {   // linen: two-sided, light through it, a soft sheen on the turn of each fold
    float back = max(-dot(n, sd), 0.0); float nv = max(dot(n, -rd), 0.0);
    col += a * sunLit() * vec3(0.95, 1.0, 1.25) * 0.75 * back * sh + (sunLit() * 0.05 * (0.3 + dif) * sh + am * 0.09) * vec3(0.75, 0.85, 1.0) * pow(1.0 - nv, 2.5);
    col *= 0.93 + 0.14 * vnoise(gVeilUV * 60.0);
  }
  if (false) {   // (earlier linen)
    float back = pow(max(dot(rd, sd), 0.0), 3.0);
    col += vec3(0.14, 0.2, 0.6) * sunLit() * (0.02 + back * 0.3) * sh;
    col += uAngelCol * uAngelI * 0.02 * pow(max(dot(rd, normalize(uAngel - p)), 0.0), 3.0);
  }
  if (m > 4.5 && m < 8.5) {   // leaves pass a little light
    col += a * sunLit() * 0.18 * pow(max(dot(rd, sd), 0.0), 4.0);
  }
  if (m > 1.5 && m < 2.5 && uLI[0] > 0.0) {
    float seam = smoothstep(0.44, 0.49, abs(fract(abs(n.y) > 0.55 ? p.z * 1.25 + 40.0 : p.y * 1.5) - 0.5));
    float weave = smoothstep(0.55, 0.9, vnoise(p * 40.0));
    vec3 d = lampPos(0) - p; float r2 = dot(d, d);
    float outside = 1.0 - sat(dot(n, d * inversesqrt(r2)) * 3.0);   // we see the cloth's outer face, lit from within
    col += uLampCol * uLI[0] * flick(0.0) * (seam * 0.12 + weave * 0.012) * outside / (r2 * 0.6 + 0.4);
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
    if (o.x < eps && o.x <= hT) { if (leafGap(o.y, p)) { t += 0.035 + 0.004 * t; continue; } mat = o.y; return t; }
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
  if (t < tmax && rd.y < 0.02 && pe.y - terrainH(pe.xz) < 0.06 * t + 2.0) { mat = 1.0; return t; }
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
  if (uDropOn > 0.5 && uTime > uDropT) {   // rings from where the drop fell
    float dt = uTime - uDropT;
    vec2 dd = xz - uDrop; float rr = length(dd);
    for (int k = 0; k < 3; k++) {
      float ring = 0.32 * max(dt - float(k) * 0.16, 0.0);
      float x = rr - ring;
      float a = exp(-x * x * 900.0) * exp(-dt * 0.9) * 0.9 / (1.0 + rr * 6.0);
      g += (rr > 1e-3 ? dd / rr : vec2(0)) * a * -x * 60.0;
    }
  }
  // the wind on the surface
  vec2 w = normalize(uWind);
  float e = 0.04;
  float n0 = fbm(xz * 1.6 + w * uTime * 0.35, 4), nx = fbm((xz + vec2(e, 0)) * 1.6 + w * uTime * 0.35, 4), nz = fbm((xz + vec2(0, e)) * 1.6 + w * uTime * 0.35, 4);
  g += vec2(nx - n0, nz - n0) / e * 0.012 * (1.0 - 0.8 * uEye);
  return normalize(vec3(-g.x, 1.0, -g.y));
}

vec3 world(vec2 fc) {
  vec3 ro; vec3 rd = camRay(fc, ro);
  if (uAperture > 0.0) {
    vec3 ww = normalize(uCamTarget - uCamPos);
    vec3 uu = normalize(cross(ww, vec3(sin(uCamRoll), cos(uCamRoll), 0.0))), vv = cross(uu, ww);
    vec2 h = hash22(uJitter * 911.0 + vec2(fract(uTime * 7.3), 3.1));
    float rr = sqrt(h.x) * uAperture, aa = 6.2832 * h.y;
    vec3 fp = ro + rd * (uFocus / max(dot(rd, ww), 0.2));
    ro += uu * cos(aa) * rr + vv * sin(aa) * rr;
    rd = normalize(fp - ro);
  }
  vec3 sd = SUNDIR();
  gSunT = uSunT;
  gCamp = uTentsOn > 0.5 ? terrainH(uCamp.xz) : 0.0; gTree = uTreeOn > 0.5 ? terrainH(uTree.xz) : 0.0;
  gBush = uBushOn > 0.5 ? terrainH(uBush.xz) : 0.0; gWell = uWellOn > 0.5 ? terrainH(uWellP.xz) : 0.0;
  gVeil = uVeilOn > 0.5 ? terrainH(uVeil.xz) * step(0.5, uVeilTilt) + uVeil.y * 0.0 : 0.0;
  gSkin = uSkinOn > 0.5 ? terrainH(uSkin.xz) : 0.0;
  if (uVeilOn > 0.5 && uVeilTilt < 0.5) gVeil = 0.0;
  float m;
  float hit = march(ro, rd, m, 360, 6000.0);
  float tv = veilHit(ro, rd, hit > 0.0 ? hit : 200.0);
  if (tv > 0.0) { hit = tv; m = 11.0; }
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
    bl *= 1.0 - 0.8 * uNight; caus *= 1.0 - uNight;
    vec3 below = ba * bl * absorb + vec3(0.01, 0.035, 0.035) * amb * (1.0 - 0.7 * uNight) * (1.0 - absorb);
    col = mix(below, refl, fres);
    if (uAngelI > 0.0) { float da = max(dot(rr, normalize(uAngel - p)), 0.0); vec3 rs = normalize(vec3(rr.x, rr.y, rr.z)); vec3 ad = normalize(uAngel - p); float az = dot(normalize(rs.xz), normalize(ad.xz)); float streak = pow(max(az, 0.0), 900.0) * exp(-abs(rs.y - ad.y) * 5.0); col += uAngelCol * uAngelI * (0.9 * pow(da, 1600.0) + 0.25 * pow(da, 160.0) + 0.16 * streak); }
    // the sun's glitter on the ripples
    col += sunCol() * pow(max(dot(rr, sd), 0.0), 900.0) * 0.6 * (1.0 - uNight);
  } else if (hit < 0.0) {
    tmax = 1e7;
    col = sky(rd);
  } else {
    tmax = hit;
    vec3 p = ro + rd * hit;
    if (m < 1.5) p.y = terrainH(p.xz);
    vec3 n = m < 1.5 ? ripples(p, terrainN(p, hit), hit) : (m > 10.5 && m < 11.5) ? gVeilN : normalThing(p);
    if (m > 1.5 && m < 2.5) { float w = smoothstep(3.5, 0.8, hit); float k = (p.y + p.z * 0.9) * 1.55; n = normalize(n + w * 0.16 * vec3(vnoise(vec2(p.x * 90.0, k * 60.0)) - 0.5, vnoise(vec2(p.x * 45.0, k * 120.0)) - 0.5, 0.0)); }
    if (m > 15.5) { vec3 rr = reflect(rd, n); col = sky(rr) * 0.9 + vec3(0.06, 0.08, 0.08) + sunLit() * pow(max(dot(rr, sd), 0.0), 60.0) * 0.5; }
    else if (m > 9.5 && m < 10.5) {   // the water deep in the well: a dark mirror
      vec3 rr = reflect(rd, normalize(vec3(0, 1, 0) + vec3(waterNormal(p.xz * 2.0).x, 0, waterNormal(p.xz * 2.0).z) * 0.3));
      col = sky(rr) * 0.5 + angelGlow(p, rr, 1e4) * 0.5;
      col *= smoothstep(0.75, 0.55, length(p.xz - uWellP.xz)) * 0.8 + 0.2;
    } else col = shadeSurface(p, n, rd, m, hit, amb);
    vec3 tr;
    vec3 ins = atmo(rd, hit * 6.0, tr) * (1.0 - 0.75 * uNight);   // distances stretched: a desert's deep air
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
