import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import { readChapters, readModules, readFoundations, readTheory, visible, chapterPath, modulePath, includeDrafts } from './src/lib/content';

const modules = readModules().map(m => m.data);
const base = '/bioinformatics-atlas';
const link = (p: string) => `/${p}`;
const sidebar = [
  { label: 'Каталог методов', link: link('catalog/') },
  { label: 'Маршруты чтения', link: link('routes/') },
  { label: 'Основы', items: readFoundations().filter(e => visible(e.data.status)).map(e => ({ label: e.data.title, link: link(`foundations/${e.data.slug}/`) })) },
  ...modules.filter(m => visible(m.status)).map(m => ({ label: `${m.id} · ${m.title}`, items: [
    { label: 'О модуле', link: link(modulePath(m)) },
    ...readChapters().filter(c => c.data.module === m.id && visible(c.data.status)).sort((a,b) => a.data.order-b.data.order).map(c => ({ label: c.data.title, link: link(chapterPath(c.data, modules)) })),
  ] })),
  { label: 'Общая теория', items: readTheory().filter(e => visible(e.data.status)).map(e => ({ label: e.data.title, link: link(`theory/${e.data.slug}/`) })) },
  { label: 'Словарь', link: link('glossary/') },
  { label: 'Источники и воспроизводимость', link: link('sources/') },
];

export default defineConfig({
  site: 'https://spicmaff.github.io', base, trailingSlash: 'always', output: 'static',
  integrations: [
    { name: 'atlas-draft-guard', hooks: { 'astro:build:start': () => { if (includeDrafts) throw new Error('Production build forbids INCLUDE_DRAFTS. Use npm run dev:drafts.'); } } },
    starlight({
      title: 'Биоинформатика: методы и алгоритмы', description: 'Русскоязычный интерактивный атлас: от биологического вопроса к наблюдаемому вычислению.',
      defaultLocale: 'root', locales: { root: { label: 'Русский', lang: 'ru' } },
      sidebar, customCss: ['./src/styles/atlas.css'],
      components: { Header: './src/components/Header.astro', Footer: './src/components/Footer.astro' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/spicmaff/bioinformatics-atlas' }],
      expressiveCode: { themes: ['github-light'], styleOverrides: { borderRadius: '0.5rem' } },
      head: [{ tag: 'meta', attrs: { name: 'color-scheme', content: 'light' } }],
    }),
    react(),
  ],
  markdown: { processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml', strict: 'error' }]] }) },
  vite: { resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } } },
});
