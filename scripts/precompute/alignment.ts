import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { needlemanWunsch } from '../../src/algorithms/needleman-wunsch';
const result=needlemanWunsch('A','AA');
const artifact={schema_version:1,generation:'precomputed',execution:'replay',producer:'npm run precompute:demo',algorithm_version:result.version,provenance:'synthetic-teaching-example',result};
const bytes=JSON.stringify(artifact,null,2)+'\n';
fs.mkdirSync('public/examples/v1',{recursive:true});fs.writeFileSync('public/examples/v1/alignment.json',bytes);
fs.writeFileSync('public/examples/v1/manifest.json',JSON.stringify({schema_version:1,artifact:'alignment.json',sha256:createHash('sha256').update(bytes).digest('hex'),producer:'scripts/precompute/alignment.ts',runtime:'Node.js 24.22.1; package-lock.json',parameters:{a:'A',b:'AA',match:2,mismatch:-1,gap:-2}},null,2)+'\n');
console.log('Deterministic replay artifact and SHA-256 manifest written.');
