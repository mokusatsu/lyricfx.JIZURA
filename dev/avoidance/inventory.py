"""Conservative source audit: no unreviewed draw unit receives the auxiliary exemption."""
import csv,json,hashlib,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def collect():
 old=list(csv.DictReader((ROOT/'tasks/evidence/AVOID-001/layout-inventory.csv').open()))
 historical=json.loads((ROOT/'tasks/evidence/AVOID-001/runtime-probe.json').read_text())['inventory']
 assert len(old)==184 and len({r['id'] for r in old})==184
 assert {r['id'] for r in old}=={r['id'] for r in historical}
 aux={r['id']:r['role_note'] for r in old if r['aux_mask_task']}
 aux.update(rain='background glyph grid only; falling leading glyph/trail primary',tunnel='repeated perimeter glyphs only; central main line primary',wordCloud='buildCloud decorative copies only; central main line primary',zoomRepeat='env.draw background copies only; mainDraw main line/outline primary')
 rows=[]
 for r in old:
  text=(ROOT/r['source']).read_text();lines=text.splitlines();line=int(r['line'])
  assert r['id'] in '\n'.join(lines[max(0,line-2):line+2]),r['id']
  render=next(x['renderSource'] for x in historical if x['id']==r['id'])
  assert render in text, f"{r['id']}: historical render changed; recollect current runtime/source audit"
  # Source-level responsibility classification, never a claim of adapter/render coverage.
  row={k:r[k] for k in ['id','name','source','line','task','direct_mainDraw','env_draw','direct_canvas_text']}
  row.update(sourceSHA256=hashlib.sha256(text.encode()).hexdigest(),renderSHA256=hashlib.sha256(render.encode()).hexdigest(),
   role='primary + reviewed tiledAux' if r['id'] in aux else 'primary (all lyric-bearing units, conservative)',
   auxiliary=aux.get(r['id'],'none exempted; additional auxiliary discovery remains assigned to adapter owner'),
   attachedPlates='follow owning primary or named tiledAux; never independent by default',
   independentDecor='non-lyric visual decoration only; no exemption for semantic annotation',
   camera='stage transform composed once; adapter owner verifies bounds',
   policy='center-only' if r['task']=='AVOID-011' else 'full-stage primary trajectory',
   status='registration/source hash checked; conservative primary policy assigned; individual unit audit and visual verification pending: '+r['task'])
  rows.append(row)
 return rows
if __name__=='__main__':
 import sys
 rows=collect();Path(sys.argv[1]).write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'ids':len(rows),'owners':{t:sum(r['task']==t for r in rows) for t in sorted({r['task'] for r in rows})},'auxiliaryUnits':sum('reviewed' in r['role'] for r in rows)}))
