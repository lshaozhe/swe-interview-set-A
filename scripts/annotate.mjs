// Generates the interviewer copy of app/: inserts one comment block per file listing the planted flaws,
// taken from interviewer/flaws.yaml. Idempotent: re-running replaces existing blocks.
// Usage: node scripts/annotate.mjs   (run from the repo root, on the interviewer-copy branch)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = YAML.parse(readFileSync(join(root, 'interviewer/flaws.yaml'), 'utf8'))
const START = 'INTERVIEWER-ANNOTATION-START'
const END = 'INTERVIEWER-ANNOTATION-END'

const byFile = new Map()
for (const f of manifest.flaws) {
  if (!byFile.has(f.file)) byFile.set(f.file, [])
  byFile.get(f.file).push(f)
}

const style = file => {
  const e = extname(file), b = basename(file)
  if (['.ts', '.tsx', '.js', '.mjs'].includes(e)) return 'slash'
  if (e === '.html') return 'html'
  if (b === 'package.json') return 'json'
  if (e === '.sql') return 'sql'
  return 'hash' // tf, yml, yaml, Dockerfile, .env
}

const lines = flaws => flaws.flatMap(f => [
  `[${f.id} · T${f.tier} · ${f.lens}] ${f.flaw}`,
  `    Look near: ${f.anchor}`,
])

function strip(text) {
  return text
    .replace(new RegExp(`(?:^[ \\t]*(?:\\/\\/|#|--)[^\\n]*${START}[\\s\\S]*?${END}[^\\n]*\\n)`, 'm'), '')
    .replace(new RegExp(`<!-- ${START}[\\s\\S]*?${END} -->\\n`), '')
    .replace(new RegExp(`^\\s*"//[A-Z-]*": ?\\[[\\s\\S]*?${END}[^\\]]*\\],?\\n`, 'm'), '')
}

let n = 0
for (const [file, flaws] of byFile) {
  const path = join(root, 'app', file)
  if (!existsSync(path)) { console.error('missing', file); process.exit(1) }
  let text = strip(readFileSync(path, 'utf8'))
  const st = style(file)
  const body = lines(flaws)
  let block
  if (st === 'slash') block = [`// ${START}`, ...body.map(l => `// ${l}`), `// ${END}`].join('\n') + '\n'
  else if (st === 'hash') block = [`# ${START}`, ...body.map(l => `# ${l}`), `# ${END}`].join('\n') + '\n'
  else if (st === 'sql') block = [`-- ${START}`, ...body.map(l => `-- ${l}`), `-- ${END}`].join('\n') + '\n'
  else if (st === 'html') block = `<!-- ${START}\n${body.join('\n')}\n${END} -->\n`
  else {
    const arr = [START, ...body, END].map(l => JSON.stringify(l)).join(',\n    ')
    text = text.replace(/^\{\n/, `{\n  "//INTERVIEWER": [\n    ${arr}\n  ],\n`)
    writeFileSync(path, text); n++; continue
  }
  // keep shebangs, Dockerfile syntax directives and html doctype first
  const m = text.match(/^(#!.*\n|# syntax=.*\n|<!doctype[^\n]*\n|<!DOCTYPE[^\n]*\n)/)
  text = m ? m[0] + block + text.slice(m[0].length) : block + text
  writeFileSync(path, text); n++
}
console.log(`Annotated ${n} files with ${manifest.flaws.length} flaws`)
