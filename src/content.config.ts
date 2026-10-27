import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { moduleSchema, chapterSchema, referenceSchema } from './lib/schema';

const loader = (folder: string) => glob({ pattern: '**/*.mdx', base: `src/content/${folder}`, generateId: ({ data }) => String(data.id) });
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  modules: defineCollection({ loader: loader('modules'), schema: moduleSchema }),
  chapters: defineCollection({ loader: loader('chapters'), schema: chapterSchema }),
  foundations: defineCollection({ loader: loader('foundations'), schema: referenceSchema }),
  theory: defineCollection({ loader: loader('theory'), schema: referenceSchema }),
};
