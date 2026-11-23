// Checks interviewer/flaws.yaml against the app so the answer key cannot drift.
//  - every flaw has the required fields, a valid domain/tier, and a unique id
//  - the file exists and the anchor text is still present in it
//  - every proof test id exists in the manifest, and every `proof:` points at a real test
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = YAML.parse(readFileSync(join(root, 'interviewer/flaws.yaml'), 'utf8'))
const domains = manifest.domains
const flaws = manifest.flaws
const required = ['id', 'domain', 'tier', 'lens', 'file', 'anchor', 'flaw', 'probe', 'strong', 'grow']
const errors = []
const stripAnnotation = t => t.replace(/[^\n]*INTERVIEWER-ANNOTATION-START[\s\S]*?INTERVIEWER-ANNOTATION-END[^\n]*\n/, '')
const ids = new Set()

for (const f of flaws) {
  for (const k of required) if (f[k] === undefined || f[k] === '') errors.push(`${f.id ?? '?'}: missing "${k}"`)
  if (ids.has(f.id)) errors.push(`${f.id}: duplicate id`)
  ids.add(f.id)
  if (!domains[f.domain]) errors.push(`${f.id}: unknown domain ${f.domain}`)
  if (!f.id?.startsWith(`${f.domain}-`)) errors.push(`${f.id}: id does not start with domain ${f.domain}`)
  if (![1, 2, 3].includes(f.tier)) errors.push(`${f.id}: tier must be 1, 2 or 3`)
  const path = join(root, 'app', f.file)
  if (!existsSync(path)) errors.push(`${f.id}: file not found: app/${f.file}`)
  else if (!stripAnnotation(readFileSync(path, 'utf8')).includes(f.anchor)) errors.push(`${f.id}: anchor not found in ${f.file}: ${f.anchor}`)
}

const proofDir = join(root, 'interviewer/proofs')
const proofText = readdirSync(proofDir).filter(n => n.endsWith('.test.ts')).map(n => readFileSync(join(proofDir, n), 'utf8')).join('\n')
const proofIds = new Set([...proofText.matchAll(/it\('([A-Z]+-\d+)/g)].map(m => m[1]))
for (const f of flaws) if (f.proof && !proofIds.has(f.id)) errors.push(`${f.id}: marked proof but no proof test named ${f.id}`)
for (const id of proofIds) if (!ids.has(id)) errors.push(`proof ${id}: no such flaw in manifest`)
for (const f of flaws) if (!f.proof && proofIds.has(f.id)) errors.push(`${f.id}: has a proof test but proof: true is missing`)

console.log('Coverage (flaws per domain and tier):')
console.log('domain'.padEnd(34), 'T1  T2  T3  total  proofs')
for (const [d, name] of Object.entries(domains)) {
  const mine = flaws.filter(f => f.domain === d)
  const t = n => String(mine.filter(f => f.tier === n).length).padEnd(3)
  console.log(`${d} ${name}`.padEnd(34), t(1), t(2), t(3), String(mine.length).padEnd(6), mine.filter(f => f.proof).length)
}
const lenses = {}
for (const f of flaws) lenses[f.lens] = (lenses[f.lens] ?? 0) + 1
console.log('\nLenses:', Object.entries(lenses).map(([k, v]) => `${k} ${v}`).join(' · '))
console.log(`Total: ${flaws.length} flaws, ${proofIds.size} proofs`)

if (errors.length) {
  console.error('\nProblems:\n - ' + errors.join('\n - '))
  process.exit(1)
}
console.log('\nManifest OK')
