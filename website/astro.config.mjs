// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { OptionDefaults } from 'typedoc'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'

export default defineConfig({
  site: 'https://chunk-process.hidetaka.dev',
  integrations: [
    starlight({
      title: 'chunk-process',
      description: 'Chunked parallel async task runner for rate limiting and resource control',
      // English lives at the root (/), Japanese under /ja/.
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/hideokamoto/chunk-process' },
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/chunk-process' },
      ],
      editLink: {
        baseUrl: 'https://github.com/hideokamoto/chunk-process/edit/main/website/',
      },
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../libs/index.ts'],
          tsconfig: '../tsconfig.json',
          output: 'api',
          sidebar: { label: 'API Reference' },
          typeDoc: {
            gitRevision: 'main',
            entryFileName: 'index',
            // libs/index.ts uses @note in its TSDoc comments
            blockTags: [...OptionDefaults.blockTags, '@note'],
          },
        }),
      ],
      sidebar: [
        { label: 'Getting Started', translations: { ja: 'はじめに' }, slug: 'getting-started' },
        { label: 'Guides', translations: { ja: 'ガイド' }, items: [{ autogenerate: { directory: 'guides' } }] },
        typeDocSidebarGroup,
        { label: 'Releases', translations: { ja: 'リリース' }, slug: 'reference/releases' },
      ],
    }),
  ],
})
