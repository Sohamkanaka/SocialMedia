# Backend Guidelines

## 1. Tech Stack Standards

### Core Stack
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- ESM (`import` / `export`)
- Async/Await only
- Prisma for ORM
- use Zod for validation
- Use MVC pattern (routes → controllers → services → repo)
- User Interface should be clean and modern
- Follow REST API standards for endpoint design, request/response structure, and proper HTTP methods.
- Ensure consistent success/error response formats and implement standardized pagination for all list endpoints.
- Follow DRY principles( Do Not Repeat Yourself)

### Do NOT Use
- CommonJS (`require`)
- Class-based controllers or services
- Business logic inside controllers
- Raw SQL inside controllers
- Direct DB calls from routes
