#!/usr/bin/env node
/**
 * Gate 1 of 3. Every content file must satisfy the schema before it can ship.
 * Broken agent output fails CI instead of reaching the site.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import yaml from 'js-yaml'

const ITEMS = 'content/items'
const schema = JSON.parse(readFileSync('content/schema/item.schema.json', 'utf8'))

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)

const errors = []
const ids = new Set()

for (const file of readdirSync(ITEMS).filter((f) => f.endsWith('.md'))) {
  const raw = readFileSync(join(ITEMS, file), 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    errors.push(`${file}: no front matter`)
    continue
  }

  let data
  try {
    data = yaml.load(match[1])
  } catch (e) {
    errors.push(`${file}: unparseable front matter — ${e.message}`)
    continue
  }

  if (!validate(data)) {
    for (const e of validate.errors) errors.push(`${file}${e.instancePath} ${e.message}`)
    continue
  }

  if (ids.has(data.id)) errors.push(`${file}: duplicate id "${data.id}"`)
  ids.add(data.id)
}

// Connections must resolve. A world drawing a link to nothing is a broken world.
for (const file of readdirSync(ITEMS).filter((f) => f.endsWith('.md'))) {
  const raw = readFileSync(join(ITEMS, file), 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) continue
  const data = yaml.load(match[1])
  for (const c of data?.spatial?.connections ?? []) {
    if (!ids.has(c)) errors.push(`${file}: connection "${c}" does not exist`)
  }
}

if (errors.length) {
  console.error('Content validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`Content OK — ${ids.size} items.`)
