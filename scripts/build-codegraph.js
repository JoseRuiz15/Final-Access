import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@babel/parser'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = path.join(ROOT, 'src')
const OUTPUT_PATH = path.join(ROOT, '.opencode', 'graph.json')
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.css'])
const RESOLVE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.css']

const toPosix = (value) => value.split(path.sep).join('/')

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)))
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath)
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

function extractVueBlocks(source) {
  const scripts = []
  const styles = []
  const blockPattern = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi
  let match

  while ((match = blockPattern.exec(source))) {
    const [, tag, attributes, content] = match
    const block = tag.toLowerCase() === 'script' ? scripts : styles
    const src = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]
    block.push({ content, src })
  }

  const selfClosingPattern = /<(script|style)\b([^>]*?)\/>/gi
  while ((match = selfClosingPattern.exec(source))) {
    const [, tag, attributes] = match
    const block = tag.toLowerCase() === 'script' ? scripts : styles
    const src = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]
    if (src) block.push({ content: '', src })
  }

  return { scripts, styles }
}

function collectPatternNames(pattern, names = []) {
  if (!pattern) return names
  if (pattern.type === 'Identifier') names.push(pattern.name)
  else if (pattern.type === 'RestElement') collectPatternNames(pattern.argument, names)
  else if (pattern.type === 'AssignmentPattern') collectPatternNames(pattern.left, names)
  else if (pattern.type === 'ArrayPattern') pattern.elements.forEach((item) => collectPatternNames(item, names))
  else if (pattern.type === 'ObjectPattern') {
    pattern.properties.forEach((property) => {
      if (property.type === 'RestElement') collectPatternNames(property.argument, names)
      else collectPatternNames(property.value, names)
    })
  }
  return names
}

function exportName(node) {
  if (!node) return ''
  return node.name ?? node.value ?? ''
}

function shortSignature(value) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 300)
}

function functionSignature(node, source, name, declarationKind = '') {
  const bodyStart = node.body?.start ?? node.end
  const header = source.slice(node.start, bodyStart).trim()
  if (declarationKind) return shortSignature(`${declarationKind} ${name} = ${header}`)
  return shortSignature(header)
}

function declarationSignature(node, source) {
  const bodyStart = node.body?.start ?? node.end
  return shortSignature(source.slice(node.start, bodyStart))
}

function declaredNames(declaration) {
  if (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') {
    return declaration.id ? [declaration.id.name] : []
  }
  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations.flatMap((item) => collectPatternNames(item.id))
  }
  if (['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'].includes(declaration.type)) {
    return declaration.id ? [declaration.id.name] : []
  }
  return []
}

function parseModuleCode(source, filePath, state) {
  const ast = parse(source, {
    sourceType: 'unambiguous',
    allowAwaitOutsideFunction: true,
    plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties', 'importAttributes'],
  })
  const exports = new Set(state.exports)
  const declarations = []
  const exportedLocals = new Set()

  function addDeclaration(declaration, isExported = false) {
    if (!declaration) return

    if (declaration.type === 'FunctionDeclaration' && declaration.id) {
      declarations.push({
        name: declaration.id.name,
        kind: 'function',
        signature: declarationSignature(declaration, source),
        node: declaration,
        exported: isExported,
      })
      if (isExported) exportedLocals.add(declaration.id.name)
      return
    }

    if (declaration.type === 'ClassDeclaration' && declaration.id) {
      const methods = (declaration.body?.body ?? [])
        .filter((member) => ['ClassMethod', 'ClassPrivateMethod'].includes(member.type))
        .map((member) => {
          const methodName = exportName(member.key) || 'anonymous'
          return {
            name: methodName,
            signature: declarationSignature(member, source),
            node: member,
          }
        })
      declarations.push({
        name: declaration.id.name,
        kind: 'class',
        signature: declarationSignature(declaration, source),
        node: declaration,
        methods,
        exported: isExported,
      })
      if (isExported) exportedLocals.add(declaration.id.name)
      return
    }

    if (declaration.type === 'VariableDeclaration') {
      for (const item of declaration.declarations) {
        const names = collectPatternNames(item.id)
        for (const name of names) {
          const initializer = item.init
          const fn = initializer && ['ArrowFunctionExpression', 'FunctionExpression'].includes(initializer.type)
          if (!fn) continue
          declarations.push({
            name,
            kind: 'function',
            signature: functionSignature(initializer, source, name, declaration.kind),
            node: initializer,
            exported: isExported,
          })
          if (isExported) exportedLocals.add(name)
        }
      }
    }
  }

  for (const statement of ast.program.body) {
    if (statement.type === 'ExportNamedDeclaration') {
      if (statement.declaration) {
        for (const name of declaredNames(statement.declaration)) {
          exports.add(name)
          exportedLocals.add(name)
        }
        addDeclaration(statement.declaration, true)
      }
      for (const specifier of statement.specifiers ?? []) {
        exports.add(exportName(specifier.exported))
        if (!statement.source) exportedLocals.add(exportName(specifier.local))
      }
      if (statement.source) {
        state.dependencies.push({
          specifier: statement.source.value,
          symbols: (statement.specifiers ?? []).map((specifier) => exportName(specifier.local)).filter(Boolean),
        })
      }
      continue
    }

    if (statement.type === 'ExportDefaultDeclaration') {
      exports.add('default')
      const declaration = statement.declaration
      if (['FunctionDeclaration', 'ClassDeclaration', 'VariableDeclaration'].includes(declaration.type)) {
        addDeclaration(declaration, true)
      } else if (['ArrowFunctionExpression', 'FunctionExpression'].includes(declaration.type)) {
        declarations.push({
          name: 'default',
          kind: 'function',
          signature: functionSignature(declaration, source, 'default'),
          node: declaration,
          exported: true,
        })
      }
      continue
    }

    if (statement.type === 'ExportAllDeclaration') {
      exports.add('*')
      state.dependencies.push({ specifier: statement.source.value, symbols: ['*'] })
      continue
    }

    if (statement.type === 'ImportDeclaration') {
      state.dependencies.push({
        specifier: statement.source.value,
        symbols: statement.specifiers.map((specifier) => {
          if (specifier.type === 'ImportDefaultSpecifier') return 'default'
          if (specifier.type === 'ImportNamespaceSpecifier') return '*'
          return exportName(specifier.imported)
        }),
      })
      continue
    }

    addDeclaration(statement)
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (node.type === 'ImportExpression' && node.source?.type === 'StringLiteral') {
      state.dependencies.push({ specifier: node.source.value, symbols: [] })
    } else if (
      node.type === 'CallExpression' &&
      node.callee?.type === 'Import' &&
      node.arguments?.[0]?.type === 'StringLiteral'
    ) {
      state.dependencies.push({ specifier: node.arguments[0].value, symbols: [] })
    } else if (
      node.type === 'CallExpression' &&
      node.callee?.type === 'Identifier' &&
      node.callee.name === 'require' &&
      node.arguments?.[0]?.type === 'StringLiteral'
    ) {
      state.dependencies.push({ specifier: node.arguments[0].value, symbols: [] })
    }

    for (const [key, value] of Object.entries(node)) {
      if (!['loc', 'start', 'end', 'tokens', 'comments', 'leadingComments', 'trailingComments', 'extra'].includes(key)) {
        walk(value)
      }
    }
  }

  walk(ast.program)
  state.exports = [...exports].filter(Boolean).sort()
  for (const declaration of declarations) {
    declaration.exported ||= exportedLocals.has(declaration.name)
  }
  state.declarations.push(...declarations)
}

function parseCssImports(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
  const imports = []
  const pattern = /@import\s+(?:url\()?\s*["']?([^"'\s)]+)["']?\s*\)?/gi
  let match
  while ((match = pattern.exec(withoutComments))) imports.push({ specifier: match[1], symbols: [] })
  return imports
}

function resolveIndexedImport(fromFile, specifier, indexedAbsolutePaths) {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0]
  let basePath

  if (cleanSpecifier.startsWith('@/')) {
    basePath = path.join(SRC_DIR, cleanSpecifier.slice(2))
  } else if (cleanSpecifier.startsWith('.')) {
    basePath = path.resolve(path.dirname(fromFile), cleanSpecifier)
  } else if (cleanSpecifier.startsWith('/src/')) {
    basePath = path.join(ROOT, cleanSpecifier.slice(1))
  } else {
    return null
  }

  const candidates = [basePath]
  if (!path.extname(basePath)) {
    candidates.push(...RESOLVE_EXTENSIONS.map((extension) => `${basePath}${extension}`))
    candidates.push(...RESOLVE_EXTENSIONS.map((extension) => path.join(basePath, `index${extension}`)))
  }

  return candidates.find((candidate) => indexedAbsolutePaths.has(path.resolve(candidate))) ?? null
}

function createDeclarationNodes(fileId, declarations, moduleNode) {
  const nodes = []

  for (const declaration of declarations) {
    const nodeId = `${fileId}#${declaration.name}`
    moduleNode.symbols.push({
      name: declaration.name,
      kind: declaration.kind,
      signature: declaration.signature,
      exported: declaration.exported,
      ...(declaration.methods?.length
        ? { methods: declaration.methods.map(({ name, signature }) => ({ name, signature })) }
        : {}),
    })
    nodes.push({
      id: nodeId,
      type: declaration.kind,
      name: declaration.name,
      exports: declaration.exported ? [declaration.name] : [],
      signature: declaration.signature,
      owner: fileId,
    })
    moduleNode._edges.push({ from: fileId, to: nodeId, relation: 'contains' })

    for (const method of declaration.methods ?? []) {
      const methodId = `${nodeId}.${method.name}`
      nodes.push({
        id: methodId,
        type: 'function',
        name: method.name,
        exports: [],
        signature: method.signature,
        owner: nodeId,
      })
      moduleNode._edges.push({ from: nodeId, to: methodId, relation: 'contains' })
    }
  }

  return nodes
}

async function main() {
  const absoluteFiles = await collectFiles(SRC_DIR)
  const indexedAbsolutePaths = new Set(absoluteFiles.map((file) => path.resolve(file)))
  const moduleRecords = []

  for (const absolutePath of absoluteFiles) {
    const fileId = toPosix(path.relative(ROOT, absolutePath))
    const source = await fs.readFile(absolutePath, 'utf8')
    const state = { exports: [], dependencies: [], declarations: [] }

    if (absolutePath.endsWith('.vue')) {
      const blocks = extractVueBlocks(source)
      for (const block of [...blocks.scripts, ...blocks.styles]) {
        if (block.src) state.dependencies.push({ specifier: block.src, symbols: [] })
      }
      for (const block of blocks.scripts) {
        if (block.content.trim()) parseModuleCode(block.content, fileId, state)
      }
      for (const block of blocks.styles) state.dependencies.push(...parseCssImports(block.content))
      if (!state.exports.includes('default')) state.exports.push('default')
    } else if (path.extname(absolutePath).toLowerCase() === '.css') {
      state.dependencies.push(...parseCssImports(source))
    } else {
      parseModuleCode(source, fileId, state)
    }

    moduleRecords.push({ absolutePath, fileId, state })
  }

  const nodes = []
  const edges = []
  const edgeMap = new Map()

  for (const { absolutePath, fileId, state } of moduleRecords) {
    const moduleNode = {
      id: fileId,
      type: 'module',
      exports: [...new Set(state.exports)].sort(),
      symbols: [],
      _edges: [],
    }
    const declarations = createDeclarationNodes(fileId, state.declarations, moduleNode)
    nodes.push(moduleNode, ...declarations)
    edges.push(...moduleNode._edges)

    for (const dependency of state.dependencies) {
      const targetPath = resolveIndexedImport(absolutePath, dependency.specifier, indexedAbsolutePaths)
      if (!targetPath) continue
      const to = toPosix(path.relative(ROOT, targetPath))
      const key = `${fileId}\0${to}\0imports`
      const existing = edgeMap.get(key)
      if (existing) {
        if (!existing.specifiers.includes(dependency.specifier)) existing.specifiers.push(dependency.specifier)
        for (const symbol of dependency.symbols) {
          if (!existing.symbols.includes(symbol)) existing.symbols.push(symbol)
        }
      } else {
        const edge = {
          from: fileId,
          to,
          relation: 'imports',
          specifiers: [dependency.specifier],
          symbols: [...new Set(dependency.symbols)].sort(),
        }
        edgeMap.set(key, edge)
      }
    }

    delete moduleNode._edges
  }

  edges.push(...edgeMap.values())
  nodes.sort((a, b) => a.id.localeCompare(b.id))
  edges.sort((a, b) => `${a.from}\0${a.to}\0${a.relation}`.localeCompare(`${b.from}\0${b.to}\0${b.relation}`))

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify({ nodes, edges }, null, 2)}\n`, 'utf8')
  console.log(`CodeGraph generado: ${path.relative(ROOT, OUTPUT_PATH)} (${nodes.length} nodos, ${edges.length} aristas)`)
}

main().catch((error) => {
  console.error(`No se pudo generar el CodeGraph: ${error.message}`)
  process.exitCode = 1
})
