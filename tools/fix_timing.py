"""Corrections to the aligned words, applied after tools/timing.py. Each is backed by the vocal stem and
by the second (large) alignment model: "I" at 136.31 fell in the silence before the voice re-enters at
137.0, and "appeared" starts 0.5 s before the base model put it."""
import json
p = 'data/lyrics.json'; L = json.load(open(p))
def fix(word, old, new, prev_end=None):
    i = next(i for i, w in enumerate(L['words']) if word in w['w'] and abs(w['start'] - old) < 0.05)
    L['words'][i]['start'] = new; L['words'][i]['end'] = max(L['words'][i]['end'], new + 0.06)
    if L['words'][i - 1]['end'] > new: L['words'][i - 1]['end'] = new
    if i + 1 < len(L['words']) and L['words'][i]['end'] > L['words'][i + 1]['start']: L['words'][i]['end'] = L['words'][i + 1]['start']
fix('I', 136.31, 137.05); fix('appeared', 218.296, 217.776)
L['timingChecks'] = 'two local CTC models agree within 0.15 s on 314 of 322 words; line starts after a pause land within 0.25 s of the voice onset; machine estimates'
json.dump(L, open(p, 'w'), indent=0)
