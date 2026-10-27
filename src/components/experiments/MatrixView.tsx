import { useRef } from 'react';
import type { AlignmentResult, Coordinate } from '../../algorithms/needleman-wunsch';
type Props = { result: AlignmentResult; filled: number; selected: Coordinate; onSelect: (p: Coordinate) => void; path: Coordinate[] };
const arrows = { diagonal: '↖', up: '↑', left: '←' } as const;
export default function MatrixView({ result, filled, selected, onSelect, path }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const columns = result.b.length + 1;
  const ready = (i: number,j: number) => !i || !j || (i-1)*result.b.length+j <= filled;
  function navigate(i: number, j: number, key: string) {
    const next: Coordinate = key === 'ArrowUp' ? [Math.max(0,i-1),j] : key === 'ArrowDown' ? [Math.min(result.a.length,i+1),j] : key === 'ArrowLeft' ? [i,Math.max(0,j-1)] : [i,Math.min(result.b.length,j+1)];
    onSelect(next); refs.current[next[0]*columns+next[1]]?.focus();
  }
  return <div className="matrix-scroll" role="region" aria-label="Матрица: горизонтальная прокрутка для длинных строк">
    <table className="dp-matrix" role="grid" aria-label="Матрица динамического программирования. Стрелки перемещают выбранную клетку.">
      <thead><tr><th scope="col">A ↓ / B →</th>{['∅',...result.b].map((c,j) => <th scope="col" key={j}><span>{c}</span><small>{j}</small></th>)}</tr></thead>
      <tbody>{result.matrix.map((row,i) => <tr key={i}><th scope="row"><span>{i ? result.a[i-1] : '∅'}</span><small>{i}</small></th>{row.map((score,j) => {
        const isReady = ready(i,j), isSelected = selected[0] === i && selected[1] === j;
        const inPath = path.some(([r,c]) => r === i && c === j);
        return <td key={j} className={`${inPath ? 'on-path' : ''} ${isSelected ? 'is-selected' : ''}`}>
          <button type="button" ref={el => { refs.current[i*columns+j] = el; }} tabIndex={isSelected ? 0 : -1} aria-label={`D[${i},${j}]: ${isReady ? score : 'ещё не вычислена'}${inPath ? ', путь traceback' : ''}`} aria-pressed={isSelected}
            onClick={() => onSelect([i,j])} onKeyDown={e => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); navigate(i,j,e.key); } }}>
            <span>{isReady ? score : '·'}</span><small aria-hidden="true">{isReady && result.predecessors[i]?.[j]?.map(m => arrows[m]).join('')}</small>
          </button>
        </td>;
      })}</tr>)}</tbody>
    </table>
  </div>;
}
