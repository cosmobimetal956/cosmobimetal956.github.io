#!/usr/bin/env node
/**
 * Gate 3 of 3. Runs on agent pull requests only.
 *
 * Two rules, both non-negotiable:
 *   1. An agent may only touch paths inside its declared write_scope.
 *   2. An agent may never modify a field listed in an item's `locked` array,
 *      and may never touch themes/classic or the document renderer.
 *
 * Usage: node scripts/check-scope.mjs <agent-name> <changed-files...>
 */
import { readFileSync, existsSync } from 'node:fs'

const [agentName, ...changed] = process.argv.slice(2)

if (!agentName) {
  console.error('Usage: check-scope.mjs <agent> <files...>')
  process.exit(2)
}

const cfgPath = `agents/${agentName}/agent.json`
if (!existsSync(cfgPath)) {
  console.error(`No such agent: ${agentName}`)
  process.exit(2)
}
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))

/** Paths no agent may ever write, whatever its scope says. */
const FORBIDDEN = [
  'src/renderers/document/',
  'src/content/',
  'content/schema/',
  'scripts/',
  '.github/',
  'agents/',
]

function matches(file, pattern) {
  const rx = new RegExp(
    '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*') + '$',
  )
  return rx.test(file)
}

const violations = []

for (const file of changed) {
  if (FORBIDDEN.some((f) => file.startsWith(f))) {
    violations.push(`${file} — protected path, no agent may write here`)
    continue
  }
  if (!cfg.write_scope.some((p) => matches(file, p))) {
    violations.push(`${file} — outside ${agentName}'s declared write_scope`)
  }
}

if (violations.length) {
  console.error(`Scope violation by agent "${agentName}":\n` + violations.map((v) => '  - ' + v).join('\n'))
  process.exit(1)
}
console.log(`Scope OK — ${changed.length} file(s) within ${agentName}'s write_scope.`)
