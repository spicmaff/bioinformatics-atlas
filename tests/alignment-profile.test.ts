import {test} from 'node:test';
import assert from 'node:assert/strict';
import {needlemanWunsch} from '../src/algorithms/needleman-wunsch';
import {alignmentProfile} from '../src/algorithms/alignment-profile';
import {alignmentExamples} from '../src/data/alignment-examples';

test('scientific preview reproduces independent column-by-column controls',()=>{
 const expected=[[2,4,6,8,10,12,14,16],[2,4,6,8,7,9,11,13],[2,4,6,8,6,8,10,12]];
 for(const [i,input] of alignmentExamples.entries()){
  const result=needlemanWunsch(input.a,input.b),p=alignmentProfile(result);
  assert.deepEqual(p.map(c=>c.cumulative),expected[i]);
  assert.equal(p.map(c=>c.a).join('').replaceAll('−',''),input.a);
  assert.equal(p.map(c=>c.b).join('').replaceAll('−',''),input.b);
  assert.equal(p.at(-1)?.cumulative,result.score);
 }
 const gap=alignmentProfile(needlemanWunsch('ACGTACGT','ACGTCGT'))[4]!;
 assert.deepEqual([gap.kind,gap.a,gap.b,gap.positionA,gap.positionB,gap.contribution],['gap','A','−',5,null,-2]);
});
test('profiles retain tied answers, negative scores and empty input',()=>{
 const tied=needlemanWunsch('A','AA');
 assert.equal(alignmentProfile(tied,0).at(-1)?.cumulative,0);
 assert.equal(alignmentProfile(tied,1).at(-1)?.cumulative,0);
 assert.notDeepEqual(alignmentProfile(tied,0).map(c=>c.cumulative),alignmentProfile(tied,1).map(c=>c.cumulative));
 assert.deepEqual(alignmentProfile(needlemanWunsch('','AC')).map(c=>c.cumulative),[-2,-4]);
 assert.deepEqual(alignmentProfile(needlemanWunsch('','')),[]);
 assert.throws(()=>alignmentProfile(tied,2));
});
