// Fetch GitHub Releases and write them as Starlight pages under src/content/docs/releases/.
// Runs before `astro dev` / `astro build`. Set GITHUB_TOKEN to avoid the unauthenticated rate limit.
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env.GITHUB_REPOSITORY ?? 'hideokamoto/chunk-process'
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/docs/releases')

async function fetchReleases() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'chunk-process-website',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const releases = []
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`
    const res = await fetch(url, { headers })
    if (!res.ok) {
      throw new Error(`GitHub API responded ${res.status} ${res.statusText} for ${url}: ${await res.text()}`)
    }
    const items = await res.json()
    releases.push(...items)
    if (items.length < 100) break
  }
  return releases.filter((release) => !release.draft)
}

// Starlight slugifies file names and drops dots, so `v0.1.2` would become `v012`.
const toFileName = (tag) => `${tag.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}.md`

const formatDate = (iso) => iso.slice(0, 10)

// Release titles are user-provided text; a JSON string is a valid YAML scalar.
const yamlString = (value) => JSON.stringify(value)

function renderRelease(release, order) {
  const title = release.name?.trim() || release.tag_name
  const date = formatDate(release.published_at)
  const badge = release.prerelease ? '\n  badge:\n    text: Pre-release\n    variant: caution' : ''
  return `---
title: ${yamlString(title)}
description: ${yamlString(`Release notes for chunk-process ${release.tag_name} (${date})`)}
editUrl: false
sidebar:
  label: ${yamlString(release.tag_name)}
  order: ${order}${badge}
---

Released on ${date} · [View on GitHub](${release.html_url})

${release.body?.trim() || '_No release notes._'}
`
}

function renderIndex(releases) {
  const rows = releases
    .map((release) => {
      const slug = toFileName(release.tag_name).replace(/\.md$/, '')
      const title = (release.name?.trim() || release.tag_name).replaceAll('|', '\\|')
      return `| [${release.tag_name}](./${slug}/) | ${title} | ${formatDate(release.published_at)} |`
    })
    .join('\n')
  return `---
title: Releases
description: Release notes for chunk-process, imported from GitHub Releases.
editUrl: false
sidebar:
  label: All releases
  order: 0
---

These pages are generated from [GitHub Releases](https://github.com/${REPO}/releases) at build time.

| Version | Title | Date |
| --- | --- | --- |
${rows}
`
}

const releases = await fetchReleases()
releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })
await writeFile(path.join(OUT_DIR, 'index.md'), renderIndex(releases))
await Promise.all(
  releases.map((release, i) =>
    writeFile(path.join(OUT_DIR, toFileName(release.tag_name)), renderRelease(release, i + 1)),
  ),
)

console.log(`Wrote ${releases.length} release page(s) to ${path.relative(process.cwd(), OUT_DIR)}`)
