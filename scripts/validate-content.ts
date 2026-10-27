import assert from 'node:assert/strict';
import { readModules, readChapters, readFoundations, readTheory, readDecisions, readWorks, readRoutes, modulePath, chapterPath } from '../src/lib/content';
import { experimentRegistry } from '../src/experiments/registry';
import type { Source } from '../src/lib/schema';

export function validateContent() {
  const modules=readModules(), chapters=readChapters(), foundations=readFoundations(), theory=readTheory(), decisions=readDecisions(), works=readWorks();
  const all=[...modules,...chapters,...foundations,...theory];
  const unique=(values:string[],label:string)=>assert.equal(new Set(values).size,values.length,`Duplicate ${label}`);
  unique([...all.map(e=>e.data.id),...decisions.map(e=>e.id)],'ID');
  unique(works.map(w=>w.id),'work ID');
  const historical=Array.from({length:35},(_,i)=>`M${String(i+1).padStart(2,'0')}`).concat(Array.from({length:8},(_,i)=>`K${String(i+1).padStart(2,'0')}`));
  for (const id of historical) assert.ok([...modules.map(m=>m.data.id),...decisions.map(d=>d.id)].includes(id),`Lost historical ID ${id}`);
  const approved=modules.filter(m=>historical.includes(m.data.id));
  assert.equal(approved.length,35,'v2 has 35 approved modules');
  assert.equal(approved.filter(m=>m.data.role==='core').length,17);
  assert.equal(approved.filter(m=>m.data.role==='advanced').length,13);
  assert.equal(approved.filter(m=>m.data.role==='adjacent').length,5);
  assert.equal(decisions.length,8);assert.equal(decisions.filter(d=>d.decision==='candidate').length,4);
  assert.equal(modules.find(m=>m.data.id==='K04')?.data.role,'core');
  for (const [id,target] of [['K02','M08'],['K05','M28'],['K07','M26'],['K08','F-BIO']]) assert.equal(decisions.find(d=>d.id===id)?.target,target);
  assert.deepEqual(approved.filter(m=>m.data.release_phase===1).sort((a,b)=>a.data.sort_order-b.data.sort_order).map(m=>m.data.id),['M13','M01','M06','M19','M20','M17']);
  for (const entry of modules.filter(m=>!historical.includes(m.data.id))) {
    assert.ok(['draft','review'].includes(entry.data.status),'Approve new modules by explicitly updating the program contract');
    assert.ok(Number(entry.data.id.slice(1)) >= (entry.data.id[0]==='M'?36:9),'Reserved ID');
  }
  const allIds=new Map(all.map(e=>[e.data.id,e]));
  function resolve(id:string,seen=new Set<string>()):string {
    assert.ok(!seen.has(id),`Historical redirect cycle: ${id}`);seen.add(id);
    if(allIds.has(id))return id;
    const d=decisions.find(d=>d.id===id);assert.ok(d,`Unknown ref ${id}`);
    assert.ok(d.target,`Candidate ${id} cannot be a strict prerequisite`);return resolve(d.target,seen);
  }
  function checkSources(sources:Source[],id:string){
    unique(sources.map(s=>s.id),`source key in ${id}`);
    sources.forEach(s=>assert.ok(works.some(w=>w.id===s.work),`Unknown work ${s.work} in ${id}`));
  }
  const paths=modules.map(m=>modulePath(m.data)).concat(chapters.map(c=>chapterPath(c.data,modules.map(m=>m.data))),foundations.map(f=>`foundations/${f.data.slug}/`),theory.map(f=>`theory/${f.data.slug}/`),['','catalog/','routes/','program/','sources/','glossary/','foundations/']);
  unique(paths.map(p=>p.toLowerCase()),'route');
  for(const entry of all){
    const e=entry.data;checkSources(e.sources,e.id);
    for(const ref of [...e.prerequisites,...e.related]){
      const target=allIds.get(resolve(ref.ref))!;
      if(ref.section)assert.ok(target.body.includes(`{#${ref.section}}`)||target.body.includes(`id="${ref.section}"`)||('planned_chapters' in target.data&&target.data.planned_chapters.some(p=>p.slug===ref.section)),`Unknown section ${ref.ref}#${ref.section}`);
    }
    for(const ref of e.prerequisites){
      const id=resolve(ref.ref);assert.notEqual(id,e.id,`Self prerequisite ${e.id}`);
      if(e.status==='published')assert.equal(allIds.get(id)!.data.status,'published',`Unavailable prerequisite ${id} of ${e.id}`);
    }
    if(e.status==='published' && !('branch' in e))assert.ok(entry.body.length>350,`Incomplete published body ${e.id}`);
  }
  for(const m of modules){
    m.data.methods.forEach(method=>method.sources.forEach(s=>assert.ok(m.data.sources.some(x=>x.id===s),`Unknown method source ${s} in ${m.data.id}`)));
    unique(m.data.planned_chapters.map(c=>c.slug),`planned chapter slug ${m.data.id}`);
    if(m.data.status==='published'){
      const published=chapters.filter(c=>c.data.module===m.data.id&&c.data.status==='published');
      assert.ok(published.length,`Published module ${m.data.id} needs a published chapter`);
      assert.ok(published.some(c=>c.data.experiment&&Object.hasOwn(experimentRegistry,c.data.experiment)),`Published module ${m.data.id} needs a working experiment`);
    }
  }
  for(const c of chapters){
    assert.ok(c.data.id.startsWith(c.data.module+'-C'),`Chapter ID/module mismatch ${c.data.id}`);
    const parent=modules.find(m=>m.data.id===c.data.module);assert.ok(parent,`Missing parent ${c.data.module}`);
    if(c.data.status==='published')assert.equal(parent.data.status,'published','Published chapter has unpublished parent');
    if(c.data.experiment)assert.ok(Object.hasOwn(experimentRegistry,c.data.experiment),`Unknown experiment ${c.data.experiment}`);
  }
  const visiting=new Set<string>(),done=new Set<string>();
  function visit(id:string){if(done.has(id))return;assert.ok(!visiting.has(id),`Prerequisite cycle: ${[...visiting,id].join(' -> ')}`);visiting.add(id);allIds.get(id)?.data.prerequisites.forEach(r=>visit(resolve(r.ref)));visiting.delete(id);done.add(id);}
  allIds.forEach((_,id)=>visit(id));
  for(const d of decisions.filter(d=>d.target)){resolve(d.id);assert.ok(d.section);}
  for(const route of readRoutes()){unique(route.steps,`route step ${route.id}`);for(const id of route.steps)assert.ok(allIds.has(id),`Unknown route step ${id}`);}
  console.log(`Content OK: ${modules.length} module records (35 approved), ${chapters.length} chapters, 4 foundations, ${decisions.length} decisions, 43 historical IDs.`);
}
validateContent();
