'use strict';
// Source-only overlay. Never writes canonical source or registers a safe adapter.
const START='/* ================================================================== 22 dominoes — ドミノ */';
const END='/* ================================================================== 23 burst — 爆発プレート */';
const edits=[
 ['      const row = rowsD[r], cnt = row.length;',
  '      const row = rowsD[r], cnt = row.length;\n      const lease73 = J.domino73 ? J.domino73.enter(env, {r, rowsD, w, h, g, thick, lean, gi, dT, T0, rise, oStart}) : null;\n      const X73 = x => !lease73 || lease73.dx === 0 ? x : x + lease73.dx;\n      try {'],
 ['      const yF = H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2;',
  '      const sourceY73 = H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2;\n      const yF = !lease73 || lease73.dy === 0 ? sourceY73 : sourceY73 + lease73.dy;'],
 ['[[W / 2 - (cnt * (w + g)) / 2 - w * 0.4, yF], [W / 2 + (cnt * (w + g)) / 2 + w * 0.4, yF]]',
  '[[X73(W / 2 - (cnt * (w + g)) / 2 - w * 0.4), yF], [X73(W / 2 + (cnt * (w + g)) / 2 + w * 0.4), yF]]'],
 ['        const xc = W / 2 + (j - (cnt - 1) / 2) * (w + g);',
  '        const xc = X73(W / 2 + (j - (cnt - 1) / 2) * (w + g));'],
 ['      }\n    }\n    return bb;',
  '      }\n      } finally { if (lease73) lease73.restore(); }\n    }\n    return bb;']
];
function patch(source,inverse=false){
 const a=source.indexOf(START),b=source.indexOf(END,a);
 if(a<0||b<0||source.indexOf(START,a+1)!==-1)throw Error('DOMINO73_SOURCE_BOUNDARY');
 let body=source.slice(a,b);
 for(const pair of inverse?[...edits].reverse():edits){const [from,to]=inverse?[pair[1],pair[0]]:pair;if(body.split(from).length!==2)throw Error('DOMINO73_EXACT_SOURCE_SEAM');body=body.replace(from,to);}
 return source.slice(0,a)+body+source.slice(b);
}
module.exports={patch,START,END};
