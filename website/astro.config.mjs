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
        { label: 'Getting Started', slug: 'getting-started' },
        { label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
        typeDocSidebarGroup,
        { label: 'Releases', collapsed: true, items: [{ autogenerate: { directory: 'releases' } }] },
      ],
    }),
  ],
})
