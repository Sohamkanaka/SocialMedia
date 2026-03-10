# Frontend Guidelines

## 1. Tech Stack Standards

### Core Stack
- React (Functional Components only)
- TypeScript (`strict: true`)
- RTK Query for API communication
- Redux Toolkit for global state (only when necessary)
- Feature-based folder structure
- Tailwind CSS for styling
- Shadcn/UI for components
- Use Server Components wherever possible, and introduce Client Components only when interactivity or browser-specific APIs are required.
- Always ensure that all components are fully responsive across all screen sizes.
- Follow DRY principles( Do Not Repeat Yourself)

### Do NOT Use
- Class components
- Direct `fetch` or `axios` inside components
- Inline business logic inside UI components
- Any new library without approval