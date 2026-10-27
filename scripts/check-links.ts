import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
import { readChapters, readModules, chapterPath, modulePath } from '../src/lib/content';
const root=path.resolve('dist'), origin='https://spicmaff.github.io', base='/bioinformatics-atlas/';
function walk(dir:string):string[]{return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(root),html=files.filter(f=>f.endsWith('.html'));
type Element={attrs?:{name:string;value:string}[];childNodes?:Element[];tagName?:string};
const nodes=new Map<string,Element[]>();
function collect(n:Element,arr:Element[]){arr.push(n);n.childNodes?.forEach(c=>collect(c,arr));}
for(const file of html){const arr:Element[]=[];collect(parse(fs.readFileSync(file,'utf8')) as Element,arr);nodes.set(file,arr);}
const errors:string[]=[];let links=0;
for(const [file,elements] of nodes){
 const relative=path.relative(root,file).replaceAll(path.sep,'/').replace(/index\.html$/,'');const current=new URL(base+relative,origin);
 const ids=elements.flatMap(e=>e.attrs?.filter(a=>a.name==='id').map(a=>a.value)||[]);if(new Set(ids).size!==ids.length)errors.push(`${relative}: duplicate HTML id`);
 for(const el of elements)for(const a of el.attrs||[]){
  if(file.endsWith('/404.html') && el.attrs?.some(x=>x.name==='rel'&&x.value==='canonical'))continue;
  if(!['href','src','poster'].includes(a.name)||!a.value||/^(data:|mailto:|tel:|javascript:)/.test(a.value))continue;
  let url:URL;try{url=new URL(a.value,current);}catch{errors.push(`${relative}: malformed URL ${a.value}`);continue;}
  if(url.origin!==origin)continue;links++;
  if(!url.pathname.startsWith(base)){errors.push(`${relative}: missing repository base ${a.value}`);continue;}
  let target=path.join(root,decodeURIComponent(url.pathname.slice(base.length)));if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(`${relative}: missing target ${a.value}`);continue;}
  if(url.hash&&target.endsWith('.html')){const anchor=decodeURIComponent(url.hash.slice(1));if(!nodes.get(target)?.some(e=>e.attrs?.some(a=>a.name==='id'&&a.value===anchor)))errors.push(`${relative}: missing anchor ${a.value}`);}
 }
}
// Verify bundled CSS font/image URLs too.
for(const css of files.filter(f=>f.endsWith('.css'))){const text=fs.readFileSync(css,'utf8');for(const match of text.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)){const value=match[1]!;if(/^(data:|https?:|#)/.test(value))continue;const target=value.startsWith(base)?path.join(root,value.slice(base.length)):path.resolve(path.dirname(css),value);if(!fs.existsSync(target.split('?')[0]!))errors.push(`CSS missing asset ${value}`);}}
for(const m of readModules().filter(m=>m.data.status!=='published'))assert.ok(!fs.existsSync(path.join(root,modulePath(m.data),'index.html')),`Unpublished module leaked: ${m.data.id}`);
for(const c of readChapters().filter(c=>c.data.status!=='published'))assert.ok(!fs.existsSync(path.join(root,chapterPath(c.data,readModules().map(m=>m.data)),'index.html')),`Draft leaked: ${c.data.id}`);
assert.ok(files.some(f=>f.includes('/pagefind/')&&f.endsWith('.pf_meta')),'Pagefind index missing');
assert.ok(files.some(f=>f.includes('sitemap')&&f.endsWith('.xml')),'Sitemap missing');
if(errors.length)throw new Error(errors.join('\n'));
console.log(`Links OK: ${html.length} HTML pages, ${links} local references, bundled assets, anchors, draft exclusion, Pagefind and sitemap.`);
