# Стек и совместимость

Проверено 27 октября 2026 по официальной документации и метаданным npm. Установлены стабильные версии: Astro 7.4.2, Starlight 0.42.7, @astrojs/mdx 8.1.1, @astrojs/react 7.1.1, React/React DOM 19.3.1. Точные остальные зависимости — package.json, транзитивные — package-lock.json.

Starlight 0.42.7 и MDX 8.1.1 объявляют peer Astro ^7.2.10; установленный 7.4.2 удовлетворяет диапазону. React-интеграция поддерживает React ^19, react-dom и соответствующие типы; npm разрешил peer без legacy-peer-deps. Astro требует Node >=22.23.4; проект использует проверенную Node 24.22.1 и ограничен веткой 24.

Astro 7 использует отдельные Markdown processors. Для remark-math/rehype-katex настроен `markdown.processor: unified(...)` из @astrojs/markdown-remark. Starlight подключает MDX; повторная MDX-интеграция не добавляется. React гидратируется только на страницах каталога и эксперимента. Контент описан стандартными Astro content collections + Zod, статические маршруты создаются через getStaticPaths; StarlightPage обеспечивает общую навигацию и Pagefind-обвязку.

Официальные источники:

- https://docs.astro.build/en/install-and-setup/ — поддерживаемая Node и установка.
- https://starlight.astro.build/getting-started/ — установка Starlight.
- https://starlight.astro.build/guides/pages/ — MDX и StarlightPage для собственных коллекций.
- https://docs.astro.build/en/guides/integrations-guide/react/ — React и client directives.
- https://docs.astro.build/en/guides/integrations-guide/mdx/ — MDX.
- https://docs.astro.build/en/guides/markdown-content/ — Markdown processors.
- https://docs.astro.build/en/guides/content-collections/ — collections, схемы, render.
- https://docs.astro.build/en/guides/deploy/github/ — site/base и GitHub Pages.
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages — artifacts, OIDC и Pages permissions.
- https://katex.org/docs/options — HTML+MathML.
- https://github.com/IBM/plex — IBM Plex и OFL.

Формат предрасчёта показан на детерминированном маленьком примере. Он не является реализованным тяжёлым workflow или универсальным replay-компонентом. Worker/WASM и внешние сервисы пока не требуются.
