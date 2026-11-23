// Generates interviewer/PROBES.md (print-friendly probe sheet) from flaws.yaml.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const m = YAML.parse(readFileSync(join(root, 'interviewer/flaws.yaml'), 'utf8'))
const tierName = { 1: 'T1 · spot it and explain the impact (S1)', 2: 'T2 · fix it and explain why it matters in production (S2)', 3: 'T3 · failure modes and trade-offs (S3)' }

let out = `# Probe sheet (generated from flaws.yaml; do not edit by hand)\n\nInterviewer only. Pick 3 to 4 skills. Start with the open prompt in the guide, then use these only if the conversation gets there. Ladder each probe: *what do you notice* → *why does it matter in production* → *how would you fix and prove it* → *what breaks if…*\n`
for (const [d, name] of Object.entries(m.domains)) {
  out += `\n---\n\n## ${d} · ${name}\n`
  for (const t of [1, 2, 3]) {
    const items = m.flaws.filter(f => f.domain === d && f.tier === t)
    if (!items.length) continue
    out += `\n### ${tierName[t]}\n`
    for (const f of items) {
      out += `\n**${f.id}** · \`${f.file}\` · *${f.lens}*${f.proof ? ' · proof test' : ''}${f.chain ? ` · chain: ${f.chain}` : ''}\n`
      out += `- Flaw: ${f.flaw}\n- Ask: "${f.probe}"\n- Strong answer: ${f.strong}\n- To move up: ${f.grow}\n`
    }
  }
}
writeFileSync(join(root, 'interviewer/PROBES.md'), out)
console.log('Wrote interviewer/PROBES.md')
