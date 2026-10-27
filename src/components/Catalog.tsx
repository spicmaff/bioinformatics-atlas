import { useEffect, useState } from 'react';
import type { Module } from '../lib/schema';
import { branches } from '../data/branches';
type Card = Module & { href: string; chapterCount: number };
const roles = {core:'Ядро',advanced:'Углубление',adjacent:'Смежная ветка'};
const types = [['dna','Последовательности'],['reads','Чтения / геномы'],['matrix','Матрицы измерений'],['spectra','Спектры'],['model','Модели и агенты']];
export default function Catalog({ modules }: { modules: Card[] }) {
  const [query,setQuery]=useState(''),[all,setAll]=useState(false),[branch,setBranch]=useState<string[]>([]),[role,setRole]=useState<string[]>([]),[data,setData]=useState<string[]>([]),[ready,setReady]=useState(false);
  useEffect(()=>{const p=new URLSearchParams(location.search);setQuery(p.get('q')||'');setAll(p.get('all')==='1');setBranch(p.getAll('branch'));setRole(p.getAll('role'));setData(p.getAll('data'));setReady(true);},[]);
  useEffect(()=>{if(!ready)return;const p=new URLSearchParams();if(query)p.set('q',query);if(all)p.set('all','1');branch.forEach(v=>p.append('branch',v));role.forEach(v=>p.append('role',v));data.forEach(v=>p.append('data',v));history.replaceState(null,'',`${location.pathname}${p.size?'?'+p.toString():''}${location.hash}`);},[query,all,branch,role,data,ready]);
  const toggle=(values:string[],v:string,set:(v:string[])=>void)=>set(values.includes(v)?values.filter(x=>x!==v):[...values,v]);
  const reset=()=>{setQuery('');setAll(false);setBranch([]);setRole([]);setData([]);};
  const cards=modules.filter(m=>(all||m.status==='published')&&(!branch.length||branch.includes(m.branch))&&(!role.length||role.includes(m.role))&&(!data.length||data.some(d=>m.tags.includes(d)))&&`${m.id} ${m.title} ${m.title_en} ${m.aliases.join(' ')} ${m.summary} ${m.methods.map(x=>x.name).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="catalog not-content">
    <div className="catalog-search"><label htmlFor="catalog-query">Название, вопрос, метод или ID</label><input id="catalog-query" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Например: выравнивание, матрица, M01"/></div>
    <div className="catalog-toolbar"><div className="segmented" role="group" aria-label="Доступность модулей"><button onClick={()=>setAll(false)} aria-pressed={!all}>Доступные</button><button onClick={()=>setAll(true)} aria-pressed={all}>Вся программа · {modules.length}</button></div><p aria-live="polite" aria-atomic="true">Найдено модулей: <strong>{cards.length}</strong></p></div>
    <div className="catalog-layout">
      <details className="catalog-filters" open><summary>Фильтры</summary>
        <fieldset><legend>Ветка</legend>{branches.map(b=><label key={b.id}><input type="checkbox" checked={branch.includes(b.id)} onChange={()=>toggle(branch,b.id,setBranch)}/><span>{b.title}</span></label>)}</fieldset>
        <fieldset><legend>Данные</legend>{types.map(([id,title])=><label key={id}><input type="checkbox" checked={data.includes(id!)} onChange={()=>toggle(data,id!,setData)}/>{title}</label>)}</fieldset>
        <fieldset><legend>Место в программе</legend>{Object.entries(roles).map(([id,title])=><label key={id}><input type="checkbox" checked={role.includes(id)} onChange={()=>toggle(role,id,setRole)}/>{title}</label>)}</fieldset><button onClick={reset}>Сбросить фильтры</button>
      </details>
      <div>{!cards.length&&<div className="empty-state"><h2>Совпадений нет</h2><p>Ни один модуль не соответствует сочетанию условий.</p><button onClick={reset}>Сбросить фильтры</button></div>}
        <div className="module-grid">{cards.map(m=><a className="module-card" href={m.href} key={m.id}>
          <div className="card-meta"><span>{m.id}</span><span>{roles[m.role]}</span></div><h2>{m.title}</h2><p>{m.summary}</p>
          <div className="method-tags">{m.methods.flatMap(method=>method.name.replace(/\b(?:P|V1|V2|CGR|NEU)(?:\/(?:P|V1|V2|CGR|NEU))*:\s*/g,'').split(/[,;]/)).slice(0,3).map((name,i)=><span key={i}>{name.trim()}</span>)}</div>
          <div className="card-footer"><span>{m.sources.map(s=>s.work).join(' / ')}</span><span className={m.status==='published'?'availability':'planned-badge'}>{m.status==='published'?`${m.chapterCount} глава доступна`:'В программе'}</span></div>
        </a>)}</div>
      </div>
    </div>
    <noscript>Каталог показывает доступные модули. Полная программа доступна по ссылке «Программа и готовность» внизу страницы; фильтры требуют JavaScript.</noscript>
  </div>;
}
