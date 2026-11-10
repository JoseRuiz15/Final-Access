import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GRAPH_PATH = path.join(ROOT, '.opencode', 'graph.json')

function normalizeTarget(value) {
  let target = value.trim().replaceAll('\\', '/').replace(/^\.\//, '')
  if (path.isAbsolute(value)) target = path.relative(ROOT, value).replaceAll('\\', '/')
  if (!target.startsWith('src/')) target = `src/${target}`
  return target.split('#', 1)[0]
}

function describeModule(module, relation) {
  const direction = relation.directions.join(' and ')
  console.log(`\n${module.id} (${direction})`)
  for (const edge of relation.edges) {
    const uses = edge.symbols?.length ? `; symbols: ${edge.symbols.join(', ')}` : ''
    const via = edge.specifiers?.length ? `; via: ${edge.specifiers.join(', ')}` : ''
    console.log(`  ${edge.from === module.id ? 'imports' : 'imported by'}${uses}${via}`)
  }

  console.log(`  exports: ${module.exports.length ? module.exports.join(', ') : '(none)'}`)
  const publicSymbols = (module.symbols ?? []).filter((symbol) => symbol.exported)
  const displayed = publicSymbols.slice(0, 12)
  for (const symbol of displayed) {
    console.log(`  ${symbol.kind}: ${symbol.signature}`)
    for (const method of (symbol.methods ?? []).slice(0, 8)) {
      console.log(`    ${method.signature}`)
    }
    if ((symbol.methods ?? []).length > 8) console.log('    … more methods omitted')
  }
  if (publicSymbols.length > displayed.length) console.log('  … more exported signatures omitted')
}

async function main() {
  const requested = process.argv[2]
  if (!requested || ['--help', '-h'].includes(requested)) {
    console.log('Uso: npm run graph:query -- src/ruta/al/archivo.js')
    process.exitCode = requested ? 0 : 1
    return
  }

  let graph
  try {
    graph = JSON.parse(await fs.readFile(GRAPH_PATH, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('No existe .opencode/graph.json. Créalo primero con npm run graph:build.')
    }
    throw error
  }

  const target = normalizeTarget(requested)
  const targetModule = graph.nodes.find((node) => node.type === 'module' && node.id === target)
  if (!targetModule) throw new Error(`No se encontró el módulo ${target} en el CodeGraph.`)

  const connected = new Map()
  for (const edge of graph.edges) {
    if (edge.relation !== 'imports') continue
    let relatedId
    if (edge.from === target) relatedId = edge.to
    else if (edge.to === target) relatedId = edge.from
    else continue

    const relation = connected.get(relatedId) ?? { directions: [], edges: [] }
    const direction = edge.from === target ? 'dependency' : 'dependent'
    if (!relation.directions.includes(direction)) relation.directions.push(direction)
    relation.edges.push(edge)
    connected.set(relatedId, relation)
  }

  console.log(`CodeGraph: ${target}`)
  if (!connected.size) {
    console.log('Sin dependencias o dependientes directos en src/.')
    return
  }
  console.log(`Archivos conectados directamente: ${connected.size}`)

  for (const [moduleId, relation] of [...connected.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const module = graph.nodes.find((node) => node.type === 'module' && node.id === moduleId)
    if (module) describeModule(module, relation)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
