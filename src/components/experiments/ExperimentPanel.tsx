import type { ReactNode } from 'react';
export function ExperimentPanel({ controls, children }: { controls: ReactNode; children: ReactNode }) {
  return <section className="experiment-panel" aria-label="Панель эксперимента">
    <div className="experiment-controls">{controls}</div><div className="experiment-workspace">{children}</div>
  </section>;
}
export function StepPlayer({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return <div className="step-player" role="group" aria-label={label}>
    <button type="button" disabled={value <= 0} onClick={() => onChange(Math.max(0,value-1))}>Назад</button>
    <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max,value+1))}>Шаг</button>
    <button type="button" onClick={() => onChange(max)} disabled={value === max}>Все шаги</button>
    <button type="button" onClick={() => onChange(0)} disabled={value === 0}>В начало</button>
    <span>{value} / {max}</span>
  </div>;
}
