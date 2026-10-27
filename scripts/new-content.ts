import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';
import { readModules, readChapters, readDecisions } from '../src/lib/content';
import { branches } from '../src/data/branches';

const [kind,...args]=process.argv.slice(2);const options=new Map<string,string>();
for(let i=0;i<args.length;i+=2){if(!args[i]?.startsWith('--')||!args[i+1])throw new Error('Use --name value');options.set(args[i]!.slice(2),args[i+1]!);}
const required=(name:string)=>{const s=options.get(name);if(!s)throw new Error(`Missing --${name}`);return s;};
const slug=required('slug'),title=required('title');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Slug must be lowercase kebab-case');
const modules=readModules(),chapters=readChapters();let file:string,meta:Record<string,unknown>;
if(kind==='chapter'){
 const id=required('module');if(!modules.some(m=>m.data.id===id))throw new Error(`Unknown module ${id}`);
 if(chapters.some(c=>c.data.module===id&&c.data.slug===slug))throw new Error('Chapter slug already exists');
 const next=Math.max(0,...chapters.filter(c=>c.data.module===id).map(c=>Number(c.data.id.split('-C')[1])))+1;
 const order=Math.max(0,...chapters.filter(c=>c.data.module===id).map(c=>c.data.order))+10;
 meta={id:`${id}-C${String(next).padStart(2,'0')}`,module:id,slug,title,status:'draft',order,question:'Какой проверяемый вопрос решает эта глава?',summary:'Черновик самостоятельной главы. Уточните вход, выход и границы модели.',prerequisites:[],sources:[{id:'plan',work:'PLAN',locator:'Редакторский замысел; замените на точные научные источники до review',depth:'mentioned'}]};
 file=`src/content/chapters/${id.toLowerCase()}/${slug}.mdx`;
}else if(kind==='module'){
 const branch=required('branch');if(!branches.some(b=>b.id===branch))throw new Error(`Unknown branch ${branch}`);
 const taken=[...modules.map(m=>m.data.id),...readDecisions().map(d=>d.id)];const next=Math.max(35,...taken.filter(id=>id.startsWith('M')).map(id=>Number(id.slice(1))))+1;
 const id=options.get('id')||`M${String(next).padStart(2,'0')}`;
 if(!/^[MK]\d{2}$/.test(id)||taken.includes(id))throw new Error(`ID ${id} is reserved or already exists. Edit the existing module instead.`);
 if(Number(id.slice(1))<(id.startsWith('M')?36:9))throw new Error('Historical IDs cannot be reused');
 if(modules.some(m=>m.data.slug===slug))throw new Error('Module slug already exists');
 const role=options.get('role')||'advanced';if(!['core','advanced','adjacent'].includes(role))throw new Error('Invalid role');
 meta={id,slug,title,branch,role,status:'draft',question:'Какой самостоятельный вопрос решает этот модуль?',summary:'Черновик нового модуля: укажите данные, вычислительную задачу и результат.',feature:'Опишите конкретное проверяемое свойство будущего учебного эксперимента.',prerequisites:[],methods:[{name:'Уточните метод',sources:['plan']}],sources:[{id:'plan',work:'PLAN',locator:'Новое редакторское решение; научные источники требуют добавления',depth:'mentioned'}],release_phase:7,sort_order:100,aliases:[],tags:[],related:[],planned_chapters:[]};
 file=`src/content/modules/${id.toLowerCase()}-${slug}.mdx`;
}else throw new Error('Expected chapter or module');
fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file))throw new Error(`File already exists: ${file}`);
fs.writeFileSync(file,`---\n${stringify(meta)}---\n\n${fs.readFileSync(`templates/${kind}.mdx.template`,'utf8')}`,{flag:'wx'});
console.log(`Created ${file}\nStatus: draft. Preview: npm run dev:drafts. Production excludes drafts.`);
