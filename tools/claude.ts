// Corre el Claude Code que trae Iridium con lo que se le pase (scripts.md › Cerrar la sesión de Claude).
// Uso: pnpm claude auth status · pnpm claude auth logout · pnpm claude auth login
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const requerir = createRequire(import.meta.url)
const sdk = requerir.resolve('@anthropic-ai/claude-agent-sdk')
const claude = createRequire(sdk).resolve(
  `@anthropic-ai/claude-agent-sdk-${process.platform}-${process.arch}/claude.exe`,
)
const r = spawnSync(claude, process.argv.slice(2), { stdio: 'inherit' })
process.exit(r.status ?? 1)
