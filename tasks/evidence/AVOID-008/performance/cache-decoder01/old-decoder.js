function cacheDecode(text){
 const packed=JSON.parse(text);if(packed.codec!=='C008-exact-graph-v1')throw Error('C cache codec');const memo=[];
 const visit=v=>{switch(v[0]){case'u':return undefined;case'n':return null;case'd':return v[1]==='-0'?-0:v[1];case's':case'b':return v[1];case'r':{if(memo[v[1]])return memo[v[1]];const [kind,data]=packed.nodes[v[1]],out=kind==='a'?[]:kind==='z'?Object.create(null):{};memo[v[1]]=out;for(const [i,child]of data.entries()){const k=kind==='a'?String(i):child[0],value=visit(kind==='a'?child:child[1]);Object.defineProperty(out,k,{value,enumerable:true,writable:true,configurable:true});}return out;}default:throw Error('C cache tag');}};
 return visit(packed.root);
}
