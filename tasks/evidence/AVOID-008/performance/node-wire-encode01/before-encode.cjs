function cacheEncode(value){
 const active=new WeakSet(),objectIDs=new WeakMap(),nodes=[];let encodedChars=0;
 const visit=v=>{
  if(v===undefined)return ['u'];if(v===null)return ['n'];
  if(typeof v==='number'){if(!Number.isFinite(v))throw Error('nonfinite cache data');return ['d',Object.is(v,-0)?'-0':v];}
  if(typeof v==='string'&&v.length*2>CACHE_BYTES)throw Error('oversized cache string');if(typeof v==='string'||typeof v==='boolean')return [typeof v==='string'?'s':'b',v];
  if(typeof v!=='object'||active.has(v)||Object.getOwnPropertySymbols(v).length)throw Error('opaque cache data');if(objectIDs.has(v))return ['r',objectIDs.get(v)];
  const objectID=nodes.length;objectIDs.set(v,objectID);nodes.push(null);
  const array=Array.isArray(v),proto=Object.getPrototypeOf(v),keys=Object.getOwnPropertyNames(v);
  if(array?(proto!==Array.prototype||keys.length!==v.length+1||keys.some(k=>k!=='length'&&(!/^(0|[1-9]\d*)$/.test(k)||+k>=v.length))):(proto!==Object.prototype&&proto!==null))throw Error('opaque cache prototype');
  active.add(v);const data=[];for(const k of keys){if(array&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!Object.hasOwn(d,'value')||!d.enumerable)throw Error('cache accessor');data.push(array?visit(d.value):[k,visit(d.value)]);}active.delete(v);
  const node=[array?'a':proto===null?'z':'o',data],key=JSON.stringify(node);encodedChars+=key.length+1;if(encodedChars*2>CACHE_BYTES)throw Error('oversized cache encoding');nodes[objectID]=node;return ['r',objectID];
 };
 const root=visit(value);return JSON.stringify({codec:'C008-exact-graph-v1',root,nodes});
}
