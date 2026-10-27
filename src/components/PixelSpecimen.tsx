export default function PixelSpecimen({branch}:{branch:string}){
 const colors=['#b6a0df','#9ac5b1','#e7b58d'];
 const groups:Record<string,number>={sequences:0,'reads-genomes':1,'genome-comparison':2,'assays-regulation':3,'spectra-proteins':4,'data-inference':5,optimization:6,'neuro-alife':7};const n=groups[branch]??0;
 const dots=Array.from({length:24},(_,i)=>({x:25+((i*47+17)%250),y:20+((i*31+11)%170)}));
 return <svg className={`pixel-specimen specimen-${n}`} viewBox="0 0 300 220" aria-hidden="true" shapeRendering="crispEdges">
  <path className="specimen-border" d="M8 38V8h30M262 8h30v30M8 182v30h30M262 212h30v-30" fill="none" stroke="currentColor"/>
  <g className="specimen-stars">{dots.slice(0,9).map((d,i)=><rect key={i} x={d.x} y={d.y} width={i%3===0?3:1} height={i%3===0?3:1} fill={colors[i%3]} opacity=".5"/>)}</g>
  {n===0&&<g className="specimen-float">{Array.from({length:15},(_,i)=>{const y=32+i*10,x=110+Math.round(Math.sin(i*.65)*30/4)*4;return <g key={i}><path d={`M${x} ${y}H${300-x}`} stroke="#756a92" strokeWidth="2"/><rect x={x-5} y={y-3} width="8" height="6" fill={colors[i%2]}/><rect x={295-x} y={y-3} width="8" height="6" fill={colors[(i+1)%2]}/></g>;})}</g>}
  {(n===1||n===7)&&<g className="specimen-float">{[45,95,150,205,255].map((x,i)=><g key={x}>{[60,110,160].map((y,j)=><g key={y}>{i<4&&<path d={`M${x} ${y}H${x+20}V${[60,110,160][(j+i+1)%3]}H${[45,95,150,205,255][i+1]}`} fill="none" stroke="#535369" strokeWidth="2"/>}<rect x={x-5} y={y-5} width="10" height="10" fill={colors[(i+j)%3]}/></g>)}</g>)}</g>}
  {n===2&&<g className="specimen-float"><path d="M58 110h48V50h44m-44 60v60h44m0-120h36V30h56m-56 20v30h56m-92 90h36v-30h56m-56 30v25h56" fill="none" stroke="#a5c5b2" strokeWidth="3"/>{[30,80,140,195].map((y,i)=><rect key={y} x="237" y={y-5} width="10" height="10" fill={colors[i%3]}/>)}</g>}
  {n===3&&<g className="specimen-float">{[0,1,2].map(i=><g key={i} transform={`translate(${i*80},${i%2*20})`}><path d="M50 120V90l15-16h22l15 16v30l-15 16H65z" stroke={colors[i]} strokeWidth="2" fill="#252538"/><rect x="68" y="100" width="14" height="14" fill={colors[i]}/></g>)}</g>}
  {n===4&&<g className="specimen-float">{Array.from({length:23},(_,i)=>{const h=16+((i*43+17)%100);return <rect key={i} x={42+i*10} y={170-h} width="4" height={h} fill={colors[i%3]} opacity={i%3===0?1:.55}/>;})}<path d="M36 175H275" stroke="#67647b"/></g>}
  {n===5&&<g className="specimen-float">{dots.map((_,i)=><rect key={i} x={75+((i*31)%150)} y={45+((i*29)%130)} width="5" height="5" fill={colors[i%3]}/>)}<path d="M55 45v140h205" fill="none" stroke="#626278"/></g>}
  {n===6&&<g className="specimen-float">{[0,1,2,3].map(i=><path key={i} d={`M${55+i*18} ${65+i*12}h${155-i*35}l20 20v${85-i*24}l-20 15H${55+i*18}l-14-15V${85+i*12}z`} fill="none" stroke={colors[i%3]} opacity={.4+i*.15}/>)}<rect x="151" y="102" width="9" height="9" fill="#e7b58d"/></g>}
 </svg>;
}
