---
name: codegraph
description: Use the local CodeGraph to inspect only directly connected files and their exported interfaces before analyzing or changing code in this repository.
---

# CodeGraph workflow

1. Before analyzing or refactoring a source file, run `npm run graph:query -- src/path/to/file.js` with its repository-relative path.
2. The query reads `.opencode/graph.json` and prints only direct importers/dependencies, exports, and public function or class signatures. Use this compact result instead of opening the full graph JSON.
3. Open only the target and directly connected files needed for the task. Expand to another file only when the returned interface does not answer a concrete question.
4. If the graph is missing or stale, run `npm run graph:build`, then query again.
5. For several target files, query each target separately. Do not paste the whole graph into the conversation.
