import { useId, useState } from 'react';
import { ALGORITHM_VERSION, MAX_SEQUENCE_LENGTH, needlemanWunsch, type AlignmentResult, type Coordinate } from '../../algorithms/needleman-wunsch';
import { ExperimentPanel, StepPlayer } from './ExperimentPanel';
import MatrixView from './MatrixView';

export default function NeedlemanWunsch() {
  const id = useId();
  const [a,setA] = useState('ACG'), [b,setB] = useState('ACG');
  const [match,setMatch] = useState('2'), [mismatch,setMismatch] = useState('-1'), [gap,setGap] = useState('-2');
  const [result,setResult] = useState<AlignmentResult | null>(null), [error,setError] = useState('');
  const [filled,setFilled] = useState(0), [selected,setSelected] = useState<Coordinate>([0,0]);
  const [variant,setVariant] = useState(0), [trace,setTrace] = useState(-1);
  const stale = !!result && (a.trim().toUpperCase() !== result.a || b.trim().toUpperCase() !== result.b || Number(match) !== result.scoring.match || Number(mismatch) !== result.scoring.mismatch || Number(gap) !== result.scoring.gap);
  const alignment = result?.alignments[variant];
  const current = result?.steps.find(s => s.i === selected[0] && s.j === selected[1]);
  const isRevealed = !!result && (!selected[0] || !selected[1] || (selected[0]-1)*result.b.length+selected[1] <= filled);
  function run(e: { preventDefault(): void }) {
    e.preventDefault();
    try {
      if ([match,mismatch,gap].some(s => s.trim() === '')) throw new Error('Заполните все три оценки.');
      const next = needlemanWunsch(a,b,{match:Number(match),mismatch:Number(mismatch),gap:Number(gap)});
      setResult(next); setFilled(0); setTrace(-1); setVariant(0); setSelected([0,0]); setError('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Проверьте ввод.'); }
  }
  function fill(n: number) {
    setFilled(n); setTrace(-1);
    if (result && n > 0) { const step = result.steps[n-1]!; setSelected([step.i,step.j]); }
    else setSelected([0,0]);
  }
  function preset(aa: string,bb: string) { setA(aa);setB(bb);setMatch('2');setMismatch('-1');setGap('-2');setError(''); }
  function exportResult() {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ provenance: 'synthetic-teaching-example', execution: 'browser', ...result },null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href=url;anchor.download='needleman-wunsch.json';anchor.click();URL.revokeObjectURL(url);
  }
  return <div className="nw-experiment not-content" data-testid="nw-experiment">
    <div className="experiment-heading"><span className="eyebrow">B · Расчёт в браузере</span><span className="version">{ALGORITHM_VERSION}</span></div>
    <ExperimentPanel controls={<form onSubmit={run}>
      <h3>Вход и оценки</h3>
      <p className="field-help" id={`${id}-help`}>ДНК: A, C, G, T. До {MAX_SEQUENCE_LENGTH} букв. Пустая строка допустима; регистр не важен.</p>
      <label htmlFor={`${id}-a`}>Последовательность A</label><input id={`${id}-a`} name="sequence-a" className="sequence-input" value={a} onChange={e=>setA(e.target.value)} autoComplete="off" spellCheck={false} maxLength={100} aria-describedby={`${id}-help ${id}-error`} aria-invalid={!!error}/>
      <label htmlFor={`${id}-b`}>Последовательность B</label><input id={`${id}-b`} name="sequence-b" className="sequence-input" value={b} onChange={e=>setB(e.target.value)} autoComplete="off" spellCheck={false} maxLength={100} aria-describedby={`${id}-help ${id}-error`} aria-invalid={!!error}/>
      <div className="scoring-fields">
        <label>Совпадение<input name="match" type="number" min="0" max="10" step="1" value={match} onChange={e=>setMatch(e.target.value)}/></label>
        <label>Замена<input name="mismatch" type="number" min="-10" max="0" step="1" value={mismatch} onChange={e=>setMismatch(e.target.value)}/></label>
        <label>Пропуск<input name="gap" type="number" min="-10" max="0" step="1" value={gap} onChange={e=>setGap(e.target.value)}/></label>
      </div>
      <p className="field-help">Слагаемые score; пропуск линейный. Больше — лучше.</p>
      <button type="submit" className="primary-button">Рассчитать</button>
      <p id={`${id}-error`} className="error-text" role="alert">{error}</p>
      <fieldset className="presets"><legend>Контрольные примеры</legend>
        <button type="button" onClick={()=>preset('ACG','ACG')}>ACG / ACG</button>
        <button type="button" onClick={()=>preset('','AC')}>Пустая / AC</button>
        <button type="button" onClick={()=>preset('A','AA')}>A / AA · ничья</button>
      </fieldset>
      <button type="button" onClick={()=>{preset('ACG','ACG');setResult(null);setError('');}}>Сбросить эксперимент</button>
    </form>}>
      <div aria-live="polite" className="experiment-status">{!result ? 'Задайте вход и нажмите «Рассчитать».' : stale ? 'Предыдущий расчёт. Параметры изменены — пересчитайте.' : `Готово. Score ${result.score}. Оптимальных выравниваний: ${result.optimalCount}.`}</div>
      {!result && <div className="experiment-idle"><span className="idle-symbol" aria-hidden="true">D[i, j]</span><p>Каждая клетка сравнивает три пути.<br/>Матрица появится после расчёта.</p><p className="field-help">Шаги и traceback станут доступны вместе с результатом.</p></div>}
      {result && <>
        <div className="score-strip"><strong>Score <output aria-label="Оптимальный score">{result.score}</output></strong><span>Оптимальных путей: {result.optimalCount}</span><span>{stale ? 'Предыдущий расчёт' : 'Глобальное выравнивание'}</span></div>
        <fieldset disabled={stale} className="unframed"><legend>Заполнение матрицы</legend><StepPlayer label="Заполнение матрицы" value={filled} max={result.steps.length} onChange={fill}/></fieldset>
        <p className="field-help">Границы: D[i,0] = i·gap, D[0,j] = j·gap. Стрелки клавиатуры выбирают клетку; точки — ещё не показанные шаги.</p>
        <MatrixView result={result} filled={filled} selected={selected} onSelect={setSelected} path={alignment && !stale ? alignment.path.slice(0,trace+1) : []}/>
        <div className="cell-readout" aria-live="polite" aria-atomic="true"><strong>Клетка D[{selected.join(',')}]</strong>
          {!isRevealed ? <p>Этот шаг ещё не показан.</p> : current ? <><p>↖ {current.candidates.diagonal} · ↑ {current.candidates.up} · ← {current.candidates.left}</p><p>Максимум: {result.matrix[selected[0]]![selected[1]]}. Оптимальных переходов: {current.moves.length}.</p></> : <p>Граничное условие: {result.matrix[selected[0]]![selected[1]]}.</p>}
        </div>
        <fieldset className="unframed" disabled={stale || filled < result.steps.length}><legend>Обратный проход · traceback</legend>
          {filled < result.steps.length && <p className="field-help">Сначала покажите все клетки матрицы.</p>}
          <button type="button" onClick={()=>setTrace(t=>Math.min((alignment?.path.length ?? 1)-1,t+1))} disabled={trace >= (alignment?.path.length ?? 1)-1}>Шаг traceback</button>{' '}
          <button type="button" onClick={()=>setTrace((alignment?.path.length ?? 1)-1)}>Весь путь</button>
          <p className="field-help">Путь выделен сплошной границей и стрелками. При ничьей: диагональ, вверх, влево.</p>
        </fieldset>
        {alignment && <div className="alignment-result"><label htmlFor={`${id}-variant`}>Оптимальный ответ</label><select id={`${id}-variant`} value={variant} onChange={e=>{setVariant(Number(e.target.value));setTrace(-1);}} disabled={stale}>{result.alignments.map((_,i)=><option key={i} value={i}>Вариант {i+1}</option>)}</select>
          <pre aria-label="Итоговое выравнивание"><code>{alignment.a || '∅'}{'\n'}{[...alignment.a].map((c,i)=>c === alignment.b[i] ? '|' : ' ').join('')}{'\n'}{alignment.b || '∅'}</code></pre>
          <p className="field-help">Всего оптимумов: {result.optimalCount}. {result.truncated ? 'Перечислены первые 20; число всех путей вычислено точно.' : 'Перечислены все.'} Символ − означает пропуск; ∅ — пустую последовательность.</p>
        </div>}
        <button type="button" onClick={exportResult} disabled={stale}>Скачать вход, параметры и результат JSON</button>
      </>}
    </ExperimentPanel>
  </div>;
}
