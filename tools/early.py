"""The opening (s00 to s18), restaged: things that act, cameras that travel. Run after tools/scenes.py;
writes those scene modules and their lyric layers. Cut times, words and film.json are unchanged except samples."""
import json, os, math
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(R)
F = json.load(open('film.json')); BY = {s['scene']: s for s in F['scenes']}
def sun(az, el): a, e = math.radians(az), math.radians(el); return [round(math.sin(a) * math.cos(e), 4), round(math.sin(e), 4), round(math.cos(a) * math.cos(e), 4)]
W = 30.0
BASE = dict(uLand=0, uDunes=0, uMesa=0.55, uMesaAz=3.0, uMie=1.6, uDust=0.5, uDustH=25, uFlatR=18, uWind=[0.8, 0.6], uTentsOn=1, uCamp=[0, 0, 0], uShrubs=0)
def U(az, el, w=W, **k): d = dict(BASE); d.update(uSunDir=sun(az, el), uSunCol=[w] * 3); d.update(k); return d
CL = dict(uCloud=1, uCloudCov=0.42, uCloudH=2400)
DARK, BONE = "'44, 30, 20'", "'243, 235, 222'"
FIRE = (0.4, 5.2)
# the hearth and the things round it, before the great tent
HEARTH = [['Pot', 0.4, 5.2, 0.4], ['Jar', -2.6, 3.7, 0.3, 1.15], ['Jar', -3.05, 4.1, 1.2, 0.9], ['Jar', -2.3, 4.25, 2.2, 0.7], ['Quern', 2.0, 5.9, 0.8, 1.0, '3'], ['Cushion', -0.9, 3.5, 0.2], ['Cushion', 0.9, 3.6, -0.5], ['Rug', -0.1, 3.3, 0.05], ['Bag', 3.1, 4.2, -0.6], ['Loom', 5.7, 4.5, -0.7], ['Wood', 1.6, 4.4, 0.7], ['Basket', -1.5, 4.5, 0.0]]
PALMS = [['Palm', -19, -14, 0.4], ['Palm', -22.5, -10, 2.0, 0.85], ['Palm', -17.5, -18, 4.0, 1.1]]
AG = [['Jar', 12.0, -2.6, 0.4, 1.0], ['Jar', 12.5, -2.2, 1.0, 0.75], ['Cushion', 10.9, -5.6, 0.3], ['Tripod', 10.3, -2.4, 0.5, 1.0, '4']]
S = []
def sc(name, about, u, cam, props=(), lines=(), cloths=(), setup='', update='', fires=(), lamps='[]', exposure=1.0, lyric=None, samples=8):
    S.append(dict(name=name, about=about, u=u, cam=cam, props=list(props), lines=list(lines), cloths=list(cloths), setup=setup, update=update, fires=list(fires), lamps=lamps, exposure=exposure, lyric=lyric, samples=samples))
def rig(path, look, fov='40', extra="enter: 'moving', exit: 'moving', handheld: 0.18"): return f"rig({{ from: P.from, to: P.to, path: {json.dumps(path)}, look: {json.dumps(look)}, fov: {fov}, {extra} }})"
def cloth(a, b, h, wind, extra='', seed=1): return f"cloth({{ a: {json.dumps(a)}, b: {json.dumps(b)}, h: {h}, t0: P.from - 2.5, seed: {seed}, wind: {wind}{', ' + extra if extra else ''} }})"
def lyr(lines, sy, ink, frac=0.66, sx=0, aspect=3, shade=0.3, extra=''): return dict(lines=lines, sy=sy, ink=ink, frac=frac, sx=sx, aspect=aspect, shade=shade, extra=extra)
# wind helpers live in each module: br(t) a breeze that never repeats; g(t, t0, up, hold, down) one gust
LINE_AG = ([12.2, 2.0, -4.4], [14.8, 2.0, -5.4], True, 0.012)
IND = (lambda wind, extra='', a=[12.5, 2.0, -4.5], b=[14.4, 2.0, -5.25], h=1.45: cloth(a, b, h, wind, extra, 1))
RED = (lambda a, b, wind, extra='', h=1.35: cloth(a, b, h, wind, extra, 4))

sc('s00-title', 'Over a stone fold and palms, down on an arc to the camp at morning: three columns of smoke lean in the wind, cloth moves on its line.', U(75, 10, **CL),
   rig([[-34, 9.5, 41], [-19, 5.0, 28], [-5.0, 2.0, 15.6]], [[-1, 1, -6], [0, 1.2, -3], [1.2, 1.4, 0]], '36'),
   HEARTH + AG + [['Fold', -11, 21, 0.6], ['Palm', -27, 17, 1.0, 1.0], ['Palm', -30, 13, 2.6, 0.85], ['Palm', 21, -15, 3.0, 1.1], ['Palm', 25, -18, 0.6, 0.9]], [LINE_AG], [IND('(t) => [2.2 * br(t), 0, 1.6]')],
   fires=[[0.4, 0.15, 5.2, 1.0], [-10, 0.1, -0.6, 0.8], [11, 0.1, -4.4, 0.7]], lyric=dict(title=True))
sc('s01-camp', 'Low through the camp, past the water skin on its tripod and the jars, to the fire; a gust crosses and everything answers it in turn.', U(75, 11, **CL),
   rig([[-8.6, 1.0, 11.0], [-5.0, 0.8, 8.9], [-1.6, 1.0, 8.6]], [[-2.5, 0.9, 3.5], [0.2, 0.9, 3.2], [2.4, 1.1, 1.8]], '42'),
   HEARTH + [['Tripod', -4.4, 6.2, 0.3, 1.0, '4'], ['Jar', -5.9, 7.6, 0.2, 1.1], ['Jar', -6.4, 7.2, 1.0, 0.8], ['Fold', -15, -2, 0.6]] + PALMS, [([3.7, 1.95, 2.6], [6.3, 1.95, 3.5], True, 0.012)], [RED([4.0, 1.95, 2.7], [5.9, 1.95, 3.4], '(t) => [1.2 * br(t) + 5 * g(t, 9.2, 0.5, 0.5, 1.2), 0, 1.2 + 2 * g(t, 9.2, 0.5, 0.5, 1.2)]')],
   update='u.uA.value[4] = 0.06 * Math.sin(t * 3.1) + 0.42 * ring(t, 8.5, 0.55, 0.45); u.uSmk.value.set(0.7 + 7 * follow((q) => g(q, 8.9, 0.4, 0.4, 1.0), t, 0.3), 0, 0.5); u.uFlap.value = 1 + 2.5 * g(t, 9.3, 0.4, 0.6, 1.2);', fires=[[0.4, 0.15, 5.2, 1.0]], lamps='[null, [0.4, 0.5, 5.2, 2.0]]')
sc('s02-no-children', 'An empty cradle hangs in the mouth of the great tent, still swinging; it slows, and stops.', U(60, 12, **CL),
   rig([[3.0, 1.15, 6.6], [2.2, 1.05, 5.7], [1.35, 1.0, 5.0]], [[0.1, 0.95, 1.6], [0.1, 0.95, 1.6], [0.15, 0.85, 1.6]], '[38, 33]'),
   [['Cradle', 0.1, 1.7, 0.15, 1.0, '0', 0.35], ['Rug', 0.1, 1.9, 0.0], ['Cushion', -1.7, 2.6, 0.4], ['Cushion', 2.0, 2.9, -0.6], ['Jar', -2.9, 3.0, 0.4, 1.0], ['Jar', 3.1, 3.2, 1.4, 0.8]], [([-3.4, 1.9, 1.7], [3.4, 1.9, 1.7], False, 0.03)],
   update='u.uA.value[0] = 0.5 * Math.exp(-0.28 * Math.max(0, t - P.from)) * Math.sin(2 * Math.PI * 0.46 * (t - P.from) + 1.2) * (1 - 0.92 * ease.inOut3((t - 14.2) / 1.5));', lamps='[[-1.3, 0.55, 0.7, 3.6]]', exposure=1.1, lyric=lyr(['Sara, Abram’s wife'], -0.62, BONE, 0.62))
sc('s03-maid', 'Round the small tent on an arc: on her name the wind draws back, then the indigo veil opens on its line.', U(60, 12, **CL),
   rig([[18.6, 1.2, 1.0], [16.6, 1.15, -0.4], [14.6, 1.3, -0.6]], [[12.8, 1.3, -6], [13.0, 1.4, -5.6], [13.3, 1.45, -5]], '38'),
   AG + [['Quern', 14.9, -2.4, 0.4], ['Bag', 10.2, -3.6, 0.4], ['Fold', 3, -20, 1.0]] + [['Palm', 2, -24, 1.0], ['Palm', 6, -27, 2.2, 0.85]], [LINE_AG],
   [IND('(t) => [0.6 * br(t), 0, 0.7 * br(t + 3) - 2.4 * g(t, 18.45, 0.3, 0.1, 0.25) + 6.0 * g(t, 18.95, 0.2, 0.6, 1.6)]')], update='u.uA.value[4] = 0.3 * ring(t, 19.1, 0.6, 0.5);', fires=[[10.8, 0.1, -4.2, 0.6]], lyric=lyr(['She had an Egyptian maid'], -0.7, BONE, 0.6, shade=0.45))
sc('s04-kept-me', 'The red cloth and the indigo on their lines either side of the camp: the red sinks on "kept me", gathers itself, then on "go to my maid" streams toward the indigo, which answers.', U(60, 13, **CL),
   rig([[-2.2, 1.25, 12.6], [0.6, 1.1, 11.6], [3.4, 1.3, 11.4]], [[2.6, 1.35, 5.2], [3.4, 1.35, 4.8], [4.4, 1.35, 4.6]], '[40, 37]'),
   HEARTH[:5] + [['Bag', 3.6, 4.0, -0.6], ['Cushion', 6.8, 6.4, 0.3], ['Basket', 8.4, 5.6, 0.0], ['Jar', 5.0, 7.6, 0.4, 0.95], ['Wood', -1.6, 6.6, 0.5]] + PALMS[:2], [([0.2, 2.1, 6.6], [2.8, 2.1, 6.2], True, 0.012), ([5.6, 2.1, 5.2], [8.2, 2.1, 4.6], True, 0.012)],
   [cloth([6.0, 2.085, 5.1], [7.8, 2.085, 4.7], 1.4, '(t) => [0.5 * br(t) + 4.6 * g(t, 27.3, 0.3, 0.9, 1.2), 0.2, 0.7 * br(t + 2) + 1.2 * g(t, 27.3, 0.3, 0.9, 1.2)]', '', 1), RED([0.6, 2.085, 6.54], [2.4, 2.085, 6.26], '(t) => [0.8 * br(t) + 4.0 * g(t, 20.6, 0.4, 0.9, 1.8) - 3.0 * g(t, 25.8, 0.4, 0.1, 0.25) + 11 * g(t, 26.4, 0.25, 2.2, 1.2), 0.8 * g(t, 26.4, 0.25, 2.2, 1.2), 0.6 * br(t + 5) + 2.6 * g(t, 26.4, 0.25, 2.2, 1.2)]')],
   fires=[[0.4, 0.15, 5.2, 0.9]], lamps='[null, [0.4, 0.5, 5.2, 1.4], [0, 1.3, 0.6, 1.6]]', lyric=lyr(['Sara said to Abram', 'from having children'], -0.68, BONE, 0.6, 0, 2.6, 0.5))
sc('s05-through-her', 'Against the low sun: the indigo veil lifts, its shadow falls across the empty cradle, and the cradle begins to rock.', U(198, 15, **CL),
   rig([[8.2, 1.0, 10.6], [7.0, 0.95, 10.0], [5.6, 1.05, 9.8]], [[4.6, 1.15, 5.6], [4.4, 1.15, 5.8], [4.2, 1.1, 6.0]], '[38, 32]'),
   [['Cradle', 4.2, 6.6, 0.1, 1.0, '0', 0.28], ['Frame', 4.2, 6.6, 0.1], ['Rug', 4.2, 6.6, 0.1], ['Cushion', 5.6, 7.2, 0.5], ['Jar', 2.6, 7.0, 0.4, 1.1], ['Jar', 2.2, 7.5, 1.3, 0.8], ['Bag', 6.1, 6.0, -0.5]], [([2.6, 2.35, 4.4], [5.8, 2.35, 4.2], True, 0.012)],
   [cloth([3.0, 2.35, 4.38], [5.3, 2.35, 4.23], 1.75, '(t) => [0.7 * br(t), 0, 0.5 * br(t + 2) - 1.8 * g(t, 31.0, 0.5, 0.1, 0.3) + 5.2 * g(t, 31.7, 0.4, 1.6, 2.4)]', 'gather: 1.3', 1)],
   update='{ const x = Math.max(0, t - 32.3); u.uA.value[0] = -0.05 * g(t, 32.0, 0.25, 0.05, 0.2) + 0.34 * (1 - Math.exp(-1.4 * x)) * Math.exp(-0.16 * x) * Math.sin(2 * Math.PI * 0.5 * x); }', exposure=1.1, lyric=lyr(['so I may have children'], -0.74, BONE, 0.6, shade=0.45), samples=8)
sc('s06-listened', 'Evening sky: Abram’s staff leans on one post; it trembles, lifts off, and falls across to lean on the other, where the red cloth hangs; it knocks, and rebounds once.', U(-70, 6, **CL),
   rig([[6.0, 0.55, 8.6], [7.0, 0.6, 8.0], [7.9, 0.72, 7.7]], [[7.6, 1.2, 3.6], [7.8, 1.2, 3.6], [8.0, 1.2, 3.6]], '38'),
   [['Staff', 7.5, 3.6, 0.0, 1.15, '0'], ['Jar', 5.9, 4.6, 0.4, 1.0], ['Basket', 6.3, 5.2, 0.0], ['Cushion', 8.6, 5.0, 0.3], ['Wood', 9.8, 4.4, 0.7]], [([6.75, 2.0, 3.55], [6.75, 1.99, 3.5], True, 0.0), ([8.3, 2.0, 3.55], [10.6, 2.0, 3.3], True, 0.012)],
   [RED([8.5, 1.985, 3.53], [10.2, 1.985, 3.34], '(t) => [-1.0 * br(t) - 3.0 * g(t, 37.6, 0.4, 0.3, 1.0), 0, 0.8 * br(t + 4)]', h=1.3)],
   update='{ let a = 0.36; if (t > 37.45) a += 0.018 * Math.sin((t - 37.45) * 26) * g(t, 37.45, 0.15, 0.2, 0.1); const k = Math.min(1, Math.max(0, (t - 37.8) / 0.72)); a -= 0.80 * k * k * (1.6 - 0.6 * k); if (t > 38.52) a += 0.075 * Math.abs(Math.sin(7.5 * (t - 38.52))) * Math.exp(-3.6 * (t - 38.52)); u.uA.value[0] = a; }', exposure=1.35, lyric=lyr(['Abram listened to Sara'], -0.76, BONE, 0.56))
sc('s07-ten-years', 'Ten years on one arc round the camp: the sun swings over again and again, and beside the tent a palm grows year by year.', U(-120, 24),
   rig([[-13, 5.0, 19], [-3.5, 3.6, 20.5], [7.5, 3.0, 18.5]], [[1, 1.6, 2], [2.2, 1.8, 3.5], [3.6, 2.0, 4.5]], '40'),
   HEARTH + PALMS + [['Grow', 7.2, 7.4, 0.5, 1.0], ['Jar', 5.6, 8.8, 0.2, '11'], ['Jar', 6.1, 8.3, 1.0, '12'], ['Jar', 5.2, 9.4, 2.0, '13'], ['Fold', -9, 12, 0.6]], [], [],
   update='''{ const x2 = (t - P.from) / (P.to - P.from - 0.5); let s = 0.14, st = 0; for (let i = 1; i <= 10; i++) { const ti = P.from + 0.2 + (i - 1) * (P.to - P.from - 0.9) / 10; const q = spring(t, ti, { freq: 3.4, damping: 0.5 }); s += 0.058 * q; const d = t - ti; if (d > 0) st += 0.10 * Math.exp(-7 * d) * Math.sin(20 * d); st -= 0.05 * g(t, ti - 0.1, 0.09, 0.0, 0.05); }
      u.uA.value[28] = s; u.uA.value[29] = st; u.uA.value[11] = spring(t, P.from + 1.0, { freq: 2.6 }); u.uA.value[12] = 0.85 * spring(t, P.from + 1.9, { freq: 2.6 }); u.uA.value[13] = 0.75 * spring(t, P.from + 2.7, { freq: 2.6 }); const a = (t - P.from) * 2.4, sn = Math.sin(a); u.uSunDir.value.set(-0.75 * Math.cos(a), 0.22 + 0.45 * sn * sn, 0.55); }''', fires=[[0.4, 0.15, 5.2, 0.9]],
   lyric=lyr(['After Abram had lived'], -0.64, DARK, 0.62, 0, 3, 0.3, "extra: (ctx, t, H) => { const y = Math.max(1, Math.min(10, Math.ceil(10 * (t - P.from - 0.1) / (P.to - P.from - 0.7)))); gauge(ctx, `YEAR ${y}`, 1920, H * 0.9, { size: 64, alpha: 0.9 }); }"))
sc('s08-took-agar', 'The indigo veil is drawn along a rope, away from the red cloth, across the camp to the staff at Abram’s side, and swings there.', U(75, 12, **CL),
   "(() => { const c = rig({ from: P.from, to: P.to, path: [[4.6, 1.35, 11.8], [0.2, 1.2, 10.8], [-4.6, 1.3, 9.6]], look: [[1.6, 1.4, 5], [-1.6, 1.4, 4.2], [-6, 1.4, 3]], fov: 38, enter: 'moving', exit: 'moving', handheld: 0.18 }); return (t) => { const q = c(t), m = follow((x) => C0.centre(Math.max(P.from, x)), t, 0.22); return { ...q, target: q.target.map((v, i) => v + ([m[0], 1.4, m[2]][i] - v) * 0.75) }; }; })()",
   HEARTH[:6] + [['Staff', -9.4, 2.9, 0.4, 1.05], ['Cushion', -8.2, 3.8, 0.4], ['Jar', -10.0, 3.9, 0.4, 1.1], ['Jar', -7.2, 2.2, 1.0, 0.8], ['Fold', -16, -1, 0.6]] + PALMS, [([4.6, 2.15, 6.9], [-9.0, 2.15, 3.1], True, 0.012)],
   [cloth([2.2, 2.1, 6.2], [0.4, 2.1, 5.7], 1.45, '(t) => [0.6 * br(t), 0, 0.6 * br(t + 2)]', '''pinAt: (w, t) => { const A = [4.6, 2.1, 6.9], B = [-9.0, 2.1, 3.1], k = 0.2 + 0.2 * anticipate(t, 45.3, { lead: 0.4, back: 0.15, dur: 1.5, land: weight.normal }) + 0.42 * anticipate(t, 48.75, { lead: 0.4, back: 0.07, dur: 2.0, land: weight.heavy }), s = k + (0.5 - w) * -0.125 * (1 - 0.35 * g(t, 48.7, 0.3, 0.8, 0.5)); return A.map((v, q) => v + (B[q] - v) * s); }''', 1), RED([4.3, 2.12, 6.82], [2.9, 2.12, 6.42], '(t) => [0.8 * br(t) - 3.6 * g(t, 45.2, 0.3, 0.4, 0.9) - 3.0 * g(t, 48.8, 0.3, 0.4, 1.0), 0, 0.5 * br(t + 6)]')],
   fires=[[0.4, 0.15, 5.2, 0.8]], lyric=lyr(['Sara took Agar', 'and gave her to Abram'], -0.66, BONE, 0.62, 0, 2.6, 0.45))
sc('s09-night-tents', 'Night: the lamp in the small tent flares, shrinks and goes out; the fire before it sinks to embers. Far off, Abram’s lamp burns on.', U(130, 40, 4.0, uSunCol=[4.6, 5.4, 7.6], uNight=1, uSunDisc=0, uStars=1, uMie=1.0, uDust=0.3, uAmbK=3.4, uMesa=0),
   rig([[17.4, 1.5, 0.6], [15.6, 1.35, 0.0], [13.4, 1.3, 0.0]], [[10, 1.2, -7.5], [9.2, 1.2, -7], [7.6, 1.2, -6]], '40'),
   AG, [LINE_AG], [IND('(t) => [0.4 * br(t), 0, 0.5 * br(t + 2)]')],
   update='{ const f = t < 53.5 ? 1 : t < 53.9 ? 1 + 0.9 * Math.sin((t - 53.5) / 0.4 * Math.PI * 0.5) : Math.max(0.001, 1.9 * Math.exp(-5.5 * (t - 53.9))); u.uLI.value[0] = 4.5 * f; }', fires=[[9.4, 0.1, -2.6, 0.42]], lamps='[[9.0, 0.5, -8.0, 4.5], [-11.6, 0.6, -4.0, 4.0], [9.4, 0.4, -2.6, 2.2]]', exposure=2.2)
sc('s10-conceived', 'Sunrise, close to the ground: the soil lifts, and a green shoot pushes through, bent, then straightens and opens its two leaves.', U(176, 6.5, **CL),
   rig([[0.95, 0.17, 13.5], [0.6, 0.2, 13.3], [0.3, 0.24, 13.15]], [[0, 0.22, 12], [0, 0.23, 12], [0, 0.24, 12]], '[40, 34]', "enter: 'moving', exit: 'moving', handheld: 0.05"),
   [['Sprout', 0, 12, 0.3, 1.0, '0'], ['Jar', -2.6, 8.2, 0.4, 1.1], ['Jar', -2.1, 8.6, 1.0, 0.8]], [], [],
   update='u.uA.value[0] = 0.10 * ease.inOut3((t - 56.2) / 1.0) + 0.40 * move(t, 57.1, 58.5, weight.heavy) + 0.5 * spring(t, 58.35, { freq: 0.62, damping: 0.45 });', exposure=1.1, lyric=lyr(['He went in to Agar'], 0.8, DARK, 0.56))
sc('s11-pregnant', 'The indigo veil, caught at its four corners, slackens, then fills and stays full, like a sail.', U(160, 22, **CL),
   rig([[6.4, 0.7, 14.6], [5.9, 1.0, 13.2], [5.4, 1.4, 12.0]], [[0.6, 1.5, 9.4], [0.7, 1.65, 9.4], [0.8, 1.75, 9.5]], '40'),
   HEARTH[:5] + [['Jar', 3.6, 9.0, 0.4, 1.1], ['Cushion', -1.6, 10.8, 0.3], ['Basket', 3.9, 9.9, 0.0], ['Palm', -17, -8, 0.5], ['Palm', -20, -12, 2.2, 0.85]], [([-1.2, 2.75, 9.2], [2.2, 2.75, 9.2], True, 0.012)],
   [cloth([-0.8, 2.735, 9.2], [1.8, 2.735, 9.2], 2.0, '(t) => [0.3 * br(t), 0, 0.2 * br(t) - 1.4 * g(t, 62.0, 0.4, 0.1, 0.25) + 7.5 * rise(t, 62.5, 1.0)]', 'gather: 1.3, turb: 0.15, fold: 0.1, more: [[0, 0.35, -0.8], [11, 0.65, 1.8]].map(([i, w, x]) => ({ i, j: 13, at: (t) => { const k = anticipate(t, 62.6, { lead: 0.4, back: 0.08, dur: 1.0, land: weight.normal }); return [(-0.8 + 2.6 * w) * (1 - k) + x * k, 0.8 + 0.38 * k, 9.2 + 0.15 * k]; } }))', 1)],
   lyric=lyr(['When she knew'], -0.72, BONE, 0.6, shade=0.45))
sc('s12-looked-down', 'From behind the raised indigo, down past its flicking hem, on the red cloth below, which shrinks back on its line.', U(150, 20, **CL),
   rig([[6.6, 4.6, 15.0], [5.4, 4.2, 14.0], [4.6, 3.8, 13.4]], [[3.7, 2.2, 8.4], [3.6, 2.15, 8.4], [3.6, 2.1, 8.4]], '40'),
   HEARTH[:6] + [['Basket', 1.6, 8.6, 0.0], ['Wood', 5.4, 7.4, 0.5], ['Rug', 3.4, 8.8, 0.1]], [([2.2, 4.1, 10.9], [5.4, 4.1, 10.6], True, 0.012), ([2.2, 1.65, 7.5], [4.9, 1.65, 7.3], True, 0.012)],
   [cloth([2.6, 4.085, 10.86], [5.0, 4.085, 10.64], 1.35, '(t) => [1.2 * br(t) - 3.0 * g(t, 64.6, 0.3, 0.4, 0.8), 0.3 + 3.6 * g(t, 65.1, 0.25, 0.9, 1.2), -1.0 - 6.0 * g(t, 65.1, 0.25, 0.9, 1.2)]', '', 1), RED([2.6, 1.635, 7.47], [4.5, 1.635, 7.33], '(t) => [0.4 * br(t), 0, 0.5 * br(t) + 2.4 * g(t, 64.8, 0.3, 0.1, 0.2) - 8.5 * g(t, 65.3, 0.22, 1.0, 1.8)]', 'gather: 1.35', h=1.15)],
   fires=[[0.4, 0.15, 5.2, 0.9]], lyric=lyr(['she looked down'], -0.74, BONE, 0.6, shade=0.5))
sc('s13-your-fault', 'Hard noon. The wind drops, the red cloth draws back, then snaps out; the great jar beside the staff rocks, topples and rolls.', U(-150, 52, 26, uMie=1.4, uDust=0.8),
   rig([[4.2, 1.15, 11.6], [2.6, 1.0, 10.8], [0.6, 0.85, 10.2]], [[1.2, 1.2, 6.2], [0.2, 1.0, 6.4], [-1.2, 0.6, 6.6]], '[40, 35]'),
   [['Jar', -1.5, 7.0, 0.0, 1.25, '0'], ['Staff', -3.0, 6.4, 0.3, 1.05, 0.12], ['Pot', 2.9, 4.6, 0.4], ['Quern', 4.4, 7.4, 0.8], ['Cushion', -3.8, 6.0, 0.3], ['Cushion', 1.0, 3.5, 0.3], ['Jar', -4.5, 5.0, 1.0, 0.9], ['Bag', 3.1, 4.0, -0.6], ['Rug', -0.1, 3.3, 0.0], ['Basket', -2.4, 7.6, 0.0]], [([-0.4, 2.15, 6.3], [2.3, 2.15, 6.1], True, 0.012)],
   [RED([0.0, 2.13, 6.27], [1.9, 2.13, 6.13], '(t) => [0.8 * br(t) + 2.0 * g(t, 69.2, 0.4, 0.4, 1.0) + 2.6 * g(t, 71.9, 0.5, 0.1, 0.2) - 15 * g(t, 72.6, 0.14, 0.3, 1.0), 0, 0.5 * br(t + 5) + 1.4 * g(t, 72.6, 0.16, 0.35, 1.0)]')],
   update='{ const d = t - 72.78; const rock = t > 72.0 && t < 72.78 ? -0.06 * Math.sin((t - 72.0) / 0.78 * Math.PI * 2) : 0; let fall = 0; if (d > 0) { const x = Math.min(1, d / 0.75); fall = 1.5 * x * x * x; if (d > 0.75) { const q = d - 0.75; fall = 1.5 - 0.22 * Math.abs(Math.sin(8.5 * q)) * Math.exp(-3.4 * q); } } u.uA.value[0] = -rock - fall; }', fires=[[2.9, 0.15, 4.6, 0.8]], lyric=lyr(['Sara said to Abram'], -0.74, BONE, 0.62, shade=0.45))
sc('s14-rope', 'Close on one tent peg: the rope lies slack, then each gust draws it tight, the ground cracks and the peg starts up a little more.', U(-150, 40, 26, uMie=1.4, uDust=0.9, uAperture=0.006, uFocus=1.15),
   rig([[7.35, 0.4, 5.75], [7.2, 0.36, 5.55], [7.0, 0.3, 5.5]], [[6.2, 0.2, 4.9], [6.18, 0.22, 4.88], [6.15, 0.26, 4.85]], '[40, 36]', "enter: 'moving', exit: 'moving', handheld: 0.06"),
   [['PegRope', 6.3, 5.0, 0.0], ['Bag', 3.4, 4.8, -0.5], ['Jar', 2.4, 4.6, 0.4, 1.0], ['Basket', 4.4, 6.2, 0.0]], [], [],
   update='{ let y = 0, sl = 0.30; for (const [a, d] of [[77.15, 0.022], [78.25, 0.03], [79.25, 0.034], [80.25, 0.045]]) { y += d * spring(t, a + 0.1, { freq: 5, damping: 0.4 }) - 0.010 * g(t, a - 0.08, 0.1, 0.02, 0.06); sl -= 0.30 * g(t, a - 0.12, 0.14, 0.3, 0.5); } u.uA.value[5] = Math.max(0, y); u.uA.value[6] = Math.max(0.0, sl) + 0.012 * Math.sin(t * 31) * Math.max(0, 1 - sl / 0.1); u.uFlap.value = 1.5 + 2.5 * (g(t, 77.1, 0.2, 0.2, 0.5) + g(t, 78.2, 0.2, 0.2, 0.5) + g(t, 79.2, 0.2, 0.2, 0.5) + g(t, 80.2, 0.2, 0.4, 0.8)); }', lyric=lyr(['I gave my maid to you'], -0.8, BONE, 0.6, shade=0.5))
sc('s15-judge', 'A bronze balance against the sun: one pan drops, then the other; slowly the beam comes level as the camera rises into the light.', U(181, 15, 28, uMie=1.6, **CL),
   rig([[1.7, 0.6, 12.6], [0.9, 1.0, 12.3], [0.15, 1.7, 12.1]], [[0, 1.1, 9.5], [0, 1.3, 9.5], [0, 1.65, 9.5]], '[40, 36]'),
   [['Balance', 0, 9.5, 0.0, 1.0, '0'], ['Cushion', -2.2, 8.6, 0.4], ['Cushion', 2.3, 8.7, -0.4], ['Rug', 0, 9.5, 0.0], ['Jar', -3.2, 8.2, 0.4, 1.1]], [], [],
   update='{ const b = (q) => 0.30 * anticipate(q, 82.4, { lead: 0.35, back: 0.15, dur: 0.6, land: weight.heavy }) - 0.56 * spring(q, 83.5, { freq: 0.7, damping: 0.35 }) + 0.26 * spring(q, 85.0, { freq: 0.55, damping: 0.3 }); u.uA.value[0] = b(t); const v = (q) => (b(q + 0.02) - b(q - 0.02)) / 0.04; u.uA.value[30] = follow(v, t, 0.16) * 0.14 + 0.03 * Math.sin(t * 2.6); u.uA.value[31] = follow(v, t, 0.2) * 0.14 + 0.03 * Math.sin(t * 2.4 + 1); }', exposure=0.95, lyric=lyr(['I am dishonored'], 0.8, DARK, 0.6, -0.12))
sc('s16-between', 'The red cloth and the indigo face each other across the fire; the wind takes the smoke to one, then to the other.', U(-140, 34, 26, uMie=1.5, **CL),
   rig([[-3.4, 1.2, 12.8], [0, 1.05, 12.2], [3.4, 1.25, 12.8]], [[-0.4, 1.25, 6.8], [0, 1.25, 6.8], [0.4, 1.25, 6.8]], '40'),
   [['Pot', 0, 7.2, 0.4], ['Rug', -2.6, 8.2, 0.3], ['Rug', 2.7, 8.3, -0.3], ['Jar', -4.4, 8.2, 0.4, 1.1], ['Jar', 4.6, 8.0, 1.0, 1.0], ['Cushion', -1.5, 9.4, 0.4], ['Cushion', 1.7, 9.5, -0.4], ['Quern', 4.0, 9.6, 0.5]], [([-4.4, 2.15, 6.9], [-1.7, 2.15, 6.7], True, 0.012), ([1.7, 2.15, 6.7], [4.4, 2.15, 6.9], True, 0.012)],
   [cloth([2.1, 2.13, 6.73], [3.9, 2.13, 6.87], 1.45, '(t) => [0.6 * br(t) + 7 * g(t, 88.5, 0.3, 0.5, 0.6) - 7.5 * g(t, 89.8, 0.3, 0.5, 0.6) + 5.0 * g(t, 91.6, 0.25, 0.7, 0.9), 0, 0.5 * br(t + 2)]', '', 1), RED([-3.9, 2.13, 6.87], [-2.1, 2.13, 6.73], '(t) => [0.6 * br(t) + 7 * g(t, 88.4, 0.3, 0.5, 0.6) - 7.5 * g(t, 89.9, 0.3, 0.5, 0.6) - 4.8 * g(t, 91.5, 0.25, 0.7, 0.9), 0, 0.5 * br(t + 7)]')],
   update='{ const wx = (q) => 11 * g(q, 88.5, 0.3, 0.7, 0.6) - 12 * g(q, 89.9, 0.3, 0.7, 0.6); u.uSmk.value.set(follow(wx, t, 0.35) + 0.6 * br(t), 0, 0.4); }', fires=[[0, 0.2, 7.2, 0.9]], lamps='[null, [0, 0.5, 7.2, 1.5]]', lyric=lyr(['between you and me'], 0.7, DARK, 0.56))
sc('s17-in-your-hands', 'One corner of the indigo is held fast to Abram’s staff. It pulls; on "treat her as you think best" the corner comes away, and the cloth swings across to the red.', U(-50, 20, 28, **CL),
   rig([[-2.6, 1.0, 14.6], [-0.6, 1.1, 14.0], [1.2, 1.3, 13.8]], [[0.2, 1.35, 8.6], [0.5, 1.4, 8.5], [0.8, 1.4, 8.4]], '40'),
   HEARTH[:6] + [['Staff', -2.35, 8.9, 0.0, 1.15, '0'], ['Jar', -3.3, 9.4, 0.4, 1.1], ['Cushion', -2.9, 10.2, 0.4], ['Basket', 4.9, 9.2, 0.0], ['Rug', -2.6, 9.6, 0.2], ['Wood', 3.2, 9.4, 0.5]], [([-0.9, 2.3, 8.7], [1.5, 2.3, 8.5], True, 0.012), ([1.9, 2.1, 8.4], [4.3, 2.1, 8.2], True, 0.012)], [],
   setup="const gw = (t) => 2.6 * g(t, 94.9, 0.4, 0.4, 0.8) + 3.2 * g(t, 96.4, 0.35, 0.5, 0.8);\n  const C0 = cloth({ a: [-0.6, 2.285, 8.68], b: [1.2, 2.285, 8.52], h: 1.7, t0: P.from - 2.5, seed: 1, more: [{ i: 0, j: 13, until: 97.75, at: (t) => [-2.3 + 0.03 * gw(t), 1.45, 8.9] }], wind: (t) => [0.6 * br(t) + gw(t) + 7.5 * g(t, 97.6, 0.3, 1.2, 1.6), 0.4 * g(t, 97.6, 0.3, 1.2, 1.6), 0.5 * br(t + 2)] });\n  const C1 = cloth({ a: [2.3, 2.085, 8.37], b: [3.9, 2.085, 8.23], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [0.7 * br(t) + 0.8 * gw(t) - 2.0 * g(t, 97.2, 0.3, 0.4, 0.5) + 3.0 * g(t, 98.3, 0.3, 0.8, 1.4), 0, 0.6 * br(t + 5)] });",
   update='putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2; u.uA.value[0] = -0.05 * gw(t) * 0.25 + 0.10 * (spring(t, 97.78, { freq: 1.6, damping: 0.25 }) - rise(t, 97.78, 0.6)) ;', fires=[[0.4, 0.15, 5.2, 0.8]], lamps='[null, [0.4, 0.5, 5.2, 1.4]]', lyric=lyr(['Abram said to Sara', 'Treat her as you think'], -0.7, BONE, 0.6, 0, 2.6, 0.5))
sc('s18-afflicted', 'The red cloth gusts and the indigo strains on its line; its pins go one after another, then it tears free and flies on an arc into the open country, and the camera goes after it.', U(-140, 30, 28, uMie=2.0, uDust=0.9),
   "(() => { const c = rig({ from: P.from, to: P.to, path: [[-2.6, 1.15, 14.2], [-0.4, 1.1, 13.6], [3.2, 1.5, 13.2]], look: [[-0.6, 1.4, 8.8], [0, 1.45, 8.6], [0.4, 1.5, 8.4]], fov: (t) => 40 - 21 * ease.inOut3((t - 106.2) / 1.9), enter: 'moving', exit: 'moving', handheld: 0.15 }); return (t) => { const q = c(t), k = ease.inOut3((t - 105.6) / 1.0), m = follow((x) => C0.centre(Math.max(P.from, x)), t, 0.1); return { ...q, target: q.target.map((v, i) => v + (m[i] - v) * k) }; }; })()",
   HEARTH[:6] + [['Jar', -5.2, 9.2, 0.4, 1.15], ['Jar', -4.8, 9.7, 1.0, 0.8], ['Cushion', -1.0, 10.4, 0.4], ['Quern', 3.4, 9.9, 0.5], ['Fold', 17, 2, 0.6], ['Palm', 33, -15, 0.4], ['Palm', 37, -18, 2.0, 0.85]], [([-4.6, 2.15, 8.6], [-2.2, 2.15, 8.5], True, 0.012), ([-0.8, 2.2, 8.8], [1.7, 2.2, 8.6], True, 0.012)], [],
   setup="const gw = (t) => 2.2 * rise(t, 101.2, 1.2) + 2.4 * rise(t, 103.2, 1.2) + 4.6 * g(t, 102.3, 0.2, 0.2, 0.5) + 5 * g(t, 103.6, 0.2, 0.2, 0.5) + 5.5 * g(t, 104.8, 0.25, 0.2, 0.4);\nconst C0 = cloth({ a: [-0.45, 2.18, 8.77], b: [1.35, 2.18, 8.63], h: 1.5, t0: P.from - 2.5, seed: 1, release: { 0: 102.5, 1: 102.55, 2: 103.8, 3: 103.83, 4: 103.88, 5: 105.0, 6: 105.04, 7: 105.08, 8: 105.12, 9: 105.7, 10: 105.73, 11: 105.78 }, flutter: (t) => 10 * rise(t, 102.4, 0.6) + 34 * rise(t, 105.7, 0.4), wind: (t) => [1.2 * br(t) + 1.25 * gw(t) + 9.0 * rise(t, 105.6, 0.4), 11.0 * rise(t, 105.65, 0.4) * (1 - 0.45 * rise(t, 106.9, 1.2)), 0.6 * br(t + 3) - 6.0 * rise(t, 105.9, 0.8)] });\nconst C1 = cloth({ a: [-4.2, 2.13, 8.58], b: [-2.6, 2.13, 8.52], h: 1.35, t0: P.from - 2.5, seed: 4, wind: (t) => [1.0 * br(t) + 1.15 * gw(t) * (1 - rise(t, 105.9, 1.0)), 0, 0.6 * br(t + 5)] });",
   update='putCloth(u, 0, C0, t); putCloth(u, 1, C1, t); u.uClN.value = 2; u.uFlap.value = 1 + 0.5 * gw(t); u.uSmk.value.set(1.0 + 0.6 * follow(gw, t, 0.4), 0, 0.3);', fires=[[0.4, 0.15, 5.2, 0.9]], lyric=lyr(['Sara afflicted Agar'], -0.74, BONE, 0.58, shade=0.45), samples=16)

js = json.dumps
for s in S:
    P = BY[s['name']]; n = len(s['cloths'])
    assert any(s['name'] == k for k in BY)
    setup = s['setup'] + ''.join(f"\n  const C{i} = {c};" for i, c in enumerate(s['cloths']))
    up = ''.join(f" putCloth(u, {i}, C{i}, t);" for i in range(n)) + (f" u.uClN.value = {n};" if n else '')
    if n == 1 and s['cloths'][0].find('seed: 4') > 0: up += ' u.uClOwn.value.set(1, 1, 0);'
    fires = ''.join(f" u.uFireP.value.splice({i * 4}, 4, {f[0]}, {f[1]}, {f[2]}, {f[3]});" for i, f in enumerate(s['fires']))
    if fires: fires += f" u.uFireN.value = {len(s['fires'])}; u.uSmk.value.set(follow((q) => 1.1 * br(q), t, 0.4) + 0.7, 0, 0.5);"
    uni = ', '.join(f"{k}: {js(v)}" for k, v in s['u'].items())
    open(f"scenes/{s['name']}.js", 'w').write(f"""// {s['about']}
import {{ worldGLSL, WORLD_UNIFORMS, setLamps, skyLight, keys, ease }} from '/song/lib/world4.js';
import {{ cloth, putCloth }} from '/song/lib/cloth.js';
import {{ grade }} from '/song/lib/look.js';
import {{ rig, spring, anticipate, follow, fractal, weight, move }} from '/kit/motion.js';

const PROPS = {js(s['props'])};
const LINES = {js(s['lines'])};
const LAMPS = {s['lamps']};
// a breeze that never repeats; one gust; a lasting rise; a hanging thing ringing after a push
const br = (t) => 0.6 + 0.5 * fractal(t * 0.45, {{ seed: 3, octaves: 3 }}) + 0.25 * fractal(t * 1.4, {{ seed: 8, octaves: 2 }});
const g = (t, t0, up, hold, down) => (t < t0 ? 0 : t < t0 + up ? ease.inOut3((t - t0) / up) : t < t0 + up + hold ? 1 : Math.exp(-(t - t0 - up - hold) / (down * 0.45)));
const rise = (t, t0, d) => ease.inOut3((t - t0) / d);
const ring = (t, t0, f, d) => (t < t0 ? 0 : Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-d * (t - t0)));

export default (P) => {{
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  {setup}
  const camera = {s['cam']};
  return {{
    name: '{s['name']}', from: P.from, to: P.to,
    frag: worldGLSL(PROPS, LINES) + `vec3 shade(vec2 fc) {{ return world(fc); }}`,
    uniforms: {{ ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), uA: new Array(32).fill(0), uClA: new Array(672).fill(0), uClB: new Array(672).fill(0), uClRow: new Array(104).fill(0), uClSph: new Array(8).fill(0), uFireP: new Array(12).fill(0), uSmk: [0, 0, 0], uClOwn: [0, 1, 0], {uni} }},
    camera,
    update(t, u) {{
      setLamps(u, LAMPS);{fires}{up}
      {s['update']}
      skyLight(u);
    }},
    post: (t) => grade(t, {{ exposure: {s['exposure']} }}),
  }};
}};
""")
    L = s['lyric'] or dict(lines=[])
    if L.get('title'):
        o = "lines: [], sy: 0.42, frac: 0.86, aspect: 3, shade: 0.4, extra: (ctx, t, H) => { titleCard(ctx, H, ease.inOut3((t - P.from - 0.6) / 1.4), ease.inOut3((t - P.from - 1.8) / 2.0), 1 - ease.inOut3((t - P.to + 1.2) / 1.0)); }"
    else:
        o = ', '.join([f"lines: {js(L['lines'])}"] + [f"{k}: {L[k]}" for k in ('sy', 'sx', 'frac', 'aspect', 'shade', 'ink') if k in L]) + (', ' + L['extra'] if L.get('extra') else '')
    open(f"scenes/{s['name']}.lyric.js", 'w').write(f"""// The words of {s['name']}, on a plane that travels with its camera.
import scene from '/song/scenes/{s['name']}.js';
import {{ layer, gauge, titleCard, ease }} from '/song/lib/type3.js';

export default (P) => layer(P, scene(P), {{ {o} }});
""")
    if s['samples'] == 16: P['samples'] = 16
    else: P.pop('samples', None)
json.dump(F, open('film.json', 'w'), indent=1); print(len(S), 'early scenes written')
