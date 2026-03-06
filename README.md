<div align="center">

# Evolving API Version System

**API versioning without forced client upgrades—transformation gates adapt responses to each client's registered version**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Hono](https://img.shields.io/badge/Hono-4.0-orange?style=for-the-badge&logo=hono)](https://hono.dev/)

</div>

---

<details>
<summary>📑 Table of Contents</summary>

- [Concept](#-concept)
- [Benefits](#benefits)
- [Domain: Task Management](#-domain-task-management)
  - [Version Evolution](#version-evolution)
- [Architecture](#️-architecture)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Version Detection & Authentication](#-version-detection--authentication)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Key Design Decisions](#-key-design-decisions)
- [Built With](#%EF%B8%8F-built-with)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Learn More](#-learn-more)

</details>

---

## 🎯 Concept

Traditional API versioning often forces clients to upgrade when breaking changes occur. This project demonstrates an alternative approach:

- **Client-Locked Versions**: Each client "registers" with a specific API version when they start using the service
- **Transformation Gates**: A middleware layer transparently transforms data between versions
- **Single Source of Truth**: The application internally uses the latest version (V3)
- **Backward Compatibility**: Clients never need to upgrade unless they want new features

### Benefits

✅ **No Forced Upgrades**: Clients keep working with their original API contract  
✅ **Gradual Migration**: Clients upgrade when ready, not when the provider demands it  
✅ **Single Codebase**: All business logic uses the latest version internally  
✅ **Type Safety**: TypeScript ensures transformations are correct  
✅ **Transparent**: Clients don't know transformation is happening  

---

## 📚 Domain: Task Management

The example uses a simple task management API with three evolving versions:

### Version Evolution

#### **V1 - Simple Boolean Completion**
```typescript
{
  id: string
  title: string
  completed: boolean        // Simple true/false
  createdAt: string
}
```

**Use Case**: Basic task tracking with done/not done toggle

---

#### **V2 - Status Enhancement** ⚠️ Breaking Change
```typescript
{
  id: string
  title: string
  status: "todo" | "in_progress" | "done"  // ← Replaced 'completed'
  dueDate: string | null                    // ← New optional field
  createdAt: string
}
```

**Breaking Change**: `completed` boolean replaced with richer `status` enum  
**Transformation**:
- V1→V2: `completed=false` → `status="todo"`, `completed=true` → `status="done"`
- V2→V1: `status="todo"|"in_progress"` → `completed=false`, `status="done"` → `completed=true`

---

#### **V3 - Rich Metadata** ✨ Feature Addition
```typescript
{
  id: string
  title: string
  status: "todo" | "in_progress" | "done"
  dueDate: string | null
  priority: number          // ← New: 1 (low) to 5 (high)
  tags: string[]            // ← New: categorization
  createdAt: string
}
```

**New Features**: Priority levels and tag categorization  
**Transformation**:
- V2→V3: Add `priority=3` (medium), `tags=[]` as defaults
- V3→V2: Strip `priority` and `tags` fields

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Uses V1)  │
└──────┬──────┘
       │ Request: { completed: false }
       ▼
┌─────────────────────────────────────┐
│      Version Gate Middleware        │
│  Detects: X-API-Version or Client   │
│  Sets context: apiVersion = 'v1'    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Request Transformation         │
│  Transforms V1 → V3 for processing  │
│  { completed: false } →             │
│  { status: 'todo', priority: 3 }    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Route Handler (V3 Logic)       │
│  All business logic uses V3         │
│  Single source of truth             │
└──────────────┬──────────────────────┘
               │ V3 Response
               ▼
┌─────────────────────────────────────┐
│    Response Transformation          │
│  Transforms V3 → V1 for client      │
│  { status: 'todo', priority: 3 } →  │
│  { completed: false }               │
└──────────────┬──────────────────────┘
               │
               ▼
       Response: { completed: false }
┌─────────────┐
│   Client    │
│  (Sees V1)  │
└─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/evolving-api.git
cd evolving-api

# Install dependencies
npm install

# Start development server
npm run dev
```

The server starts on `http://localhost:3000`

### Quick Test

Once the server is running, test the version system with the pre-seeded demo clients:

```bash
# See the same data in different versions
curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v1-demo"  # V1 format (completed boolean)
curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v2-demo"  # V2 format (status enum)
curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v3-demo"  # V3 format (full metadata)
```

You should see the same tasks transformed into different formats! 🎉

---

## 📝 API Endpoints

### Client Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clients/register` | Register a client with a specific API version |
| GET | `/api/clients` | List all registered clients |
| GET | `/api/clients/:clientId` | Get client information |
| PUT | `/api/clients/:clientId/version` | Update client's API version (migration) |

### Task Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task (partial update) |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## 🔧 Version Detection & Authentication

### Client ID Requirement

**🔒 X-Client-Id header is MANDATORY for all API calls** (except registration and listing clients).

This ensures:
- ✅ All clients are properly registered and tracked
- ✅ Version consistency per client
- ✅ No anonymous/untracked API usage
- ✅ Better monitoring and analytics

### Version Detection Priority

1. **Explicit Header** (for testing/debugging)
   ```bash
   X-API-Version: v1
   X-Client-Id: your-client-id
   ```
   Temporarily override your registered version (useful for testing upgrades)

2. **Client Registry** (primary method)
   ```bash
   X-Client-Id: your-client-id
   ```
   Automatically uses the version you registered with

### Endpoints Without X-Client-Id Required

- `GET /` - Welcome/documentation
- `POST /api/clients/register` - Register new client
- `GET /api/clients` - List clients (demo/admin)

---

## 💡 Usage Examples

### Example 1: Register and Use as V1 Client

```bash
# 1. Register as V1 client
curl -X POST http://localhost:3000/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{"clientId": "mobile-app-v1", "version": "v1"}'

# 2. Create a task using V1 format (completed boolean)
# X-Client-Id is REQUIRED for all task operations
curl -X POST http://localhost:3000/api/tasks \
  -H "X-Client-Id: mobile-app-v1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy to production", "completed": false}'

# Response (V1 format):
# {
#   "id": "task-4",
#   "title": "Deploy to production",
#   "completed": false,
#   "createdAt": "2026-02-16T10:30:00.000Z"
# }

# 3. List tasks - automatically transformed to V1
curl http://localhost:3000/api/tasks \
  -H "X-Client-Id: mobile-app-v1"
```

### Example 2: Same Task, Different Versions

```bash
# Create task as V3 client with full metadata
curl -X POST http://localhost:3000/api/tasks \
  -H "X-Client-Id: client-v3-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write documentation",
    "status": "done",
    "priority": 5,
    "tags": ["docs", "important"]
  }'

# Returns task ID: task-4 (or similar)

# Now read the SAME task with different clients to see version transformation:

# As V1 client - sees boolean
curl http://localhost:3000/api/tasks/task-4 -H "X-Client-Id: client-v1-demo"
# { "id": "task-4", "title": "Write documentation", "completed": true, ... }

# As V2 client - sees status enum (no priority/tags)
curl http://localhost:3000/api/tasks/task-4 -H "X-Client-Id: client-v2-demo"
# { "id": "task-4", "title": "Write documentation", "status": "done", ... }

# As V3 client - sees everything
curl http://localhost:3000/api/tasks/task-4 -H "X-Client-Id: client-v3-demo"
# { "id": "task-4", "title": "Write documentation", "status": "done", 
#   "priority": 5, "tags": ["docs", "important"], ... }

# You can also override temporarily for testing with X-API-Version:
curl http://localhost:3000/api/tasks/task-4 \
  -H "X-Client-Id: client-v1-demo" \
  -H "X-API-Version: v3"
# Temporarily see v3 format even though client is registered as v1
```

### Example 3: Client Migration

```bash
# Client decides to upgrade from V1 to V2
curl -X PUT http://localhost:3000/api/clients/mobile-app-v1/version \
  -H "Content-Type: application/json" \
  -d '{"version": "v2"}'

# Now all requests from this client automatically use V2 format
curl http://localhost:3000/api/tasks \
  -H "X-Client-Id: mobile-app-v1"
  
# Tasks now show status enum instead of completed boolean
```

---

## 🧪 Testing

### Pre-seeded Data

The server starts with:
- **3 clients**: `client-v1-demo`, `client-v2-demo`, `client-v3-demo`
- **3 tasks**: Various states demonstrating the version system

### Try It Out

```bash
# 1. See all versions of the same data (using pre-seeded clients)
curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v1-demo"
curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v2-demo"
curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v3-demo"

# 2. Create from V1, read from V3
curl -X POST http://localhost:3000/api/tasks \
  -H "X-Client-Id: client-v1-demo" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "completed": true}'

curl http://localhost:3000/api/tasks -H "X-Client-Id: client-v3-demo"
# Should see the task with status="done", priority=3, tags=[]
```

See [examples/requests.http](examples/requests.http) for comprehensive test scenarios.

---

## 📁 Project Structure

```
evolving-api/
├── src/
│   ├── index.ts                    # Main application entry
│   ├── types/
│   │   └── shared.ts               # Common types (ApiVersion, ClientVersion)
│   ├── versions/
│   │   ├── v1/
│   │   │   └── types.ts            # V1Task (completed boolean)
│   │   ├── v2/
│   │   │   ├── types.ts            # V2Task (status enum)
│   │   │   └── adapters.ts         # V1↔V2 transformations
│   │   ├── v3/
│   │   │   ├── types.ts            # V3Task (priority, tags)
│   │   │   └── adapters.ts         # V2↔V3 transformations
│   │   └── adapters.ts             # Composite transformations
│   ├── middleware/
│   │   ├── version-gate.ts         # Version detection
│   │   ├── transform.ts            # Response transformation
│   │   └── logger.ts               # Request logging
│   ├── routes/
│   │   ├── tasks.ts                # Task CRUD handlers
│   │   └── clients.ts              # Client registration handlers
│   └── store/
│       ├── tasks.ts                # In-memory task storage
│       └── clients.ts              # In-memory client registry
├── examples/
│   └── requests.http               # Example HTTP requests
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎓 Key Design Decisions

### 1. **Internal Storage Uses V3 (Latest)**

All data is stored in V3 format. Transformations only happen at API boundaries (request/response). This ensures:
- Single source of truth
- No data duplication
- Easier to add new versions (only need new adapters)

### 2. **Bidirectional Transformations**

Each version has adapters that can transform both directions:
- Upward: V1→V2→V3 (for incoming requests)
- Downward: V3→V2→V1 (for outgoing responses)

### 3. **Type-Safe Transformations**

TypeScript ensures transformations are correct:
```typescript
export const v3ToV1 = (task: V3Task): V1Task => {
  return {
    id: task.id,
    title: task.title,
    completed: task.status === 'done',  // type-safe mapping
    createdAt: task.createdAt,
  };
};
```

### 4. **Middleware Chain**

```
Request → Logger → Version Gate → Route Handler → Transform → Response
```

- **Logger**: Logs all requests with version info
- **Version Gate**: Detects and sets API version
- **Route Handler**: Processes using V3 logic
- **Transform**: Converts V3 response to client's version

### 5. **No Authentication**

This is a demo. In production, you'd:
- Use proper authentication (JWT, OAuth)
- Store client versions in a real database
- Implement rate limiting per client
- Add API key validation

---

## �️ Built With

This project leverages modern TypeScript tooling and a lightweight web framework:

- **[Hono](https://hono.dev/)** - Ultrafast web framework for the edge (4.0+)
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript (5.3+)
- **[Node.js](https://nodejs.org/)** - JavaScript runtime (18+)
- **[@hono/node-server](https://www.npmjs.com/package/@hono/node-server)** - Node.js adapter for Hono
- **[tsx](https://www.npmjs.com/package/tsx)** - TypeScript execution and REPL

---

## �🔮 Future Enhancements

- [ ] **Version Deprecation Warnings**: Add `X-Deprecated: true` header to V1 responses
- [ ] **Metrics**: Track version usage to inform deprecation decisions
- [ ] **Version Negotiation**: Allow clients to send preferred version list
- [ ] **Webhook Versioning**: Apply same pattern to webhook payloads
- [ ] **GraphQL Adapter**: Demonstrate versioning with GraphQL instead of REST
- [ ] **Database Persistence**: Replace in-memory stores with real database
- [ ] **Migration Assistant**: Tool to help clients upgrade between versions

---

## 📖 Learn More

### Related Patterns

- **API Gateway Pattern**: Version routing at gateway level
- **Adapter Pattern**: Object structure transformation
- **Middleware Pattern**: Request/response interception
- **Strategy Pattern**: Different versioning strategies per resource

### Resources

- [Hono Documentation](https://hono.dev/)
- [API Versioning Best Practices](https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/)
- [Stripe API Versioning](https://stripe.com/blog/api-versioning) - Real-world example
- [Roy Fielding on Versioning](https://www.infoq.com/articles/roy-fielding-on-versioning/)

---

## 🤝 Contributing

Contributions are welcome! This is a demonstration project designed for learning and experimentation.

**How to contribute:**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Ideas for contributions:
- Additional versioning strategies (e.g., GraphQL versioning)
- Database persistence layer examples
- Client SDK examples in different languages
- Additional adapter patterns for other data transformations
- Performance benchmarks

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) file for more information.

```
MIT License - free to use, modify, and distribute with attribution
```

---

<div align="center">

**Built with ❤️ using [Hono](https://hono.dev/) and TypeScript**

*Demonstrating elegant API versioning patterns for modern web services*

</div>
