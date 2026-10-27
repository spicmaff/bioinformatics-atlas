import type {AlignmentResult} from './needleman-wunsch';

export type AlignmentColumn={index:number;a:string;b:string;positionA:number|null;positionB:number|null;kind:'match'|'mismatch'|'gap';contribution:number;cumulative:number};
/** Coordinates and score contributions of an already computed optimal alignment. */
export function alignmentProfile(result:AlignmentResult,variant=0):AlignmentColumn[]{
 if(!Number.isInteger(variant)||variant<0||variant>=result.alignments.length)throw new Error('Unknown alignment variant');
 const alignment=result.alignments[variant]!;let positionA=0,positionB=0,cumulative=0;
 const columns:AlignmentColumn[]=Array.from(alignment.a,(a,i)=>{
  const b=alignment.b[i]!,kind=a==='−'||b==='−'?'gap':a===b?'match':'mismatch';
  const contribution=kind==='gap'?result.scoring.gap:kind==='match'?result.scoring.match:result.scoring.mismatch;
  cumulative+=contribution;if(a!=='−')positionA++;if(b!=='−')positionB++;
  return {index:i+1,a,b,positionA:a==='−'?null:positionA,positionB:b==='−'?null:positionB,kind,contribution,cumulative};
 });
 if(cumulative!==result.score)throw new Error('Alignment profile does not reproduce the computed optimum');
 return columns;
}
