#!/usr/bin/env node
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

/** Recursively turn Date objects back into YYYY-MM-DD strings. */
function normalise(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (Array.isArray(value)) return value.map(normalise)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalise(v)]))
  }
  return value
}

const errors = []
const parsed = []

// Pass 1: parse everything, collect ids unconditionally
for (const file of readdirSync(ITEMS).filter((f) => f.endsWith('.md'))) {
  const raw = readFileSync(join(ITEMS, file), 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    errors.push(`${file}: no front matter`)
    continue
  }
  try {
    parsed.push({ file, data: normalise(yaml.load(match[1])) })
  } catch (e) {
    errors.push(`${file}: unparseable front matter — ${e.message}`)
  }
}

const ids = new Set()
for (const { file, data } of parsed) {
  if (!data?.id) { errors.push(`${file}: missing id`); continue }
  if (ids.has(data.id)) errors.push(`${file}: duplicate id "${data.id}"`)
  ids.add(data.id)
}

// Pass 2: schema
for (const { file, data } of parsed) {
  if (!validate(data)) {
    for (const e of validate.errors) errors.push(`${file}${e.instancePath} ${e.message}`)
  }
}

// Pass 3: connections resolve
for (const { file, data } of parsed) {
  for (const c of data?.spatial?.connections ?? []) {
    if (!ids.has(c)) errors.push(`${file}: connection "${c}" does not exist`)
  }
}

if (errors.length) {
  console.error('Content validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`Content OK — ${ids.size} items.`)
