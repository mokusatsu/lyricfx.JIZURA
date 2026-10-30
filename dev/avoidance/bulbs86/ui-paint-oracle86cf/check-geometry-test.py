from pathlib import Path
import ast
p=Path(__file__).with_name('check.py');tree=ast.parse(p.read_text());keep=[]
for n in tree.body:
 if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef)):keep.append(n)
 elif isinstance(n,ast.Assign)and any(isinstance(t,ast.Name)and t.id=='F'for t in n.targets):keep.append(n)
ns={};exec(compile(ast.Module(body=keep,type_ignores=[]),str(p),'exec'),ns)
F=ns['F'];atom=ns['atom'];clear=ns['clear'];Q=ns['Q']
def shape(kind,args,path=[],matrix=[.375,0,0,.375,10,20],metrics=None):return {'kind':kind,'args':args,'matrix':matrix,'path':path,'state':{'alpha':1,'filter':'none','textAlign':'center','textBaseline':'middle','lineWidth':2,'miterLimit':10},'metrics':metrics}
poly,b=atom(shape('fillRect',[0,0,8,4]));assert b=={'x0':8,'y0':18,'x1':15,'y1':Q(47,2)}
poly2,b2=atom(shape('strokeRect',[0,0,8,4]));assert b2['x0']==Q(17,4)and b2['x1']==Q(75,4)
_,b3=atom(shape('fillText',['A',0,0],metrics={'actualBoundingBoxLeft':2,'actualBoundingBoxRight':3,'actualBoundingBoxAscent':4,'actualBoundingBoxDescent':1}));assert b3['x0']==Q(55,8)and b3['y0']==Q(129,8)
clear(poly,{'cx':0,'cy':0,'r':1,'margin':2.7})
for circle in [{'cx':8,'cy':18,'r':1,'margin':2.7},{'cx':10,'cy':20,'r':1,'margin':2.7}]:
 try:clear(poly,circle)
 except AssertionError:pass
 else:raise AssertionError('touch/inside circle must fail')
print('independent Fraction rectangle/stroke/text affine padding and circle-boundary/inside checks passed')
