# Graph Report - evolving-api  (2026-08-13)

## Corpus Check
- 22 files · ~6,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 149 nodes · 234 edges · 17 communities (12 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `01d8e268`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Version Transform Adapters
- TypeScript Compiler Config
- Core App Infrastructure
- Package Configuration
- Task Storage Layer
- Dev Dependencies
- Package Keywords & References
- Build Configuration
- README Middleware Concepts
- README Core Concepts
- README Version Evolution
- README Transformation Design
- README Truth Architecture
- README Project Overview
- Serena Activation Config
- Serena Ignored Paths
- Serena Language Config

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 21 edges
2. `Env` - 8 edges
3. `V3Task` - 8 edges
4. `transformFromV3()` - 7 edges
5. `TaskStatus` - 7 edges
6. `keywords` - 6 edges
7. `scripts` - 5 edges
8. `hono` - 5 edges
9. `ApiVersion` - 5 edges
10. `transformArrayFromV3()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `V3CreateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  src/versions/v3/types.ts → src/versions/v2/types.ts
- `V3UpdateTaskRequest` --references--> `TaskStatus`  [EXTRACTED]
  src/versions/v3/types.ts → src/versions/v2/types.ts
- `jsonVersioned()` --calls--> `transformArrayFromV3()`  [EXTRACTED]
  src/utils/response.ts → src/versions/adapters.ts
- `jsonVersioned()` --calls--> `transformFromV3()`  [EXTRACTED]
  src/utils/response.ts → src/versions/adapters.ts
- `v1ToV3()` --calls--> `v1ToV2()`  [EXTRACTED]
  src/versions/adapters.ts → src/versions/v2/adapters.ts

## Import Cycles
- None detected.

## Communities (17 total, 5 thin omitted)

### Community 0 - "Version Transform Adapters"
Cohesion: 0.16
Nodes (23): transformResponse, jsonVersioned(), transformArrayFromV3(), transformFromV3(), transformToV3(), v1ToV3(), v3ToV1(), V1CreateTaskRequest (+15 more)

### Community 1 - "TypeScript Compiler Config"
Cohesion: 0.09
Nodes (23): ES2022, node, compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames (+15 more)

### Community 2 - "Core App Infrastructure"
Cohesion: 0.19
Nodes (14): app, logger, versionGate, clients, tasks, clients, getAllClients(), getClientById() (+6 more)

### Community 3 - "Package Configuration"
Cohesion: 0.11
Nodes (17): hono, @hono/node-server, author, dependencies, hono, @hono/node-server, description, license (+9 more)

### Community 4 - "Task Storage Layer"
Cohesion: 0.38
Nodes (8): createTask(), deleteTask(), generateId(), getAllTasks(), getTaskById(), seedTasks(), tasks, updateTask()

### Community 5 - "Dev Dependencies"
Cohesion: 0.29
Nodes (7): devDependencies, tsx, @types/node, typescript, tsx, @types/node, typescript

### Community 6 - "Package Keywords & References"
Cohesion: 0.33
Nodes (6): keywords, adapter-pattern, api, hono, typescript, versioning

### Community 7 - "Build Configuration"
Cohesion: 0.33
Nodes (5): dist, node_modules, src/**/*, exclude, include

### Community 8 - "README Middleware Concepts"
Cohesion: 0.40
Nodes (5): Client ID Requirement, Hono Framework, Middleware Chain, Version Detection Priority, Version Gate Middleware

### Community 9 - "README Core Concepts"
Cohesion: 0.67
Nodes (3): Backward Compatibility, Client-Locked Versions, Transformation Gates

### Community 10 - "README Version Evolution"
Cohesion: 0.50
Nodes (4): Task Management Domain, V1 - Simple Boolean Completion, V2 - Status Enhancement, V3 - Rich Metadata

### Community 14 - "Serena Activation Config"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **62 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `name`, `version`, `description` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `keywords` connect `Package Keywords & References` to `Package Configuration`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `hono` connect `Package Keywords & References` to `Version Transform Adapters`, `Core App Infrastructure`, `Task Storage Layer`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Configuration`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `name` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TypeScript Compiler Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Package Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._