import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import { readChapters, readModules, readFoundations, readTheory, visible, chapterPath, modulePath, topicPath, includeDrafts } from './src/lib/content';

const modules = readModules().map(m => m.data);
const base = '/bioinformatics-atlas';
const link = (p: string) => `/${p}`;
const sidebar = [
  { label: 'Все модули', link: link('catalog/') },
  { label: 'Маршруты чтения', link: link('routes/') },
  { label: 'Основы', items: readFoundations().filter(e => visible(e.data.status)).map(e => ({ label: e.data.title, link: link(`foundations/${e.data.slug}/`) })) },
  ...modules.filter(m => visible(m.status)).map(m => ({ label: `${m.id} · ${m.title}`, items: [
    { label: 'О модуле', link: link(modulePath(m)) },
    ...m.topics.filter(t=>visible(t.status)).sort((a,b)=>a.order-b.order).map(t=>({label:t.title,items:[
      {label:'Алгоритмы темы',link:link(topicPath(m,t))},
      ...readChapters().filter(c=>c.data.module===m.id&&c.data.topic===t.id&&visible(c.data.status)).sort((a,b)=>a.data.order-b.data.order).map(c=>({label:c.data.title,link:link(chapterPath(c.data,modules))})),
    ]})),
    ...readChapters().filter(c => c.data.module === m.id && !c.data.topic && visible(c.data.status)).sort((a,b) => a.data.order-b.data.order).map(c => ({ label: c.data.title, link: link(chapterPath(c.data, modules)) })),
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
      sidebar, customCss: ['./src/styles/atlas.css','./src/styles/night.css','./src/styles/science.css'],
      components: { Header: './src/components/Header.astro', Footer: './src/components/Footer.astro', PageTitle: './src/components/PageTitle.astro' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/spicmaff/bioinformatics-atlas' }],
      expressiveCode: { themes: ['github-dark'], styleOverrides: { borderRadius: '0' } },
      head: [{ tag: 'meta', attrs: { name: 'color-scheme', content: 'dark' } }],
    }),
    react(),
  ],
  markdown: { processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml', strict: 'error' }]] }) },
  vite: { resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } } },
});
