export const MAX_SEQUENCE_LENGTH = 24;
export const ALIGNMENT_LIMIT = 20;
export const ALGORITHM_VERSION = 'nw-linear-v1';
export type Scoring = { match: number; mismatch: number; gap: number };
export type Move = 'diagonal' | 'up' | 'left';
export type Coordinate = [number, number];
export type Alignment = { a: string; b: string; path: Coordinate[] };
export type CellStep = { i: number; j: number; candidates: Record<Move, number>; moves: Move[] };
export type AlignmentResult = {
  a: string; b: string; scoring: Scoring; score: number; matrix: number[][];
  predecessors: Move[][][]; steps: CellStep[]; alignments: Alignment[];
  optimalCount: string; truncated: boolean; version: string;
};
export const defaultScoring: Scoring = { match: 2, mismatch: -1, gap: -2 };
export function normalizeSequence(raw: string): string {
  const value = raw.trim().toUpperCase();
  if (!/^[ACGT]*$/.test(value)) throw new Error('Допустимы только A, C, G, T. Уберите пробелы внутри строки, N и символы пропуска.');
  if (value.length > MAX_SEQUENCE_LENGTH) throw new Error(`Не больше ${MAX_SEQUENCE_LENGTH} нуклеотидов в каждой строке.`);
  return value;
}
export function validateScoring(s: Scoring): void {
  if (!Number.isInteger(s.match) || s.match < 0 || s.match > 10) throw new Error('Match: целое число от 0 до 10.');
  for (const key of ['mismatch', 'gap'] as const)
    if (!Number.isInteger(s[key]) || s[key] < -10 || s[key] > 0) throw new Error(`${key}: целое число от −10 до 0.`);
}
/** Pure global alignment. Rows consume A, columns B. Ties: diagonal, up, left. */
export function needlemanWunsch(rawA: string, rawB: string, scoring: Scoring = defaultScoring): AlignmentResult {
  const a = normalizeSequence(rawA), b = normalizeSequence(rawB);
  validateScoring(scoring);
  const n = a.length, m = b.length;
  const matrix = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  const predecessors = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => [] as Move[]));
  const counts = Array.from({ length: n + 1 }, () => Array<bigint>(m + 1).fill(0n));
  counts[0]![0] = 1n;
  for (let i = 1; i <= n; i++) { matrix[i]![0] = i * scoring.gap; predecessors[i]![0] = ['up']; counts[i]![0] = 1n; }
  for (let j = 1; j <= m; j++) { matrix[0]![j] = j * scoring.gap; predecessors[0]![j] = ['left']; counts[0]![j] = 1n; }
  const steps: CellStep[] = [];
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const candidates = { diagonal: matrix[i-1]![j-1]! + (a[i-1] === b[j-1] ? scoring.match : scoring.mismatch), up: matrix[i-1]![j]! + scoring.gap, left: matrix[i]![j-1]! + scoring.gap };
    const best = Math.max(...Object.values(candidates));
    const moves = (['diagonal', 'up', 'left'] as const).filter(move => candidates[move] === best);
    matrix[i]![j] = best; predecessors[i]![j] = moves;
    counts[i]![j] = (moves.includes('diagonal') ? counts[i-1]![j-1]! : 0n) + (moves.includes('up') ? counts[i-1]![j]! : 0n) + (moves.includes('left') ? counts[i]![j-1]! : 0n);
    steps.push({ i, j, candidates, moves });
  }
  const alignments: Alignment[] = [];
  function trace(i: number, j: number, aa: string, bb: string, path: Coordinate[]): void {
    if (alignments.length >= ALIGNMENT_LIMIT) return;
    if (!i && !j) { alignments.push({ a: aa, b: bb, path }); return; }
    for (const move of predecessors[i]![j]!) {
      if (move === 'diagonal') trace(i-1, j-1, a[i-1]+aa, b[j-1]+bb, [...path, [i-1,j-1]]);
      if (move === 'up') trace(i-1, j, a[i-1]+aa, '−'+bb, [...path, [i-1,j]]);
      if (move === 'left') trace(i, j-1, '−'+aa, b[j-1]+bb, [...path, [i,j-1]]);
    }
  }
  trace(n, m, '', '', [[n,m]]);
  const optimalCount = counts[n]![m]!.toString();
  return { a, b, scoring: { ...scoring }, matrix, predecessors, steps, score: matrix[n]![m]!, alignments, optimalCount, truncated: BigInt(optimalCount) > BigInt(alignments.length), version: ALGORITHM_VERSION };
}
