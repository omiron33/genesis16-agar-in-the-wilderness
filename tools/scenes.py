"""The film's scenes, authored in one table: writes docs/plan.json, scenes/<name>.js and
scenes/<name>.lyric.js, then runs tools/plan.py (cuts on measured beats -> film.json) and adds the
film-wide settings.  python3 tools/scenes.py
Each scene is one world setting, one eased camera move (A -> B) and one lyric plane.

Geography: the camp (hill country) has Sara's great tent at the origin opening to +z, Abram's tent at
(-11, -5), the maid's small tent at (9.5, -9), an acacia at (6, 8). In the wilderness the spring is at
the origin, its palms round it, the well-head at (-7.5, 3); the road to Sur runs off to the west."""
import json, os, subprocess, math

def sun(az_deg, el_deg):
    a, e = math.radians(az_deg), math.radians(el_deg)
    return [round(math.sin(a) * math.cos(e), 4), round(math.sin(e), 4), round(math.cos(a) * math.cos(e), 4)]

W = 30.0
HILLS = dict(uShrubs=0.0, uLand=0, uDunes=0, uMesa=0, uMie=1.6, uDust=0.5, uDustH=25, uFlatR=16, uWind=[0.8, 0.6])
DESERT = dict(uShrubs=0.0, uLand=1, uDunes=1, uMesa=1, uMie=2.6, uDust=0.8, uDustH=18, uFlatR=12, uWind=[1.0, 0.25])
AFTERNOON = dict(uSunDir=sun(-120, 24), uSunCol=[W, W, W])
GOLDEN = dict(uSunDir=sun(30, 11), uSunCol=[W, W, W], uCloud=1, uCloudCov=0.42, uCloudH=2400)
NOON = dict(uSunDir=sun(-160, 62), uSunCol=[W * 0.8] * 3, uMie=1.4)
HEAT = dict(uSunDir=sun(-140, 30), uSunCol=[W] * 3, uMie=2.6, uDust=1.1)
DUSK = dict(uSunDir=sun(-95, 2.5), uSunCol=[W, W, W])
BLUE = dict(uSunDir=sun(-95, -1.5), uSunCol=[W, W, W], uAmbK=2.2)
NIGHT = dict(uSunDir=sun(130, 40), uSunCol=[4.6, 5.4, 7.6], uNight=1, uSunDisc=0, uStars=1, uMie=1.0, uDust=0.3, uAmbK=3.4)
DAWN = dict(uSunDir=sun(85, 3), uSunCol=[W, W, W])
CAMP = dict(uTentsOn=1, uCamp=[0, 0, 0], uTreeOn=1, uTree=[-8, 0, 10])
SPRING = dict(uSpringOn=1, uSpring=[0, 0, 0], uSpringR=5, uWaterY=-0.3, uSrc=[0.6, -0.4], uPalms=3, uFlatR=14)
VEIL_LINE = dict(uLineOn=1, uLine=[14.6, 1.55, -9.4], uLineYaw=0.9, uVeilOn=1, uVeil=[14.6, 1.55, -9.4], uVeilYaw=0.9, uVeilTilt=0.35, uVeilBlow=0.5)
SARA_LAMP = '[0.3, 0.55, 0.6, 2.2]'
AGAR_LAMP = '[9.6, 0.45, -8.4, 1.6]'
ABRAM_LAMP = '[-10.8, 0.5, -4.2, 1.8]'
DARK = '44, 30, 20'
BONEINK = '243, 235, 222'

def U(*dicts, **kw):
    d = {}
    for x in dicts: d.update(x)
    d.update(kw)
    return d
def C(pos, target, fov=40): return dict(pos=pos, target=target, fov=fov)
lo = lambda sy, dist, frac=0.72, aspect=2.6, sx=0: f"standing(inView(from, {sx}, {sy}, {dist}), from, {frac}, {aspect})"

S = []
def scene(slug, at, about, uniforms, A, B, exposure=1.0, lamps='[]', update='', lyric=None, samples=None, hold=None):
    S.append(dict(slug=slug, at=at, about=about, uniforms=uniforms, A=A, B=B, exposure=exposure, lamps=lamps, update=update, lyric=lyric, samples=samples, hold=hold))

def eye(cam, sd, h=2000.0, a=2600.0, hh=1500.0):
    """the eye in the cloud deck, centred where the sun's ray meets the deck seen from `cam`"""
    k = (h - cam[1]) / sd[1]
    c = [cam[0] + sd[0] * k, cam[2] + sd[2] * k]
    px, pz = -sd[2], sd[0]
    return dict(uEyeC=[round(c[0], 1), round(c[1], 1)], uEyeYaw=round(math.atan2(pz, px), 4), uEyeR=[a, hh], uCloudH=h)

# ================= Intro and Verse 1: the household that waits =================
scene('title', '0s', 'The hill country in the late afternoon; far off, the black tents of Abram\'s camp under one acacia. The title stands over the land.',
      U(HILLS, GOLDEN, CAMP), C([-60, 9, 70], [0, 1, 0], 34), C([-52, 8, 60], [0, 1.5, 0], 32), exposure=1.0,
      lyric=dict(lines=[], title=True, plane="standing(inView(from, 0, 0.18, 60), from, 0.9, 3)"), hold='the title over the opening bars')
scene('camp', '7.6s', 'Low through the dry grass towards the great tent; the wind moves the grass and the tent cloth.',
      U(HILLS, GOLDEN, CAMP), C([-14, 0.6, 26], [0, 1.2, 0], 36), C([-10, 0.55, 19], [0, 1.3, 0], 36),
      lyric=dict(lines=[], plane=lo(0.42, 30, 0.4, 3)))
scene('no-children', 0, 'The open front of Sara\'s great tent: in the shade, an empty rug and one lamp; no child\'s things anywhere.',
      U(HILLS, GOLDEN, CAMP), C([3.0, 0.9, 9.0], [0, 0.7, 0], 34), C([1.8, 0.85, 7.0], [0, 0.7, 0], 34), lamps='[[0.3, 0.45, 0.2, 4.0]]',
      lyric=dict(lines=['Sara, Abram’s wife'], plane=lo(-0.55, 12, 0.66), ink=BONEINK, shade=0.4))
scene('maid', 1, 'Apart from the others, the small tent; an indigo veil hangs on a line beside it, lifting in the wind.',
      U(HILLS, GOLDEN, CAMP, VEIL_LINE), C([20, 1.1, -1.0], [11.5, 1.2, -8.5], 34), C([18.6, 1.0, -2.2], [11.5, 1.25, -8.5], 34),
      lyric=dict(lines=['She had an Egyptian maid'], plane=lo(0.5, 16, 0.7)))
scene('kept-me', 2, 'The great tent and Abram\'s tent side by side, the low sun behind them; the acacia\'s long shadow.',
      U(HILLS, GOLDEN, CAMP), C([8, 1.4, 20], [-5, 1.5, -2], 38), C([4, 1.3, 21], [-6, 1.6, -2], 38),
      lyric=dict(lines=['Sara said to Abram', 'from having children'], plane=lo(0.56, 22, 0.56, 2.6, 0.3)), hold='Sara\'s proposal over two lines')
scene('through-her', 4, 'Close and low on the indigo veil lifting on its line, the camp soft behind it.',
      U(HILLS, GOLDEN, CAMP, VEIL_LINE, uAperture=0.014, uFocus=2.1, uVeilBlow=0.8), C([16.2, 0.95, -7.9], [14.6, 1.0, -9.4], 40), C([15.9, 0.9, -8.2], [14.5, 1.05, -9.4], 40), samples=16,
      lyric=dict(lines=['so I may have children'], anchorAt=0.8, plane=lo(0.78, 6, 0.44, 3, 0.42), ink=BONEINK, shade=0.3), hold='one line and the bar after it')
scene('listened', 5, 'Evening: close on the great tent as a lamp is lit inside; its light comes through the seams of the cloth.',
      U(HILLS, DUSK, CAMP, uAperture=0.010, uFocus=2.6), C([-9.0, 1.0, 3.0], [-3.6, 1.15, -0.4], 36), C([-8.0, 1.0, 2.4], [-3.6, 1.2, -0.5], 36), exposure=1.4, lamps='[[-2.6, 0.6, -0.6, 3.0]]',
      update="u.uLI.value[0] = 3.0 * ease.inOut3((t - P.from - 0.6) / 1.0);", samples=16,
      lyric=dict(lines=['Abram listened to Sara'], plane=lo(0.5, 12)))
scene('ten-years', 6, 'Ten years: from a hill above the camp the sun crosses the sky again and again; the tents stay.',
      U(HILLS, AFTERNOON, CAMP), C([-30, 14, 40], [0, 0, 0], 40), C([-26, 13, 38], [0, 0.5, 0], 40),
      update="const a = (t - P.from) * 2.4; const s = Math.sin(a); u.uSunDir.value.set(-0.7 * Math.cos(a), 0.06 + 0.6 * Math.abs(s), -0.5);",
      lyric=dict(lines=['After Abram had lived'], plane=lo(-0.5, 40), ink=DARK, shade=0.25,
                 extra="(ctx, t, H) => { const y = Math.max(1, Math.min(10, Math.ceil(10 * ease.inOut3((t - P.from) / (P.to - P.from - 0.6))))); gauge(ctx, `YEAR ${y}`, 1920, H * 0.9, { size: 64, alpha: 0.9, ink: '" + DARK + "' }); }"))
scene('took-agar', 7, 'In the late light, a trail of a woman\'s footprints in the dust leads from the small tent across to Abram\'s.',
      U(HILLS, GOLDEN, CAMP, uSteps=[8.0, -6.6, 0, 0], uStepsN=26, uStepsDir=-1.72), C([9.6, 1.25, -5.0], [-6, -0.2, -8.6], 40), C([8.6, 1.2, -5.2], [-6, -0.2, -8.6], 40),
      lyric=dict(lines=['Sara took Agar', 'and gave her to Abram'], plane=lo(0.5, 14, 0.7)))
scene('night-tents', '51.9s', 'Night over the camp: Abram\'s tent lit, the small tent dark, the great tent\'s lamp low. Stars.',
      U(HILLS, NIGHT, CAMP), C([-4, 1.2, 26], [0, 2.5, -6], 44), C([-3, 1.4, 22], [0, 3.0, -6], 44), exposure=1.6, lamps=f'[{SARA_LAMP.replace("2.2", "0.8")}, {ABRAM_LAMP}]',
      lyric=dict(lines=[], gauge=False, plane=lo(0.5, 20)), hold='the instrumental bars between the verses')

# ================= Verse 2: the quarrel =================
scene('conceived', 9, 'Sunrise behind the small tent: a new day comes up over the hills beyond it.',
      U(HILLS, sun_morning := dict(uSunDir=sun(150, 6), uSunCol=[W, W, W]), CAMP, VEIL_LINE), C([6.2, 0.8, -2.6], [13, 1.9, -15], 36), C([6.6, 0.85, -3.3], [13, 2.1, -15], 36),
      lyric=dict(lines=['He went in to Agar'], plane=lo(0.55, 8, 0.66)))
scene('pregnant', 10, 'The small tent in full morning light, the veil on its line, the camp beyond.',
      U(HILLS, sun_morning, CAMP, VEIL_LINE), C([20, 2.4, -16], [6, 1, -6], 40), C([19, 2.2, -13], [6, 1, -6], 40),
      lyric=dict(lines=['When she knew'], plane=lo(0.5, 18), ink=DARK, shade=0.25))
scene('looked-down', 11, 'From the rise where the small tent stands, looking down on the great tent below.',
      U(HILLS, sun_morning, CAMP, uFlat=[0, 0, 0], uFlatR=8), C([11, 4.5, -11], [0, 0.6, 1], 36), C([10, 5.4, -10.5], [0, 0.4, 1], 36),
      lyric=dict(lines=['she looked down'], plane=lo(-0.5, 14), ink=BONEINK, shade=0.25))
scene('your-fault', 12, 'Noon, hard and white: the camp with short black shadows; the wind lifts dust between the tents.',
      U(HILLS, NOON, CAMP, uDust=1.0), C([-20, 1.6, 14], [0, 1.3, -3], 36), C([-16, 1.6, 15], [0, 1.4, -3], 36),
      lyric=dict(lines=['Sara said to Abram'], anchorAt=0.8, plane=lo(0.64, 20, 0.44, 2.6, -0.48), ink=DARK, shade=0.25), hold='Sara\'s complaint and the bars after it')
scene('rope', 13, 'Low by the small tent in the hard noon light: its ropes taut in the gusts.',
      U(HILLS, NOON, CAMP, uDust=1.0), C([16.5, 0.4, -3.5], [11, 1.1, -8], 40), C([15.8, 0.4, -4.2], [11, 1.2, -8], 40),
      lyric=dict(lines=['I gave my maid to you'], plane=lo(0.6, 8, 0.7), ink=DARK, shade=0.25))
scene('judge', 14, 'The camera tips up from the camp into the blazing white sun: let the Lord judge.',
      U(HILLS, NOON, CAMP, uSunDir=sun(159, 32)), C([5, 1.2, 21], [6, 3.0, 0], 40), C([5, 1.2, 21], [9, 11, -6], 40), exposure=0.8,
      lyric=dict(lines=['I am dishonored'], anchorAt=0.6, plane=lo(-0.2, 20, 0.66), ink=DARK, shade=0.5))
scene('between', 15, 'The great tent and the small tent, and the bare ground between them, framed square.',
      U(HILLS, NOON, CAMP, uSunDir=sun(-170, 55)), C([4.8, 1.3, 13], [4.8, 0.8, -4], 40), C([4.8, 1.25, 11.5], [4.8, 0.8, -4], 40),
      lyric=dict(lines=['between you and me'], plane=lo(0.5, 14), ink=DARK, shade=0.25))
scene('in-your-hands', 16, 'Abram\'s tent: the camera draws back from its dark doorway.',
      U(HILLS, AFTERNOON, CAMP), C([-8.0, 1.0, 1.2], [-11, 0.9, -5], 34), C([-5.5, 1.1, 4.0], [-11, 0.9, -5], 34),
      lyric=dict(lines=['Abram said to Sara', 'Treat her as you think'], plane=lo(0.68, 12, 0.66)))
scene('afflicted', 18, 'The wind tears the indigo veil from its line; it tumbles away over the ground towards the open country.',
      U(HILLS, HEAT, CAMP, VEIL_LINE, uLand=0, uVeilBlow=1.0), C([20, 1.0, -2], [14.6, 1.0, -9], 40), C([22, 1.2, 1], [19, 0.6, -7], 40),
      update="const k = ease.in2((t - P.from - 2.2) / 4.5); u.uVeil.value.set(14.6 + 4.6 * k, 1.55 + 0.5 * Math.sin(Math.min(1, k) * 3.1416) + 0.25 * k, -9.4 + 3.4 * k); u.uVeilTilt.value = 0.35 + 0.8 * Math.min(1, k * 1.5); u.uVeilYaw.value = -0.7 + 1.6 * k;",
      lyric=dict(lines=['Sara afflicted Agar'], anchorAt=0.75, plane=lo(0.58, 14, 0.62), ink=DARK, shade=0.25), hold='the line is drawn out: Agar is driven out', samples=16)
scene('flight', '108.6s', 'Low over the sand: one of her footprints, and the wind already filling it, the trail running on up the dune.',
      U(DESERT, HEAT, uSunDir=sun(100, 11), uFlat=[0, 0, 0], uFlatR=40, uSteps=[0, 2.5, 0, 0], uStepsN=40, uStepsDir=3.14159, uMie=1.2, uDust=0.4), C([0.35, 0.6, 4.2], [0.0, 0.0, 2.4], 40), C([0.3, 0.7, 4.0], [0.0, 0.05, 2.0], 40), samples=16,
      update="u.uStepsFill.value = 0.36 * ease.inOut3(x(t)); u.uWindT.value = t * 30.0;",
      lyric=dict(lines=[], gauge=False, plane=lo(0.5, 14)), hold='the instrumental: the flight')
scene('wilderness', '114.6s', 'High above: the tiny line of footprints across an endless field of dunes; heat haze.',
      U(DESERT, HEAT, uSunDir=sun(160, 16), uFlat=[0, 0, 0], uFlatR=34, uSteps=[0, 20, 0, 0], uStepsN=70, uStepsDir=3.14159), C([2.0, 1.9, 23], [-0.5, 1.2, -20], 42), C([1.6, 2.1, 21], [-0.5, 1.4, -24], 42),
      lyric=dict(lines=[], gauge=False, plane=lo(0.5, 50)))

# ================= Verse 3: the spring =================
SPR = U(DESERT, SPRING, DUSK, uSteps=[14, 22, 0, 0], uStepsN=30, uStepsDir=-2.55)
scene('found-her', 19, 'Dusk in the wilderness: the footprints come down to a spring in a hollow under three palms.',
      U(SPR), C([16, 3.2, 24], [2, 0, 2], 38), C([11, 2.4, 17], [1, 0, 1], 38),
      lyric=dict(lines=['The Lord’s angel found her'], anchorAt=0.9, plane=lo(0.5, 20, 0.66)))
scene('road-to-sur', 20, 'Wide: the spring and its palms small in the desert; the wall of the escarpment (Sur) catches the last light.',
      U(SPR, uMesaAz=1.6), C([-30, 9, 40], [0, 2, 0], 40), C([-36, 11, 34], [0, 3, 0], 40),
      lyric=dict(lines=['in the wilderness'], plane=lo(0.5, 40)))
scene('angel', 21, 'Over the water, a light gathers: the angel of the Lord. Its reflection lies on the spring.',
      U(SPR, BLUE, uAngelI=0), C([6, 1.5, 9], [0, 1.2, 0], 40), C([5, 1.3, 7.6], [0, 1.3, 0], 40), exposure=1.75,
      update="u.uAngel.value.set(0, 2.2, -0.6); u.uAngelI.value = 3.0 * ease.inOut3((t - P.from - 0.3) / 2.2);",
      lyric=dict(lines=['The angel said'], plane=lo(0.55, 14, 0.75, 2.4)))
scene('come-from', 22, 'The light over the water, the camera drifting round it at the edge of the spring.',
      U(SPR, BLUE, uAngel=[0, 2.2, -0.6], uAngelI=3.0), C([4, 1.2, 6], [0, 2.4, -0.6], 40), C([5.2, 1.0, 5.0], [0, 2.6, -0.6], 40), exposure=1.3,
      lyric=dict(lines=['where have you come from'], plane=lo(0.5, 14)))
scene('fleeing', 23, 'Low at the water\'s edge: the indigo veil where it was dropped; a drop falls into the spring.',
      U(SPR, BLUE, uAngel=[0, 2.2, -0.6], uAngelI=3.0, uVeilOn=1, uVeil=[4.0, 0.0, 3.3], uVeilYaw=-0.6, uVeilTilt=1.5708, uVeilBlow=0.0, uSkinOn=0, uAperture=0.010, uFocus=4.2, uDropOn=1, uDrop=[2.3, 1.7]), C([6.9, 1.9, 6.6], [3.7, -0.35, 3.0], 38), C([6.5, 1.75, 6.1], [3.6, -0.35, 2.9], 38), exposure=1.75, samples=16,
      update="u.uDropT.value = P.from + 2.6;",
      lyric=dict(lines=['She said, “I am fleeing'], plane=lo(0.55, 7, 0.68)), hold='Agar\'s answer and the breath after it')
scene('angel-said', 24, 'The light rises over the spring; its reflection breaks in the rings of the water.',
      U(SPR, BLUE, uAngelI=3.0, uRings=0.8), C([-4, 0.6, 7], [0, 2.0, 0], 40), C([-3.2, 0.55, 6.2], [0, 2.6, 0], 40), exposure=1.35,
      update="u.uAngel.value.set(0, 2.2 + 0.8 * ease.inOut3(x(t)), -0.6);",
      lyric=dict(lines=['The Lord’s angel said'], plane=lo(-0.55, 10)))
scene('return', 25, 'Looking back up the line of footprints, towards the far hills of home, as the last light goes.',
      U(SPR, BLUE, uAngel=[0, 3.0, -0.6], uAngelI=3.0, uStepsFill=0.3), C([4.6, 1.5, 6.6], [14.5, 0.9, 23], 44), C([5.4, 1.5, 8.0], [14.5, 1.1, 23], 44), exposure=1.35,
      lyric=dict(lines=['“Return to your mistress', 'submit yourself'], plane=lo(0.5, 16, 0.72)), hold='the hard command, sung soberly over two lines')

# ================= Verse 4: the promise under the stars =================
NSPR = U(DESERT, SPRING, NIGHT, uAngel=[0, 3.0, -0.6], uAngelI=2.4)
scene('night-falls', 27, 'Night has come over the spring; the light stands over the water and the stars come out.',
      U(NSPR, uStarGain=0.6), C([10, 1.6, 14], [0, 3, 0], 44), C([9, 1.4, 12], [0, 4, 0], 44), exposure=1.0,
      update="u.uStarGain.value = 0.4 + 0.8 * ease.inOut3(x(t));",
      lyric=dict(lines=['The Lord’s angel said'], plane=lo(-0.45, 14)))
scene('multiply', 28, 'The camera tips up from the palms into the Milky Way: more stars than can be counted.',
      U(NSPR, uStarGain=1.4, uMilky=1.3), C([4, 0.8, 8], [0, 4, -4], 54), C([4, 0.8, 8], [-1, 14, -6], 54), exposure=1.0,
      lyric=dict(lines=['“I will greatly multiply', 'they will be too many'], anchorAt=0.5, plane=lo(0.0, 30, 0.72)), samples=16, hold='the promise over two lines')
scene('with-child', 30, 'The light over the spring and its reflection, one above the other, between the dark palms.',
      U(NSPR, uSkinOn=0), C([7.5, 0.6, 7.5], [0, 1.2, -0.6], 34), C([6.8, 0.55, 6.8], [0, 1.3, -0.6], 34), exposure=1.1,
      lyric=dict(lines=['The Lord’s angel said'], plane=lo(-0.62, 6, 0.6)))
scene('ismael', 31, 'From the spring\'s source, ring after ring spreads out across the starlit water.',
      U(NSPR, uRings=3.2), C([3.5, 1.6, 4.0], [0.4, -0.3, -0.5], 40), C([3.0, 1.9, 3.4], [0.5, -0.3, -0.5], 40), exposure=1.1,
      lyric=dict(lines=['you will bear a son'], plane=lo(0.55, 8, 0.7)))
scene('heard', 32, 'Low over the water: the rings reach every shore, and the light\'s reflection trembles on them.',
      U(NSPR, uRings=1.6), C([-5, 0.35, 5], [1, 1.0, -1], 42), C([-4.2, 0.3, 4.2], [1, 1.2, -1], 42), exposure=1.1,
      lyric=dict(lines=['for the Lord has heard'], plane=lo(0.5, 10)))
scene('wild', 33, 'A moonlit wind over open dunes; sand streams off their crests.',
      U(DESERT, NIGHT, uFlat=[0, 0, 0], uFlatR=8, uDust=1.0, uDuneAmp=7), C([0, 3.0, 20], [0, 1.5, -60], 40), C([4, 3.0, 12], [2, 1.8, -60], 40), exposure=1.1,
      update="u.uWindT.value = t * 40.0;",
      lyric=dict(lines=['“He will be a wild man'], plane=lo(0.5, 30)), samples=16)
scene('against-all', 34, 'Moonlit dunes in hard ranks, one against the next, to the horizon.',
      U(DESERT, NIGHT, uFlat=[0, 0, 0], uFlatR=4, uMesa=0, uDuneAmp=8, uWind=[0.3, 1.0]), C([0, 16, 12], [20, 4, -140], 38), C([6, 16, 6], [26, 4, -140], 38), exposure=1.1,
      lyric=dict(lines=['his hands against all'], plane=lo(-0.45, 40)))
scene('brothers', 35, 'The Milky Way over the dunes, star beyond star, the dunes going on to the horizon.',
      U(DESERT, NIGHT, uStarGain=1.5, uMilky=1.4, uFlat=[0, 0, 0], uFlatR=4), C([0, 30, 30], [0, 60, -300], 56), C([0, 30, 22], [0, 70, -300], 56), exposure=1.2,
            lyric=dict(lines=['He will live before all'], plane=lo(0.5, 30)), hold='the line and the turn of the music to the bridge')

# ================= Bridge: El Roi, the God who sees =================
DSUN = sun(80, 22)
DAWNC = U(DESERT, SPRING, dict(uSunDir=DSUN, uSunCol=[W, W, W]), uCloud=1, uCloudCov=0.8, uMie=0.3, uDust=0.7)
cA = [-9, 1.2, 9]
scene('named', 36, 'First grey light under a low ceiling of cloud over the spring; the deck glows faintly in the east.',
      U(DAWNC, **eye(cA, DSUN), uEye=0.0, uRays=0.0), C(cA, [cA[0] + DSUN[0] * 60, cA[1] + DSUN[1] * 60 - 14, cA[2] + DSUN[2] * 60], 54), C([-8, 1.1, 8], [-8 + DSUN[0] * 60, 1.1 + DSUN[1] * 60 - 11, 8 + DSUN[2] * 60], 54), exposure=1.2,
      update="u.uEye.value = 0.12 * ease.inOut3(x(t));",
      lyric=dict(lines=['She named the Lord'], plane=lo(-0.5, 20)))
scene('sees-me', 37, 'El Roi: the cloud opens like an eye in the east, the sun in it; shafts of light fall across the desert onto the spring.',
      U(DAWNC, **eye(cA, DSUN), uEye=0.12, uRays=1.0, uPalms=2), C([2, 1.0, 12], [2 + DSUN[0] * 60, 1.0 + DSUN[1] * 60 - 10, 12 + DSUN[2] * 60], 62), C([2.3, 0.95, 11.8], [2.3 + DSUN[0] * 60, 0.95 + DSUN[1] * 60 - 4, 11.8 + DSUN[2] * 60], 40), exposure=1.1,
      update="u.uEye.value = 0.12 + 0.88 * ease.inOut3((t - P.from - 0.2) / 2.6); u.uRays.value = 1.6 * ease.inOut3((t - P.from - 0.6) / 2.0);",
      lyric=dict(lines=['“You are God who sees me'], anchorAt=0.95, plane=lo(-0.6, 18, 0.95, 3.0)), samples=16)
scene('openly-seen', 38, 'The eye of light lies in the still water of the spring, reflected.',
      U(DAWNC, **eye([4, 0.7, -4], DSUN), uEye=1.0, uRays=1.6, uRings=0.15), C([-4.5, 0.9, 1.0], [1.0, -1.3, 2.0], 44), C([-4.1, 1.0, 0.8], [1.4, -1.2, 1.8], 44), exposure=1.1,
      lyric=dict(lines=['She said, “I have openly'], plane=lo(0.52, 9, 0.7)))
scene('appeared', 39, 'Wide over the desert: the eye wide open, its light running out over the sand to the palms.',
      U(DAWNC, **eye([-40, 12, 30], DSUN), uEye=1.0, uRays=1.6, uPalms=2), C([-40, 12, 30], [-40 + DSUN[0] * 60, 12 + DSUN[1] * 60 - 16, 30 + DSUN[2] * 60], 54), C([-34, 13, 26], [-34 + DSUN[0] * 60, 13 + DSUN[1] * 60 - 14, 26 + DSUN[2] * 60], 54), exposure=1.05,
      lyric=dict(lines=['him who appeared'], plane=lo(-0.5, 30), ink=DARK, shade=0.2), samples=16)
WELL = dict(uWellOn=1, uWellP=[-7.5, 0, 3])
scene('the-well', 40, 'The well-head of stones beside the spring, in the long morning light.',
      U(DAWNC, WELL, **eye([-11, 1, 6], DSUN), uEye=1.0, uRays=1.2), C([-4.4, 1.35, 6.6], [-7.6, 0.6, 2.9], 38), C([-4.8, 1.2, 5.9], [-7.6, 0.6, 2.9], 38), exposure=1.1,
      lyric=dict(lines=['She called it'], plane=lo(0.55, 8, 0.7)))
scene('whom-seen', 41, 'Low across the stones of the well-head, to the spring, the palms and the eye of light over them.',
      U(DAWNC, WELL, **eye([-10.5, 0.8, 4.2], DSUN), uEye=1.0, uRays=1.4, uPalms=1), C([-10.5, 0.8, 4.2], [-10.5 + DSUN[0] * 60, 0.8 + DSUN[1] * 60 - 9, 4.2 + DSUN[2] * 60], 56), C([-10.2, 0.75, 3.8], [-10.2 + DSUN[0] * 60, 0.75 + DSUN[1] * 60 - 7, 3.8 + DSUN[2] * 60], 56), exposure=1.1,
      lyric=dict(lines=['whom I have openly seen'], plane=lo(0.55, 4, 0.7)))
scene('cades-barad', 42, 'High above: the spring, its palms and the well in the morning desert, between two lines of cliffs.',
      U(DAWNC, WELL, uCloud=0, uEye=0, uRays=0), C([34, 26, 46], [0, 0, 0], 40), C([26, 30, 40], [0, 0, 0], 40), exposure=0.8,
      lyric=dict(lines=['It lies between'], plane=lo(-0.45, 60), ink=DARK, shade=0.25), hold='the line and the breath before the last verse')

# ================= Outro: the return, and the child =================
scene('bore-a-son', 43, 'Evening: a fresh line of footprints comes back over the hill to the camp, where the lamps are being lit.',
      U(HILLS, DUSK, CAMP, uSteps=[30, 24, 0, 0], uStepsN=34, uStepsDir=-2.25), C([34, 2.0, 30], [0, 0.6, -2], 38), C([30, 1.8, 26], [0, 0.8, -2], 38), exposure=1.3,
      lamps=f'[{SARA_LAMP}, {ABRAM_LAMP}, {AGAR_LAMP}]',
      lyric=dict(lines=['Agar bore Abram a son'], plane=lo(0.5, 24)))
scene('named-ismael', 44, 'The small tent at dusk, its lamp lit; the indigo veil hangs on its line again.',
      U(HILLS, DUSK, CAMP, VEIL_LINE, uVeilBlow=0.3), C([20, 1.0, -1.5], [11.5, 1.1, -8.5], 34), C([18.6, 0.9, -2.6], [11.5, 1.1, -8.5], 34), exposure=1.35,
      lamps=f'[{AGAR_LAMP}, {SARA_LAMP}]',
      lyric=dict(lines=['and Abram named the boy'], plane=lo(0.5, 14)))
scene('eighty-six', 45, 'Night over the camp, three lamps lit, the acacia black against the stars.',
      U(HILLS, NIGHT, CAMP), C([20, 1.0, 22], [2, 2.6, -2], 44), C([18, 1.1, 19], [2, 3.0, -2], 44), exposure=1.5,
      lamps=f'[{SARA_LAMP}, {ABRAM_LAMP}, {AGAR_LAMP}]',
      lyric=dict(lines=['Abram was eighty-six', 'when Agar bore Ismael'], plane=lo(0.52, 20, 0.72),
                 extra="(ctx, t, H) => { gauge(ctx, 'EIGHTY-SIX YEARS', 1920, H * 0.92, { size: 58, alpha: 0.85 * ease.inOut3((t - P.from - 1.0) / 1.5) }); }"),
      hold='the last verse sung over the sleeping camp')
scene('end', '252.6s', 'The camp at night under the whole sky; the small tent\'s lamp breathes slowly like a cradle rocking; the camera rises.',
      U(HILLS, NIGHT, CAMP, uStarGain=1.2, uMilky=1.2), C([14, 0.9, 16], [6, 3, -10], 50), C([14, 3.4, 18], [6, 7, -10], 50), exposure=1.5,
      lamps=f'[{AGAR_LAMP}, {SARA_LAMP.replace("2.2", "1.2")}, {ABRAM_LAMP.replace("1.8", "1.0")}]',
      update="u.uLI.value[0] = 1.6 + 0.5 * Math.sin((t - P.from) * 2.0 * Math.PI * 79 / 60 / 2); u.uExp.value = 1.0 - 0.95 * ease.inOut3((t - P.to + 2.5) / 2.5);",
      lyric=dict(lines=[], plane="standing(inView(from, 0, 0.2, 40), from, 0.9, 3)", gauge=False, end=True), hold='the cradle pulse of the outro and the end title')

# ---------------- write ----------------
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(R, 'scenes'), exist_ok=True)
js = lambda v: json.dumps(v)

# scenes whose final plates were rendered with the first world library and are kept as they are
KEEP = {'angel', 'come-from', 'angel-said', 'night-falls', 'multiply', 'with-child', 'ismael', 'heard', 'end'}
def scene_js(i, s):
    name = f"s{i:02d}-{s['slug']}"
    wl = 'world3.js'
    uni = ', '.join(f"{k}: {js(v)}" for k, v in s['uniforms'].items())
    return name, f"""// {i:02d} · {s['about']}
import {{ WORLD_GLSL, WORLD_UNIFORMS, cam, setLamps, skyLight, keys, ease }} from '/song/lib/{wl}';
import {{ grade }} from '/song/lib/look.js';

const A = {js(s['A'])};
const B = {js(s['B'])};
const LAMPS = {s['lamps']};

export default (P) => {{
  const x = (t) => Math.min(1, Math.max(0, (t - P.from) / (P.to - P.from)));
  return {{
    name: '{name}', from: P.from, to: P.to,
    frag: WORLD_GLSL + `vec3 shade(vec2 fc) {{ return world(fc); }}`,
    uniforms: {{ ...WORLD_UNIFORMS, uL: new Array(24).fill(0), uLI: new Array(8).fill(0), {uni} }},
    camera: (t) => cam(P, t, A, B),
    update(t, u) {{
      setLamps(u, LAMPS);
      {s['update']}
      skyLight(u);
    }},
    post: (t) => grade(t, {{ exposure: {s['exposure']} }}),
  }};
}};
"""

def lyric_js(name, s):
    L = s['lyric']
    opts = [f"lines: {js(L['lines'])}", f"plane: (from) => {L['plane']}"]
    if 'ink' in L: opts.append(f"ink: '{L['ink']}', gaugeInk: '{L['ink']}'")
    if 'shade' in L: opts.append(f"shade: {L['shade']}")
    if 'anchorAt' in L: opts.append(f"anchorAt: {L['anchorAt']}")
    if 'gauge' in L: opts.append(f"gauge: {js(L['gauge'])}")
    if 'extra' in L: opts.append(f"extra: {L['extra']}")
    if L.get('title'):
        opts.append("gauge: false, extra: (ctx, t, H) => { titleCard(ctx, H, ease.inOut3((t - P.from - 0.6) / 1.4), ease.inOut3((t - P.from - 1.8) / 2.0), 1 - ease.inOut3((t - P.to + 1.2) / 1.0)); }")
    if L.get('end'):
        opts.append("extra: (ctx, t, H) => { titleCard(ctx, H, ease.inOut3((t - P.to + 14) / 1.4), ease.inOut3((t - P.to + 13.4) / 2.0), 1 - ease.inOut3((t - P.to + 2.4) / 1.6)); }")
    return f"""// The words of {name}, drawn as their own layer on a plane placed in its world.
import scene from '/song/scenes/{name}.js';
import {{ layer, standing, lying, inView, gauge, titleCard, ease }} from '/song/lib/type.js';

export default (P) => layer(P, scene(P), {{
  {(',' + chr(10) + '  ').join(opts)},
}});
"""

plan = {'title': 'Agar in the Wilderness (Genesis 16)', 'fps': 60, 'tier': 'ultra', 'samples': 8, 'scenes': []}
for f in os.listdir(os.path.join(R, 'scenes')):
    if f.startswith('s') and f[1:3].isdigit(): os.remove(os.path.join(R, 'scenes', f))
DAYINK = {'camp', 'no-children', 'maid', 'kept-me', 'through-her', 'conceived', 'pregnant', 'looked-down', 'your-fault', 'rope', 'judge', 'between', 'in-your-hands', 'afflicted', 'flight', 'wilderness', 'cades-barad'}
for s in S:
    if s['slug'] in DAYINK and 'ink' not in s['lyric']:
        s['lyric']['ink'] = DARK; s['lyric']['shade'] = 0.25
for i, s in enumerate(S):
    name, code = scene_js(i, s)
    open(os.path.join(R, 'scenes', name + '.js'), 'w').write(code)
    open(os.path.join(R, 'scenes', name + '.lyric.js'), 'w').write(lyric_js(name, s))
    e = {'at': s['at'], 'slug': s['slug'], 'screen': s['about'], 'purpose': s['about'], 'leaves': 'cut on the beat', 'carries': 'the land and the sky of one world',
         'words': 'on a plane placed in the scene, lit to match', 'overlay': 'lyrics as their own sharp type layer, as on Genesis 8 and 15'}
    if s['hold']: e['hold'] = s['hold']
    plan['scenes'].append(e)
os.makedirs(os.path.join(R, 'docs'), exist_ok=True)
json.dump(plan, open(os.path.join(R, 'docs', 'plan.json'), 'w'), indent=1)
os.chdir(R)
r = subprocess.run(['python3', 'tools/plan.py'], capture_output=True, text=True)
print(r.stdout, r.stderr)
film = json.load(open('film.json'))
film['samples'] = 8
film['samplePreset'] = 'dove'
film['lyric'] = {'haloSpread': 7, 'shade': 0.28}
film['gates'] = {'maxCameraOnlySeconds': 1e9, 'restFraction': 0}
film['optOuts'] = {'live': 'Genesis 8 way, live gate off for this film', 'rest-to-rest': 'Genesis 8 way, rest-to-rest warning off for this film'}
for sc, s in zip(film['scenes'], S):
    if s['samples']: sc['samples'] = s['samples']
json.dump(film, open('film.json', 'w'), indent=1)
print(len(S), 'scenes written')
