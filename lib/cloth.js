// Cloth as a real sheet of points and links, simulated at a fixed step from before the scene starts, so
// frame t depends only on t. Pins can move, and can let go at a given time. The drag, the overlap
// and the follow-through are the simulation's own.
import { fractal } from '/kit/motion.js';
export const NX = 12, NY = 14;
const DT = 1 / 120, ITER = 16;
// cfg: a, b top corners; h length; gather (cloth width / distance a..b); pins: columns held on the top
// edge; pinAt(u, t) -> position; more: [{ i, j, at(t) }] other held points; release: { column or 'i,j': time };
// wind(t) -> [x, y, z] m/s; t0 start of the simulation; ground height; turb
export function cloth(cfg) {
  const { a, b, h, t0 } = cfg, gather = cfg.gather ?? 1.22, pins = cfg.pins ?? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], G = cfg.ground ?? 0.05, turb = cfg.turb ?? 0.35;
  const W = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * gather, sx = W / (NX - 1), sy = h / (NY - 1), N = NX * NY;
  const pinAt = cfg.pinAt ?? ((u) => a.map((v, k) => v + (b[k] - v) * u));
  const ux = [(b[0] - a[0]), 0, (b[2] - a[2])], ul = Math.hypot(...ux), nrm = [-ux[2] / ul, 0, ux[0] / ul];
  // the top edge lies along its line all the way, in small gathers that start the folds
  const fa = cfg.fold ?? 0.075, base = pinAt, pin = (u, t) => { const p = base(u, t), z = fa * Math.sin(u * 11 * Math.PI * 0.5 + 0.6) * (0.7 + 0.5 * Math.sin(u * 17 + (cfg.seed ?? 1))); return [p[0] + nrm[0] * z, p[1], p[2] + nrm[2] * z]; };
  let P = new Float64Array(N * 3), Q;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const u = i / (NX - 1), p = pin(u, t0), f = 0, o = (j * NX + i) * 3;
    P[o] = p[0] + nrm[0] * f; P[o + 1] = p[1] - j * sy; P[o + 2] = p[2] + nrm[2] * f;
    if (cfg.lift) { const l = cfg.lift(u, j / (NY - 1)); P[o] += l[0]; P[o + 1] += l[1]; P[o + 2] += l[2]; }
  }
  Q = Float64Array.from(P);
  const links = []; const id = (i, j) => j * NX + i;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    if (i + 1 < NX) links.push([id(i, j), id(i + 1, j), sx, 1]); if (j + 1 < NY) links.push([id(i, j), id(i, j + 1), sy, 1]);
    const dg = Math.hypot(sx, sy); if (i + 1 < NX && j + 1 < NY) { links.push([id(i, j), id(i + 1, j + 1), dg, 0.25]); links.push([id(i + 1, j), id(i, j + 1), dg, 0.25]); }
    if (i + 2 < NX) links.push([id(i, j), id(i + 2, j), sx * 2, 0.08]); if (j + 2 < NY) links.push([id(i, j), id(i, j + 2), sy * 2, 0.08]);
  }
  const held = (t) => {
    const r = [];
    for (const i of pins) if (t < (cfg.release?.[i] ?? 1e9)) r.push([id(i, 0), pin(i / (NX - 1), t)]);
    for (const m of cfg.more ?? []) if (t < (m.until ?? 1e9) && t >= (m.since ?? -1e9)) r.push([id(m.i, m.j), m.at(t)]);
    return r;
  };
  const states = [Float32Array.from(P)];
  const V = new Float64Array(N * 3);
  function step(t) {
    const w = cfg.wind(t), wl = Math.hypot(...w);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const o = id(i, j) * 3, l = id(Math.max(i - 1, 0), j) * 3, r = id(Math.min(i + 1, NX - 1), j) * 3, up = id(i, Math.max(j - 1, 0)) * 3, dn = id(i, Math.min(j + 1, NY - 1)) * 3;
      const ax = P[r] - P[l], ay = P[r + 1] - P[l + 1], az = P[r + 2] - P[l + 2], bx = P[dn] - P[up], by = P[dn + 1] - P[up + 1], bz = P[dn + 2] - P[up + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      const ph = (P[o] * w[0] + P[o + 2] * w[2]) / (wl + 0.5);
      const g = 1 + turb * 1.6 * fractal((t - ph * 0.22) * 1.9, { seed: (cfg.seed ?? 1) + 2, octaves: 3 }), s = turb * wl * 0.8 * fractal((t - ph * 0.3) * 2.7 + P[o + 1] * 0.8, { seed: (cfg.seed ?? 1) + 5, octaves: 2 });
      const vx = (P[o] - Q[o]) / DT, vy = (P[o + 1] - Q[o + 1]) / DT, vz = (P[o + 2] - Q[o + 2]) / DT;
      const rx = w[0] * g - vx + nrm[0] * s, ry = w[1] * g - vy, rz = w[2] * g - vz + nrm[2] * s, f = (nx * rx + ny * ry + nz * rz) * (cfg.aero ?? 3.1);
      if (cfg.flutter) { const q = cfg.flutter(t) * (Math.sin(t * 13.0 - j * 0.95 + i * 0.35) + 0.7 * Math.sin(t * 21.0 - j * 0.6 - i * 0.8)); V[o] = nx * q; V[o + 1] = ny * q; V[o + 2] = nz * q; } else V[o] = V[o + 1] = V[o + 2] = 0;
      V[o] += nx * f + rx * 0.28; V[o + 1] += ny * f + ry * 0.28 - 9.81; V[o + 2] += nz * f + rz * 0.28;
    }
    for (let o = 0; o < N * 3; o++) { const v = (P[o] - Q[o]) * 0.9985; Q[o] = P[o]; P[o] += v + V[o] * DT * DT; }
    const H = held(t + DT);
    for (let k = 0; k < ITER; k++) {
      for (const [p, q, L, s] of links) {
        const a0 = p * 3, b0 = q * 3, dx = P[b0] - P[a0], dy = P[b0 + 1] - P[a0 + 1], dz = P[b0 + 2] - P[a0 + 2], d = Math.hypot(dx, dy, dz) || 1e-6;
        const c = (d - L) / d * 0.5 * s; P[a0] += dx * c; P[a0 + 1] += dy * c; P[a0 + 2] += dz * c; P[b0] -= dx * c; P[b0 + 1] -= dy * c; P[b0 + 2] -= dz * c;
      }
      for (const [p, at] of H) { P[p * 3] = at[0]; P[p * 3 + 1] = at[1]; P[p * 3 + 2] = at[2]; }
    }
    for (let p = 0; p < N; p++) if (P[p * 3 + 1] < G) { P[p * 3 + 1] = G; Q[p * 3] += (P[p * 3] - Q[p * 3]) * 0.4; Q[p * 3 + 2] += (P[p * 3 + 2] - Q[p * 3 + 2]) * 0.4; Q[p * 3 + 1] = G; }
  }
  function at(t) {
    const x = Math.max(0, (t - t0) / DT), n = Math.floor(x);
    while (states.length < n + 2) { step(t0 + (states.length - 1) * DT); states.push(Float32Array.from(P)); }
    const A = states[n], B = states[n + 1], f = x - n, out = new Float32Array(N * 3);
    for (let o = 0; o < N * 3; o++) out[o] = A[o] + (B[o] - A[o]) * f;
    return out;
  }
  const centre = (t) => { const s = at(t), c = [0, 0, 0]; for (let p = 0; p < N; p++) for (let k = 0; k < 3; k++) c[k] += s[p * 3 + k] / N; return c; };
  return { at, centre };
}
// write a cloth into the world's uniforms: its points, a bounding sphere, and one per strip
export function putCloth(u, k, c, t) {
  const s = c.at(t), V = u[k ? 'uClB' : 'uClA'].value, R = u.uClRow.value, S = u.uClSph.value;
  const ball = (a, b) => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let p = a; p < b; p++) for (let q = 0; q < 3; q++) { const v = s[p * 3 + q]; if (v < lo[q]) lo[q] = v; if (v > hi[q]) hi[q] = v; } const m = lo.map((v, q) => (v + hi[q]) / 2); return [...m, Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 + 0.01]; };
  for (let p = 0; p < NX * NY; p++) { V[p * 4] = s[p * 3]; V[p * 4 + 1] = s[p * 3 + 1]; V[p * 4 + 2] = s[p * 3 + 2]; V[p * 4 + 3] = 0; }
  const all = ball(0, NX * NY); for (let q = 0; q < 4; q++) S[k * 4 + q] = all[q];
  for (let j = 0; j < NY - 1; j++) { const b = ball(j * NX, (j + 2) * NX); for (let q = 0; q < 4; q++) R[(k * 13 + j) * 4 + q] = b[q]; }
}
