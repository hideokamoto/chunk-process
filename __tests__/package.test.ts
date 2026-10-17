import { build } from 'vite'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(__dirname, '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const entry = pkg.exports['.']
const abs = (p: string) => resolve(root, p)

describe('package entry points', () => {
  beforeAll(async () => {
    await build({ root, logLevel: 'silent' })
  }, 60_000)

  it.each([
    ['main', pkg.main],
    ['module', pkg.module],
    ['types', pkg.types],
    ['exports.types', entry.types],
    ['exports.import', entry.import],
    ['exports.require', entry.require]
  ])('%s points to an existing file', (_name, path: string) => {
    expect(existsSync(abs(path))).toBe(true)
  })

  it('main and exports.require point to the same CJS file', () => {
    expect(abs(pkg.main)).toBe(abs(entry.require))
  })

  it('module and exports.import point to the same ESM file', () => {
    expect(abs(pkg.module)).toBe(abs(entry.import))
  })

  it('require() resolves the package as CJS', () => {
    const out = execFileSync(
      process.execPath,
      ['-e', "const m=require(process.argv[1]);console.log(typeof m.arrayBatch,typeof m.batchProcess)", abs(entry.require)],
      { encoding: 'utf8' }
    )
    expect(out.trim()).toBe('function function')
  })

  it('import resolves the package as ESM', () => {
    const out = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', "const m=await import(process.argv[1]);console.log(typeof m.arrayBatch,typeof m.batchProcess,typeof m.default)", abs(entry.import)],
      { encoding: 'utf8' }
    )
    expect(out.trim()).toBe('function function function')
  })
})
