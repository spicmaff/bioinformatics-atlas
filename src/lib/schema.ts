import { z } from 'zod';
import { branches } from '../data/branches';

export const statusSchema = z.enum(['planned', 'draft', 'review', 'published']);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const relation = z.object({ ref: z.string().min(1), section: slug.optional(), note: z.string().optional() }).strict();
export const sourceSchema = z.object({
  id: slug, work: z.string().min(1), locator: z.string().min(3),
  depth: z.enum(['explained', 'example', 'mentioned', 'external']),
}).strict();
const base = z.object({
  id: z.string().min(1), slug, title: z.string().min(3), status: statusSchema,
  prerequisites: z.array(relation), sources: z.array(sourceSchema).min(1),
  related: z.array(relation).default([]),
});
export const moduleSchema = base.extend({
  id: z.string().regex(/^[MK]\d{2}$/), title_en: z.string().optional(),
  branch: z.enum(branches.map(b => b.id) as [string, ...string[]]),
  role: z.enum(['core', 'advanced', 'adjacent']),
  question: z.string().min(8), summary: z.string().min(15), feature: z.string().min(15),
  methods: z.array(z.object({ name: z.string().min(1), sources: z.array(slug).min(1) }).strict()).min(1),
  release_phase: z.number().int().min(1).max(7), sort_order: z.number().int().nonnegative(),
  aliases: z.array(z.string()).default([]), tags: z.array(z.string()).default([]),
  planned_chapters: z.array(z.object({ slug, title: z.string().min(3) }).strict()).default([]),
}).strict();
export const chapterSchema = base.extend({
  id: z.string().regex(/^[MK]\d{2}-C\d{2,}$/), module: z.string().regex(/^[MK]\d{2}$/),
  summary: z.string().min(15), question: z.string().min(8), order: z.number().int().nonnegative(),
  experiment: z.string().optional(), estimated_minutes: z.number().int().positive().optional(),
}).strict();
export const referenceSchema = base.extend({ order: z.number().int().nonnegative(), summary: z.string().min(10) }).strict();
export type Module = z.infer<typeof moduleSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type Source = z.infer<typeof sourceSchema>;
