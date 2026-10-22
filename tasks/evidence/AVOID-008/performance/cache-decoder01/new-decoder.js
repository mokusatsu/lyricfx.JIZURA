function cacheDecode(text){
 const packed=JSON.parse(text);if(packed.codec!=='C008-exact-graph-v1')throw Error('C cache codec');const memo=[];
 const visit=v=>{switch(v[0]){case'u':return undefined;case'n':return null;case'd':return v[1]==='-0'?-0:v[1];case's':case'b':return v[1];case'r':{
  if(memo[v[1]])return memo[v[1]];const [kind,data]=packed.nodes[v[1]],out=kind==='a'?data:Object.fromEntries(data);if(kind==='z')Object.setPrototypeOf(out,null);memo[v[1]]=out;
  // Parsed arrays are fresh dense containers; fromEntries creates own writable
  // data slots (including __proto__) before assignment can see any prototype.
  if(kind==='a'){for(let i=0;i<data.length;i++)out[i]=visit(data[i]);}else for(const [key,child]of data)out[key]=visit(child);return out;
 }default:throw Error('C cache tag');}};
 return visit(packed.root);
}
