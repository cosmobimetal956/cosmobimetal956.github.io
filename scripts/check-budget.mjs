#!/usr/bin/env node
/**
 * Gate 2 of 3. Measured GZIPPED, because that is what a visitor on a train
 * actually downloads. Raw byte counts flatter nothing and mislead everything.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const ASSETS = 'dist/assets'
const KB = 1024

const BUDGET = {
  entry: 60 * KB,   // document route — must stay small
  world: 320 * KB,  // three + drei, loaded on demand only
  css: 15 * KB,
}

const gz = (file) => gzipSync(readFileSync(join(ASSETS, file)), { level: 9 }).length

const files = readdirSync(ASSETS)
const js = files.filter((f) => f.endsWith('.js'))
const isWorld = (f) => f.includes('three')

const groups = {
  entry: js.filter((f) => !isWorld(f)),
  world: js.filter(isWorld),
  css: files.filter((f) => f.endsWith('.css')),
}

const fail = []
console.log('Performance budget (gzipped):')

for (const [name, list] of Object.entries(groups)) {
  const bytes = list.reduce((t, f) => t + gz(f), 0)
  const limit = BUDGET[name]
  const pct = Math.round((bytes / limit) * 100)
  const flag = bytes > limit ? 'FAIL' : 'ok'
  console.log(
    `  ${name.padEnd(6)} ${(bytes / KB).toFixed(1).padStart(7)} KB / ${(limit / KB).toFixed(0).padStart(3)} KB  ${String(pct).padStart(3)}%  ${flag}`,
  )
  if (bytes > limit) fail.push(`${name} over by ${((bytes - limit) / KB).toFixed(1)} KB gzipped`)
}

if (fail.length) {
  console.error('\nBudget exceeded:\n' + fail.map((f) => '  - ' + f).join('\n'))
  process.exit(1)
}
console.log('Within budget.')
