import {useEffect,useId,useMemo,useState} from 'react';
import {needlemanWunsch} from '../algorithms/needleman-wunsch';
import {alignmentProfile} from '../algorithms/alignment-profile';
import {alignmentExamples} from '../data/alignment-examples';

export default function AlignmentScene({compact=false,href}:{compact?:boolean;href?:string}){
 const id=useId(),[example,setExample]=useState(2),[shown,setShown]=useState(8),[playing,setPlaying]=useState(false);
 const input=alignmentExamples[example]!,result=useMemo(()=>needlemanWunsch(input.a,input.b),[input]);
 const columns=useMemo(()=>alignmentProfile(result),[result]),count=columns.length,step=Math.min(shown,count),active=columns[step-1];
 const values=[0,...columns.map(c=>c.cumulative)],low=Math.min(...values,0),high=Math.max(...values,1);
 const x=(k:number)=>54+k*378/count,y=(score:number)=>292-(score-low)*70/(high-low);
 const points=values.slice(0,step+1).map((v,k)=>`${x(k)},${y(v)}`).join(' ');
 useEffect(()=>{
  if(!playing)return;
  const timer=window.setInterval(()=>setShown(s=>{if(s>=count)return s;return s+1;}),550);
  return()=>window.clearInterval(timer);
 },[playing,count]);
 useEffect(()=>{if(shown>=count)setPlaying(false);},[shown,count]);
 useEffect(()=>{const stop=()=>{if(document.documentElement.dataset.motion==='reduced')setPlaying(false);};const observer=new MutationObserver(stop);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});return()=>observer.disconnect();},[]);
 function select(index:number){setExample(index);setShown(8);setPlaying(false);}
 function play(){if(playing){setPlaying(false);return;}if(step>=count)setShown(0);setPlaying(true);}
 const signed=(v:number)=>v>0?`+${v}`:String(v).replace('-','−');
 return <figure className={`alignment-scene ${compact?'alignment-scene-compact':''}`} aria-labelledby={`${id}-title`}>
  <div className="science-figure-top"><span className="field-label">M01 / ПОСЛЕДОВАТЕЛЬНОСТИ ДНК</span><span className="science-live-label">расчёт в браузере</span></div>
  <figcaption id={`${id}-title`} className={`science-figure-title ${compact?'sr-only':''}`}>От двух строк —<br/><em>к соответствию.</em></figcaption>
  {!compact&&<div className="science-presets" role="group" aria-label="Учебные примеры выравнивания">{alignmentExamples.map((e,i)=><button key={e.id} type="button" aria-pressed={example===i} onClick={()=>select(i)}>{e.label}</button>)}</div>}
  <p className="science-scoring">Совпадение +2 · Замена −1 · Пропуск −2</p>
  <svg className="alignment-plot" viewBox="0 0 480 330" role="img" aria-labelledby={`${id}-plot-title ${id}-plot-desc`}>
   <title id={`${id}-plot-title`}>Выравнивание двух последовательностей и накопленная оценка</title>
   <desc id={`${id}-plot-desc`}>Синтетический пример. ДНК A: {input.a}. ДНК B: {input.b}. Показано колонок {step} из {count}. Оценки: совпадение +2, замена −1, пропуск −2. Оптимум {result.score}. По горизонтали номер колонки, по вертикали накопленная оценка.</desc>
   <g className="sequence-backbones"><path d="M77 74H452M77 138H452"/><text x="14" y="81">A</text><text x="14" y="145">B</text><text x="67" y="49">5′</text><text x="448" y="49">3′</text><text x="67" y="113">5′</text><text x="448" y="113">3′</text></g>
   {columns.map(c=><g className={`alignment-column column-${c.kind} ${c.index===step?'column-active':''} ${c.index>step?'column-unrevealed':''}`} key={c.index}>
    {c.index===step&&<rect className="column-highlight" x={x(c.index)-20} y="51" width="40" height="128" rx="3"/>}
    <line className="alignment-link" x1={x(c.index)} x2={x(c.index)} y1="93" y2="119"/>
    {[c.a,c.b].map((base,row)=><g key={row}><circle className={`nucleotide nucleotide-${base==='−'?'gap':base}`} cx={x(c.index)} cy={row?138:74} r="18"/><text className="base-letter" x={x(c.index)} y={row?146:82} textAnchor="middle">{base}</text></g>)}
    <text className="column-score" x={x(c.index)} y="173" textAnchor="middle">{signed(c.contribution)}</text>
   </g>)}
   <text className="plot-subtitle" x="54" y="209">Накопленная оценка</text>
   <g className="score-axis">{[low,(low+high)/2,high].map(v=><g key={v}><line x1="54" x2="446" y1={y(v)} y2={y(v)}/><text x="42" y={y(v)+6} textAnchor="end">{String(v).replace('.',',')}</text></g>)}<line x1="54" x2="54" y1="222" y2="292"/>{values.map((_,k)=><text key={k} x={x(k)} y="318" textAnchor="middle">{k}</text>)}</g>
   <polyline className="score-trace" points={points}/>
   {values.slice(0,step+1).map((v,k)=><circle className={k===step?'score-point-active':'score-point'} key={k} cx={x(k)} cy={y(v)} r={k===step?5:3}/>)}
  </svg>
  <div className="science-score-summary"><span>Колонка <strong>{step} / {count}</strong></span><span>Сумма <strong data-testid="profile-score">{step?active!.cumulative:0}</strong></span><span className="score-model">Колонки →</span></div>
  {!compact&&<><div className="science-step-controls"><button type="button" onClick={play} aria-pressed={playing}>{playing?'Пауза':step===count?'По шагам':'Продолжить'}</button><input type="range" aria-label="Колонка выравнивания" min="0" max={count} step="1" value={step} onChange={e=>{setShown(Number(e.target.value));setPlaying(false);}}/><button type="button" aria-label="Следующая колонка" disabled={step===count||playing} onClick={()=>setShown(s=>Math.min(count,s+1))}>Шаг →</button></div>
  <p className="science-explanation" aria-live="polite">{step===count?input.description:active?`Колонка ${step}: ${active.a} / ${active.b}. Вклад ${signed(active.contribution)}, накопленная оценка ${active.cumulative}.`:'До первой колонки накопленная оценка равна нулю.'}</p></>}
  <div className="science-provenance"><span>Синтетические данные · Needleman–Wunsch</span>{href&&<a href={href}>Полный эксперимент ↗</a>}</div>
 </figure>;
}
