import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {branches} from '../data/branches';
import type {Module} from '../lib/schema';
import AlignmentScene from './AlignmentScene';
type Card=Module&{href:string;chapterCount:number};
const roles={core:'Основной модуль',advanced:'Углубление',adjacent:'Смежная область'};
const shortNames=['Последовательности','Геномы и чтения','Сравнение геномов','Измерения','Спектры и белки','Данные и вывод','Оптимизация','Искусственная жизнь'];
export default function ModuleNavigator({modules}:{modules:Card[]}){
 const first=modules.find(m=>m.status==='published')??modules[0]!;
 const [selected,setSelected]=useState(first.id),[query,setQuery]=useState('');const tabs=useRef<HTMLDivElement>(null);
 const current=modules.find(m=>m.id===selected)??first;
 const match=(m:Card,q:string)=>`${m.id} ${m.title} ${m.aliases.join(' ')} ${m.summary} ${m.methods.map(x=>x.name).join(' ')}`.toLowerCase().includes(q.toLowerCase());
 const results=modules.filter(m=>match(m,query)),shelf=query?results:modules.filter(m=>m.branch===current.branch),at=shelf.findIndex(m=>m.id===current.id);
 useEffect(()=>{const id=new URLSearchParams(location.search).get('module');if(id&&modules.some(m=>m.id===id))setSelected(id);},[]);
 useEffect(()=>{const rail=tabs.current,card=rail?.querySelector<HTMLButtonElement>('[aria-selected="true"]');if(!rail||!card)return;const left=rail.scrollLeft+card.getBoundingClientRect().left-rail.getBoundingClientRect().left-(rail.clientWidth-card.clientWidth)/2;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='reduced';rail.scrollTo({left:Math.max(0,left),behavior:reduced?'auto':'smooth'});},[selected,query]);
 function choose(id:string){setSelected(id);const p=new URLSearchParams(location.search);p.set('module',id);history.replaceState(null,'',`${location.pathname}?${p.toString()}`);}
 function changeBranch(id:string){setQuery('');const next=modules.find(m=>m.branch===id);if(next)choose(next.id);}
 function step(delta:number){if(shelf.length)choose(shelf[(Math.max(0,at)+delta+shelf.length)%shelf.length]!.id);}
 function key(e:KeyboardEvent<HTMLButtonElement>,i:number){let next=i;if(e.key==='ArrowRight')next=(i+1)%shelf.length;else if(e.key==='ArrowLeft')next=(i-1+shelf.length)%shelf.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=shelf.length-1;else return;e.preventDefault();choose(shelf[next]!.id);tabs.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();}
 return <div className="module-navigator not-content">
  <div className="navigator-heading"><div><p className="field-label">01 / ВЫБОР НАПРАВЛЕНИЯ</p><h1 id="_top">За чем<br/><em>пойдём сегодня?</em></h1></div><div className="navigator-search"><label htmlFor="module-search">Найти свой вопрос</label><input id="module-search" type="search" placeholder="Метод, название или ID" value={query} onChange={e=>{const q=e.target.value;setQuery(q);const found=modules.find(m=>match(m,q));if(found&&q)choose(found.id);}}/></div></div>
  <div className="navigator-cabinet">
   <nav className="branch-rail" aria-label="Тематические направления">{branches.map((b,i)=><button key={b.id} type="button" aria-pressed={b.id===current.branch} onClick={()=>changeBranch(b.id)}><span className="rail-number">{String(i+1).padStart(2,'0')}</span><span>{shortNames[i]}</span><i aria-hidden="true">↗</i></button>)}</nav>
   <div className="module-chamber">{query&&!results.length?<div className="navigator-empty" role="status"><p className="field-label">СЛЕД ПОТЕРЯЛСЯ</p><h2>Здесь пока тихо.</h2><p>Модуль с таким названием или ID не найден.</p><button type="button" onClick={()=>setQuery('')}>Вернуться к модулям</button></div>:<>
    <div className={`module-focus ${current.id==='M01'?'module-focus-scientific':'module-focus-text'}`} id="module-panel" role="tabpanel" aria-labelledby={`module-tab-${current.id}`} key={current.id}>
     <div className="module-focus-copy"><div className="module-specimen-meta"><span>{current.id}</span><span>{roles[current.role]}</span></div><p className="field-label module-field">{branches.find(b=>b.id===current.branch)?.title}</p><h2>{current.title}</h2><p className="module-focus-question">{current.question}</p><p className="module-focus-summary">{current.summary}</p><div className="module-launch"><a className="portal-enter" href={current.href}>{current.status==='published'?'Выбрать тему':'Посмотреть программу'}<span aria-hidden="true">↗</span></a><span className={`module-state ${current.status==='published'?'is-ready':''}`}><i aria-hidden="true"></i>{current.status==='published'?'Есть доступный алгоритм':'Материалы готовятся'}</span></div></div>
     {current.id==='M01'&&<div className="module-science"><AlignmentScene compact/></div>}
    </div>
    <div className="module-selector"><div className="module-selector-caption"><span>{query?'РЕЗУЛЬТАТЫ ПОИСКА':'МОДУЛИ ЭТОГО НАПРАВЛЕНИЯ'}</span><div><button type="button" onClick={()=>step(-1)} aria-label="Предыдущий модуль">←</button><button type="button" onClick={()=>step(1)} aria-label="Следующий модуль">→</button></div></div><div className="module-tabs" role="tablist" aria-label="Модули направления" ref={tabs}>{shelf.map((m,i)=><button role="tab" type="button" id={`module-tab-${m.id}`} key={m.id} aria-selected={m.id===current.id} aria-controls="module-panel" tabIndex={m.id===current.id?0:-1} onKeyDown={e=>key(e,i)} onClick={()=>choose(m.id)}><span>{m.id}</span><strong>{m.title}</strong><i className={m.status==='published'?'ready-dot':''} aria-hidden="true"></i></button>)}</div></div>
   </>}</div>
  </div>
  <div className="navigator-footnote"><span><i className="ready-dot" aria-hidden="true"></i> Можно исследовать сейчас</span><span>35 модулей · 8 направлений</span><a href="../program/">Карта учебника ↗</a></div>
  <noscript>Для анимированного выбора нужен JavaScript. <a href="../program/">Полная программа с доступными материалами</a>.</noscript>
 </div>;
}
