const fs = require('fs')
const path = require('path')
const vm = require('vm')

const filePath = path.resolve(__dirname, '..', 'admin-panel.html')
const html = fs.readFileSync(filePath, 'utf8')

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i)
if (!scriptMatch) {
  console.error('No <script> block found.')
  process.exit(1)
}

const js = scriptMatch[1]

try {
  new vm.Script(js, { filename: 'admin-panel.js' })
  console.log('Parse OK: no syntax errors detected.')
} catch (err) {
  console.error('Syntax error detected:')
  console.error(err.message)
  if (err.stack) {
    console.error('\nStack:')
    console.error(err.stack)
  }
  // Try to show nearby lines for context
  const lines = js.split(/\r?\n/)
  const line = err.lineNumber || err.line || 0
  const start = Math.max(0, line - 3)
  const end = Math.min(lines.length, line + 2)
  console.error(`\nContext (lines ${start + 1}-${end}):`)
  for (let i = start; i < end; i++) {
    const prefix = i + 1 === line ? '>' : ' '
    console.error(`${prefix} ${String(i + 1).padStart(4, ' ')} | ${lines[i]}`)
  }
  process.exit(2)
}
