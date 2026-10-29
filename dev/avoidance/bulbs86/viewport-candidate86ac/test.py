import unittest
from candidate import candidates,evaluate
class Test(unittest.TestCase):
 def test_clear(self):self.assertTrue(evaluate([dict(x0=1,y0=1,x1=3,y1=3)],[0,0],[8,8,1],10,10)['passed'])
 def test_contact(self):self.assertFalse(evaluate([dict(x0=1,y0=1,x1=3,y1=3)],[0,0],[4,2,1],10,10)['passed'])
 def test_stage(self):self.assertFalse(evaluate([dict(x0=1,y0=1,x1=3,y1=3)],[-2,0],[8,8,1],10,10)['passed'])
 def test_candidates(self):
  b=[dict(x0=4,y0=4,x1=6,y1=6)];cs=candidates(b,[5,5,1],20,20);self.assertTrue(cs);self.assertTrue(all(x['evaluation']['passed']for x in cs));self.assertLessEqual(len(cs),8)
 def test_too_large(self):self.assertEqual(candidates([dict(x0=-1,y0=0,x1=30,y1=10)],[5,5,1],20,20),[])
if __name__=='__main__':unittest.main()
