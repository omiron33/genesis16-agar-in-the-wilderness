// The things of the camp, as distance fields, and a small generator: a scene lists its props, and only
// those are compiled into its shader. Each returns (distance, material). Materials: 20 clay, 21 wood,
// 22 woven wool, 23 stone, 24 rope and basket, 25 bronze, 26 green, 27 blackened pot, 28 leather.
export const PROPS_GLSL = /* glsl */ `
uint gMask = 0xffffffffu;   // which props the ray being marched can touch at all
float gPY[32];
uniform float uA[32];
vec2 pJar(vec3 p, float a) {
  p.y -= 0.06 * smoothstep(0.5, 1.5, abs(a)); p.x -= 0.16; p.xy = rot(a) * p.xy; p.x += 0.16;
  float d = sdEllipsoid(p - vec3(0, 0.31, 0), vec3(0.235, 0.31, 0.235));
  d = smin(d, sdCyl(p - vec3(0, 0.03, 0), 0.1, 0.03), 0.06);
  d = smin(d, sdCyl(p - vec3(0, 0.62, 0), 0.085, 0.08), 0.07);
  d = min(d, sdTorus(p - vec3(0, 0.7, 0), vec2(0.1, 0.024)));
  vec3 q = p; q.x = abs(q.x); q -= vec3(0.15, 0.56, 0); d = smin(d, sdTorus(q.xzy, vec2(0.085, 0.02)), 0.02);
  d = max(d, -sdCyl(p - vec3(0, 0.62, 0), 0.066, 0.16));
  return vec2(d * 0.9 + 0.004 * sin(p.y * 90.0) * 0.4, 20);
}
vec2 pPot(vec3 p, float a) {   // a cooking pot on three stones
  vec2 r = vec2(max(sdEllipsoid(p - vec3(0, 0.4, 0), vec3(0.24, 0.2, 0.24)), -sdEllipsoid(p - vec3(0, 0.5, 0), vec3(0.19, 0.2, 0.19))), 27);
  r = opU(r, vec2(sdTorus(p - vec3(0, 0.53, 0), vec2(0.2, 0.022)), 27));
  float an = atan(p.z, p.x), k = floor((an + 3.1416) / 2.0944); float aa = -3.1416 + (k + 0.5) * 2.0944;
  vec3 q = p - vec3(cos(aa) * 0.27, 0.1, sin(aa) * 0.27);
  return opU(r, vec2((sdEllipsoid(q, vec3(0.13, 0.15, 0.12)) + (vnoise(p * 12.0) - 0.5) * 0.04) * 0.8, 23));
}
vec2 pQuern(vec3 p, float a) {
  vec2 r = vec2(sdCyl(p - vec3(0, 0.07, 0), 0.3, 0.07) - 0.015 + (vnoise(p * 14.0) - 0.5) * 0.015, 23);
  vec3 q = p; q.xz = rot(a) * q.xz;
  r = opU(r, vec2(max(sdCyl(q - vec3(0, 0.2, 0), 0.25, 0.05) - 0.015, -sdCyl(q - vec3(0, 0.25, 0), 0.05, 0.06)) + (vnoise(q * 14.0) - 0.5) * 0.015, 23));
  return opU(r, vec2(sdCapsule(q, vec3(0.2, 0.2, 0), vec3(0.2, 0.42, 0), 0.022), 21));
}
vec2 pCushion(vec3 p, float a) {
  float d = sdBox(p - vec3(0, 0.1, 0), vec3(0.34 - 0.5 * p.y * p.y, 0.05, 0.22)) - 0.06; d += 0.02 * (vnoise(p * 5.0) - 0.5);
  vec3 q = abs(p - vec3(0, 0.1, 0)) - vec3(0.4, 0, 0.27); d = min(d, length(q) - 0.035);
  return vec2(d * 0.8, 22);
}
vec2 pRug(vec3 p, float a) { float w = 0.012 * sin(p.x * 3.0 + 1.0) * sin(p.z * 4.0); return vec2((sdBox(p - vec3(0, 0.02 + w, 0), vec3(1.15, 0.012, 0.7)) - 0.006) * 0.8, 22); }
vec2 pBag(vec3 p, float a) {   // a pair of saddle bags
  vec3 q = p; q.x = abs(q.x) - 0.27;
  float d = sdBox(q - vec3(0, 0.25, 0), vec3(0.17, 0.2, 0.1)) - 0.07 + 0.015 * sin(q.y * 9.0);
  d = smin(d, sdBox(p - vec3(0, 0.5, 0), vec3(0.4, 0.02, 0.1)) - 0.03, 0.05);
  float fr = max(sdBox(q - vec3(0, 0.02, 0), vec3(0.2, 0.06, 0.11)), 0.02 - abs(sin(q.x * 42.0)) * 0.03); return vec2(min(d, fr) * 0.75, 22);
}
vec2 pLoom(vec3 p, float a) {
  vec3 q = p; q.x = abs(q.x);
  vec2 r = vec2(min(sdCapsule(q, vec3(0.75, 0, 0), vec3(0.72, 1.6, -0.1), 0.045), min(sdCapsule(p, vec3(-0.85, 1.52, -0.09), vec3(0.85, 1.52, -0.09), 0.04), sdCapsule(p, vec3(-0.85, 0.25, 0.02), vec3(0.85, 0.25, 0.02), 0.04))), 21);
  float y = p.y, pl = abs(p.z - 0.02 + 0.066 * (y - 0.25) - 0.004 * sin(p.x * 120.0)) - 0.006;
  float woven = max(pl, max(abs(p.x) - 0.55, abs(y - 0.55) - 0.3));
  r = opU(r, vec2(woven * 0.8, 22));
  float warp = max(max(pl, abs(fract(p.x * 14.0) - 0.5) / 14.0 - 0.006), max(abs(p.x) - 0.55, abs(y - 1.17) - 0.35));
  return opU(r, vec2(warp * 0.8, 24));
}
vec2 pCradle(vec3 p, float a) {   // hung from a point 1.55 above its own floor; a swings it
  p.y -= 1.55; p.xy = rot(a) * p.xy; p.y += 1.55;
  vec3 q = p - vec3(0, 0.22, 0);
  float outer = sdEllipsoid(q, vec3(0.46, 0.24, 0.25)), d = max(abs(outer) - 0.016, q.y - 0.06 - 0.05 * abs(q.x));
  float rim = abs(length(q.xz / vec2(0.46, 0.25)) - 0.97) * 0.25; rim = length(vec2(rim, q.y - 0.07 - 0.05 * abs(q.x))) - 0.024;
  d += 0.006 * sin(q.y * 70.0) * sin(atan(q.z, q.x) * 26.0);
  vec2 r = vec2(min(d, rim) * 0.7, 24);
  vec3 k = p; k.xz = abs(k.xz); r = opU(r, vec2(sdCapsule(k, vec3(0.4, 0.3, 0.1), vec3(0.04, 1.55, 0.0), 0.009), 24));
  return opU(r, vec2(sdEllipsoid(q + vec3(0, 0.1, 0), vec3(0.36, 0.07, 0.17)), 22));
}
vec2 pFrame(vec3 p, float a) {   // a frame for the cradle
  vec3 q = p; q.x = abs(q.x); q.z = abs(q.z);
  float d = sdCapsule(q, vec3(0.95, 0, 0.45), vec3(0.8, 1.85, 0.0), 0.035); return vec2(min(d, sdCapsule(p, vec3(-0.95, 1.82, 0), vec3(0.95, 1.82, 0), 0.035)), 21);
}
vec2 pStaff(vec3 p, float a) {
  p.xy = rot(a) * p.xy; float d = sdCapsule(p, vec3(0, 0, 0), vec3(0.0, 1.75, 0), 0.022 + 0.004 * sin(p.y * 7.0));
  vec3 q = p - vec3(0.12, 1.75, 0); float c = length(vec2(length(q.xy) - 0.12, q.z)) - 0.022; c = max(c, -q.y - 0.02 - 0.6 * max(-q.x, 0.0)); if (q.x > 0.0) c = max(c, -q.y - 0.07);
  return vec2(min(d, c) * 0.9, 21);
}
vec2 pBalance(vec3 p, float a) {
  vec2 r = vec2(sdCapsule(p, vec3(0, 0, 0), vec3(0, 1.62, 0), 0.028), 25); r = opU(r, vec2(sdCyl(p - vec3(0, 0.03, 0), 0.24, 0.03) - 0.01, 25)); r = opU(r, vec2(sdSphere(p - vec3(0, 1.66, 0), 0.05), 25));
  vec3 q = p - vec3(0, 1.56, 0); q.xy = rot(a) * q.xy; r = opU(r, vec2(sdCapsule(q, vec3(-0.75, 0, 0), vec3(0.75, 0, 0), 0.02), 25));
  for (int k = 0; k < 2; k++) {
    float s = k == 0 ? 1.0 : -1.0; vec3 e = vec3(cos(a) * 0.75 * s, 1.56 + sin(a) * 0.75 * s, 0); float sw = uA[30 + k];
    vec3 c = p - e; c.xy = rot(sw) * c.xy;
    vec3 f = c; float an = atan(f.z, f.x), kk = floor(an / 2.0944 + 0.5) * 2.0944; f.xz = rot(-kk) * f.xz; f.xz = vec2(length(c.xz) * cos(an - kk), length(c.xz) * sin(an - kk));
    r = opU(r, vec2(sdCapsule(f, vec3(0), vec3(0.22, -0.62, 0), 0.006), 25));
    vec3 g = c - vec3(0, -0.52, 0); float bowl = max(abs(length(g) - 0.26) - 0.008, g.y + 0.1); r = opU(r, vec2(bowl, 25));
    r = opU(r, vec2(sdEllipsoid(c - vec3(0, -0.7, 0), k == 0 ? vec3(0.11, 0.09, 0.1) : vec3(0.1, 0.1, 0.09)) + (vnoise(c * 18.0) - 0.5) * 0.02, k == 0 ? 23.0 : 20.0));
  }
  return vec2(r.x * 0.85, r.y);
}
vec2 pFold(vec3 p, float a) {   // a ring of stacked stones, with a gap
  float an = atan(p.z, p.x), R = 3.2, n = 34.0, best = 1e9;
  for (int c = 0; c < 3; c++) {
    float u = (an / 6.2832 + 0.5) * n + 0.5 * mod(float(c), 2.0), id = floor(u), h = hash11(id * 3.1 + float(c) * 17.0);
    if (abs(id - 25.0) < 2.5) continue;
    float w = 6.2832 * R / n; vec3 q = vec3((fract(u) - 0.5) * w, p.y - 0.14 - float(c) * 0.22, length(p.xz) - R - (h - 0.5) * 0.12); q.xy = rot((h - 0.5) * 0.5) * q.xy;
    best = min(best, sdEllipsoid(q, vec3(0.3 + 0.08 * h, 0.13 + 0.03 * h, 0.22 + 0.06 * hash11(id * 7.0))));
  }
  return vec2((best + (best < 0.3 ? (vnoise(p * 8.0) - 0.5) * 0.06 : 0.0)) * 0.6, 23);
}
vec2 pPalm(vec3 p, float a) { float fr; float d = sdPalm(p, 6.8, 0.9, fr); if (fr > 0.5) gFr = gFrT; return vec2(d, fr > 0.5 ? 8.0 : 7.0); }
vec2 pGrow(vec3 p, float a) {   // a palm that grows: a is its size, squashed and stretched as it springs
  float s = max(uA[28], 0.02), st = uA[29]; vec3 q = vec3(p.x / (s * (1.0 - 0.5 * st)), p.y / (s * (1.0 + st)), p.z / (s * (1.0 - 0.5 * st)));
  float fr; float d = sdPalm(q, 4.2, 0.4, fr) * s * 0.75; if (fr > 0.5) gFr = gFrT; return vec2(d, fr > 0.5 ? 8.0 : 7.0);
}
vec2 pSprout(vec3 p, float a) {   // a shoot: bent and folded at a = 0, upright and open at a = 1
  float up = smoothstep(0.08, 0.5, a), st = smoothstep(0.4, 1.0, a) + max(a - 1.0, 0.0); float H = 0.05 + 0.15 * up + 0.12 * st, bend = 1.0 - st; vec2 r = vec2(1e9, 26); vec3 c = vec3(0, -0.2 + 0.17 * up, 0); float th = 0.0;
  for (int i = 0; i < 8; i++) { float seg = H / 8.0; vec3 n = c + vec3(sin(th), cos(th), 0) * seg; r.x = smin(r.x, sdCapsule(p, c, n, 0.010 - 0.0006 * float(i)), 0.006); c = n; th += bend * 0.46 * (0.3 + 0.2 * float(i)); }
  for (int k = 0; k < 2; k++) {
    float s = k == 0 ? 1.0 : -1.0, op = mix(0.06, 1.15, smoothstep(0.62, 1.05, a)) + 0.1 * s * sin(uTime * 2.3) * a; vec3 q = p - c; q.xy = rot(th) * q.xy; q.xy = rot(s * op) * q.xy; float L = 0.02 + 0.03 * up + 0.035 * st;
    vec3 e = q - vec3(0, L, 0); e.z += 0.5 * e.x * e.x / L - 0.6 * abs(e.x); float lf = sdEllipsoid(e, vec3(0.5 * L, L, 0.006)); r.x = min(r.x, lf * 0.8);
  }
  float mound = sdEllipsoid(p + vec3(0, 0.03, 0), vec3(0.17, 0.035 + 0.06 * smoothstep(0.0, 0.12, a), 0.17)) + (vnoise(p * 34.0) - 0.5) * (0.02 + 0.02 * smoothstep(0.02, 0.2, a));
  return opU(r, vec2(mound * 0.7, 29));
}
vec2 pPeg(vec3 p, float a) { p.y -= a; return vec2(sdCapsule(p, vec3(0.06, -0.3, 0.06), vec3(-0.05, 0.24, -0.05), 0.026) + (vnoise(p * 30.0) - 0.5) * 0.008, 21); }
vec2 pPegRope(vec3 p, float a) {   // a peg, the ground breaking round it, and its rope, slack or drawn
  vec3 q = p; q.y -= uA[5]; vec2 r = vec2((sdRoundCone(q, vec3(0.05, -0.3, 0.05), vec3(-0.06, 0.2, -0.06), 0.022, 0.03) + (vnoise(q * vec3(40.0, 8.0, 40.0)) - 0.5) * 0.008) * 0.8, 21);
  vec3 e = vec3(-2.6, 1.8, -2.6), k = vec3(-0.05, 0.15 + uA[5], -0.05), m = mix(k, e, 0.45) - vec3(0, uA[6], 0); vec3 m1 = mix(k, m, 0.55) - vec3(0, uA[6] * 0.22, 0);
  float ro = min(min(sdCapsule(p, k, m1, 0.016), sdCapsule(p, m1, m, 0.016)), sdCapsule(p, m, e, 0.016)); ro = smin(ro, sdTorus(q - vec3(-0.05, 0.15, -0.05), vec2(0.042, 0.016)), 0.01);
  r = opU(r, vec2((ro + 0.003 * sin(dot(p, vec3(60.0, 90.0, 60.0)))) * 0.8, 24));
  float crack = smoothstep(0.0, 0.09, uA[5]); float s = sdEllipsoid(p + vec3(-0.02, 0.05, -0.02), vec3(0.2, 0.06 + 0.05 * crack, 0.18)) + (voronoiEdge(p.xz * 13.0).x - 0.2) * -0.035 * crack + (vnoise(p * 26.0) - 0.5) * 0.02; return opU(r, vec2(s * 0.6, 29));
}
vec2 pWood(vec3 p, float a) {
  float best = 1e9; for (int i = 0; i < 9; i++) { float fi = float(i), h = hash11(fi * 3.3); float rw = fi < 4.0 ? 0.0 : fi < 7.0 ? 1.0 : 2.0; float cx = (fi - (rw < 0.5 ? 1.5 : rw < 1.5 ? 5.0 : 7.5)) * 0.15; vec3 c = vec3(cx, 0.07 + rw * 0.12, (h - 0.5) * 0.1); best = min(best, sdCapsule(p, c + vec3(0, 0, -0.4), c + vec3((h - 0.5) * 0.1, 0.02, 0.4), 0.05 + 0.02 * h)); }
  return vec2((best + (vnoise(p * vec3(20.0, 20.0, 4.0)) - 0.5) * 0.02) * 0.8, 21);
}
vec2 pBasket(vec3 p, float a) { float d = max(abs(sdEllipsoid(p - vec3(0, 0.22, 0), vec3(0.28, 0.25, 0.28))) - 0.014, p.y - 0.34); d = min(d, sdTorus(p - vec3(0, 0.34, 0), vec2(0.24, 0.02))); d += 0.005 * sin(p.y * 75.0) * sin(atan(p.z, p.x) * 24.0); return vec2(d * 0.7, 24); }
vec2 pTripod(vec3 p, float a) {   // three poles and a swinging water skin
  float an = atan(p.z, p.x), k = floor(an / 2.0944 + 0.5) * 2.0944; vec3 f = vec3(length(p.xz) * cos(an - k), p.y, length(p.xz) * sin(an - k));
  vec2 r = vec2(sdCapsule(f, vec3(0.55, 0, 0), vec3(-0.03, 1.6, 0), 0.03), 21);
  vec3 q = p - vec3(0, 1.5, 0); q.xy = rot(a) * q.xy; q.zy = rot(a * 0.6) * q.zy; r = opU(r, vec2(sdCapsule(q, vec3(0), vec3(0, -0.4, 0), 0.01), 24));
  float b = sdEllipsoid(q - vec3(0, -0.72, 0), vec3(0.19, 0.3, 0.16)); b = smin(b, sdRoundCone(q, vec3(0, -0.5, 0), vec3(0, -0.38, 0), 0.09, 0.05), 0.08);
  vec3 l = q; l.x = abs(l.x); b = smin(b, sdCapsule(l, vec3(0.12, -0.9, 0), vec3(0.2, -1.02, 0.03), 0.03), 0.04); return opU(r, vec2(b + (vnoise(q * 9.0) - 0.5) * 0.025, 28));
}
`;
const R = { Jar: [0.35, 0.65], Pot: [0.3, 0.55], Quern: [0.2, 0.5], Cushion: [0.1, 0.6], Rug: [0, 1.4], Bag: [0.28, 0.75], Loom: [0.8, 1.25], Cradle: [0.9, 1.4], Frame: [0.95, 1.5], Staff: [0.9, 1.4], Balance: [0.95, 1.45], Fold: [0.3, 3.9], Palm: [5, 8.5], Grow: [2.2, 5.2], Sprout: [0.2, 0.75], Peg: [0, 0.6], Tripod: [0.8, 1.25], PegRope: [0.8, 2.6], Wood: [0.2, 0.75], Basket: [0.2, 0.5] };
const g = (x) => { const s = String(+(+x).toFixed(5)); return /[.e]/.test(s) ? s : s + '.0'; };
// props: [type, x, z, yaw, scale, anim] anim: index into uA (or a number when fixed) ; lines: [[ax,ay,az],[bx,by,bz], posts?]
export function propsCode(props, lines = []) {
  let init = '', body = '', cull = '';
  props.forEach(([ty, x, z, yaw = 0, s = 1, an = null, y = null], i) => {
    const [ch, br] = R[ty]; const a = an === null ? '0.0' : typeof an === 'string' ? `uA[${an}]` : g(an); const S = typeof s === 'string' ? `max(uA[${s}], 0.001)` : g(s);
    init += `  gPY[${i}] = ${y === null ? `terrainH(vec2(${g(x)}, ${g(z)}))` : g(y)};\n`;
    cull += `  { float S = ${S}; vec3 oc = ro - vec3(${g(x)}, gPY[${i}] + ${g(ch)} * S, ${g(z)}); float R = ${g(br)} * S + pad, b = dot(oc, rd), c = dot(oc, oc) - R * R; if (c < 0.0 || (b < 0.0 && b * b > c)) m |= ${1 << i}u; }\n`;
    body += `  if ((gMask & ${1 << i}u) != 0u) { float S = ${S}; vec3 q = p - vec3(${g(x)}, gPY[${i}], ${g(z)}); float b = length(q - vec3(0, ${g(ch)} * S, 0)) - ${g(br)} * S; if (S < 0.02) {} else if (b > 0.3) r = opU(r, vec2(b, -1)); else { q.xz = rot(${g(yaw)}) * q.xz; vec2 h = p${ty}(q / S, ${a}); r = opU(r, vec2(h.x * S, h.y)); } }\n`;
  });
  lines.forEach(([a, b, posts = true, sag = 0.08], li) => {
    const bit = props.length + li;
    const v = (p) => `vec3(${p.map(g).join(', ')})`;
    const c = a.map((x, k) => (x + b[k]) / 2), rad = Math.hypot(...a.map((x, k) => x - b[k])) / 2 + 2.3;
    cull += `  { vec3 oc = ro - ${v([c[0], c[1] - 0.8, c[2]])}; float R = ${g(rad)} + pad, b = dot(oc, rd), c = dot(oc, oc) - R * R; if (c < 0.0 || (b < 0.0 && b * b > c)) m |= ${1 << bit}u; }\n`;
    body += `  if ((gMask & ${1 << bit}u) != 0u) { float bb = length(p - ${v([c[0], c[1] - 0.8, c[2]])}) - ${g(rad)}; if (bb > 0.3) r = opU(r, vec2(bb, -1)); else { if (!gShadowPass) r = opU(r, vec2(catenary(p, ${v(a)}, ${v(b)}, ${g(sag)}, 0.009), 24));\n`;
    if (posts) for (const e of [a, b]) body += `    r = opU(r, vec2(sdCapsule(p, ${v([e[0], -0.3, e[2]])}, ${v([e[0], e[1] + 0.12, e[2]])}, 0.032), 21));\n`;
    body += '  } }\n';
  });
  if (props.length + lines.length > 30) throw Error('too many props');
  return { init, body, cull };
}
