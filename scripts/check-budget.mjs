#!/usr/bin/env node
/**
 * Gate 2 of 3. The performance budget is a build failure, not an intention.
 *
 * The rule that keeps a 3D site usable: the document route must paint without
 * downloading the 3D engine. If three/drei leak into the entry chunk, this
 * fails and someone has to look at why.
 */
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ASSETS = 'dist/assets'
const KB = 1024

const BUDGET = {
  entryJs: 180 * KB,   // document route, gzipped-ish raw ceiling
  worldJs: 900 * KB,   // three + drei chunk, loaded only on demand
  css: 40 * KB,
}

const files = readdirSync(ASSETS).map((f) => ({ name: f, size: statSync(join(ASSETS, f)).size }))

const entry = files.filter((f) => f.name.endsWith('.js') && !f.name.includes('three'))
const world = files.filter((f) => f.name.endsWith('.js') && f.name.includes('three'))
const css = files.filter((f) => f.name.endsWith('.css'))

const sum = (a) => a.reduce((t, f) => t + f.size, 0)
const fail = []

const check = (label, bytes, limit) => {
  const pct = Math.round((bytes / limit) * 100)
  console.log(`  ${label.padEnd(10)} ${(bytes / KB).toFixed(0).padStart(5)} KB / ${(limit / KB).toFixed(0)} KB  (${pct}%)`)
  if (bytes > limit) fail.push(`${label} over budget by ${((bytes - limit) / KB).toFixed(0)} KB`)
}

console.log('Performance budget:')
check('entry js', sum(entry), BUDGET.entryJs)
check('world js', sum(world), BUDGET.worldJs)
check('css', sum(css), BUDGET.css)

if (fail.length) {
  console.error('\nBudget exceeded:\n' + fail.map((f) => '  - ' + f).join('\n'))
  process.exit(1)
}
console.log('Within budget.')
