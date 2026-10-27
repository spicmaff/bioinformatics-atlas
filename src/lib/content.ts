// Server/build use only. MDX frontmatter is the canonical source of metadata.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { parse } from 'yaml';
import { moduleSchema, chapterSchema, referenceSchema } from './schema';
import type { Module, Chapter, Reference, Topic } from './schema';

function files(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(f => f.isDirectory()
    ? files(path.join(dir, f.name)) : f.name.endsWith('.mdx') ? [path.join(dir, f.name)] : []);
}
function load<T>(folder: string, schema: { parse: (d: unknown) => T }) {
  return files(`src/content/${folder}`).map(file => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    try { return { data: schema.parse(data), body: content, file }; }
    catch (error) { throw new Error(`${file}: ${String(error)}`); }
  });
}
export const readModules = () => load<Module>('modules', moduleSchema);
export const readChapters = () => load<Chapter>('chapters', chapterSchema);
export const readFoundations = () => load<Reference>('foundations', referenceSchema);
export const readTheory = () => load<Reference>('theory', referenceSchema);
export type Decision = { id: string; decision: 'candidate'|'merged'|'reference'; title: string; reason: string; target?: string; section?: string };
export type Work = { id: string; title: string; authors: string; year?: number; doi?: string; url?: string; note?: string };
export type ReadingRoute = { id: string; title: string; intro: string; steps: string[] };
export const readYaml = <T>(name: string): T => parse(fs.readFileSync(`src/data/${name}.yaml`, 'utf8'));
export const readDecisions = () => readYaml<Decision[]>('editorial-decisions');
export const readWorks = () => readYaml<Work[]>('works');
export const readRoutes = () => readYaml<ReadingRoute[]>('routes');
export const includeDrafts = process.env.INCLUDE_DRAFTS === '1';
export const visible = (status: string) => status === 'published' || (includeDrafts && ['draft', 'review'].includes(status));
export function modulePath(m: Pick<Module, 'slug'>) { return `modules/${m.slug}/`; }
export function topicPath(m: Pick<Module, 'slug'>, t: Pick<Topic, 'slug'>) { return `${modulePath(m)}topics/${t.slug}/`; }
export function chapterPath(c: Chapter, modules: Module[]) {
  const m = modules.find(m => m.id === c.module);
  if (!m) throw new Error(`Unknown module ${c.module}`);
  return `${modulePath(m)}${c.slug}/`;
}
export function resolveRef(ref: string, section?: string): string {
  const m = readModules().find(m => m.data.id === ref)?.data;
  if (m) return visible(m.status) ? modulePath(m) + (section ? `#${section}` : '') : `program/#${ref}`;
  for (const group of ['foundations', 'theory'] as const) {
    const r = (group === 'foundations' ? readFoundations() : readTheory()).find(r => r.data.id === ref)?.data;
    if (r) return visible(r.status) ? `${group}/${r.slug}/${section ? `#${section}` : ''}` : 'program/';
  }
  const d = readDecisions().find(d => d.id === ref);
  if (d?.target) return resolveRef(d.target, d.section);
  if (d) return `program/#${ref}`;
  throw new Error(`Unknown reference ${ref}`);
}
export const moduleOrder = (a: Module, b: Module) => a.release_phase - b.release_phase || a.sort_order - b.sort_order;
