import { test } from 'node:test';
import assert from 'node:assert/strict';
import { needlemanWunsch, normalizeSequence, defaultScoring } from '../src/algorithms/needleman-wunsch';
test('required controls',()=>{
  assert.equal(needlemanWunsch('ACG','ACG').score,6);
  assert.equal(needlemanWunsch('','AC').score,-4);
  const r=needlemanWunsch('A','AA');assert.equal(r.score,0);assert.equal(r.optimalCount,'2');
  assert.deepEqual(new Set(r.alignments.map(a=>`${a.a}/${a.b}`)),new Set(['−A/AA','A−/AA']));
});
test('empty, normalized, invalid and oversized inputs',()=>{
 const r=needlemanWunsch('','');assert.equal(r.score,0);assert.equal(r.optimalCount,'1');assert.equal(r.alignments[0]?.a,'');
 assert.equal(normalizeSequence(' acg '),'ACG');
 for(const s of ['AN','A C','A−','U','A'.repeat(25)])assert.throws(()=>needlemanWunsch(s,'A'));
 for(const s of [{match:2.5,mismatch:-1,gap:-2},{match:2,mismatch:-1,gap:1},{match:NaN,mismatch:-1,gap:-2}])assert.throws(()=>needlemanWunsch('A','C',s));
});
// Independent exhaustive enumeration of all alignments (no DP recurrence).
function enumerate(a:string,b:string):{score:number;count:number}{
 const values:number[]=[];
 function walk(i:number,j:number,score:number){if(i===a.length&&j===b.length){values.push(score);return;}
  if(i<a.length&&j<b.length)walk(i+1,j+1,score+(a[i]===b[j]?2:-1));
  if(i<a.length)walk(i+1,j,score-2);
  if(j<b.length)walk(i,j+1,score-2);
 }
 walk(0,0,0);const best=Math.max(...values);return {score:best,count:values.filter(v=>v===best).length};
}
const words=['','A','C','AA','AC','CA','CC','AAA','AAC','ACA','ACC','CAA','CAC','CCA','CCC'];
test('225 independent exhaustive short-string controls; traceback and symmetry',()=>{
 for(const a of words)for(const b of words){const expected=enumerate(a,b),r=needlemanWunsch(a,b);
  assert.equal(r.score,expected.score,`${a}/${b}`);assert.equal(r.optimalCount,String(expected.count));assert.equal(r.score,needlemanWunsch(b,a).score);
  for(const alignment of r.alignments){assert.equal(alignment.a.replaceAll('−',''),a);assert.equal(alignment.b.replaceAll('−',''),b);assert.equal(alignment.a.length,alignment.b.length);
   let score=0;for(let i=0;i<alignment.a.length;i++){const x=alignment.a[i],y=alignment.b[i];assert.ok(x!=='−'||y!=='−');score+=(x==='−'||y==='−')?-2:x===y?2:-1;}assert.equal(score,r.score);
   assert.deepEqual(alignment.path[0],[a.length,b.length]);assert.deepEqual(alignment.path.at(-1),[0,0]);
  }
 }
});
test('tie count remains exact and enumeration is bounded',()=>{
 const r=needlemanWunsch('A'.repeat(24),'A'.repeat(24),{match:0,mismatch:0,gap:0});
 assert.equal(r.score,0);assert.equal(r.alignments.length,20);assert.ok(r.truncated);assert.ok(BigInt(r.optimalCount)>BigInt(Number.MAX_SAFE_INTEGER));
 const r2=needlemanWunsch('A','C',{...defaultScoring,mismatch:-5});assert.equal(r2.score,-4);assert.equal(r2.optimalCount,'2');
});
