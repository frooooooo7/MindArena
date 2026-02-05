---
project_name: 'memoryGAMES'
user_name: 'Fro'
date: '2026-02-05T23:05:00+01:00'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 26
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework**: Next.js 16.1.4 (React 19.2) - Use App Router patterns.
- **Styling**: Tailwind CSS v4.0.
- **State**: Zustand v5 (Web) / In-memory Map caches (API).
- **Database**: Prisma v6.
- **Real-time**: Socket.IO v4.8.
- **Shared Package (@mindarena/shared)**: 
  - **Reasoning**: To prevent desynchronization between API and Web, all interfaces used in Socket.IO events, DTOs, and Zod schemas MUST reside here. This ensures a "Single Source of Truth" across the monorepo.
  - **Action**: Before creating a new data type, AI agents MUST verify if it belongs in `@mindarena/shared`.


## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict Mode**: Always enforced. No `any` allowed. Explicit interfaces for all data structures.
- **Path Aliases**: Use `@/` for all internal frontend imports (e.g., `@/components/ui/button`).
- **Type-Only Imports**: Use `import type` when only metadata is needed to optimize build size.
- **Error Handling**: 
  - Backend services should return clear result objects for game logic.
  - Frontend components must use `try-finally` blocks to ensure state consistency (e.g., clearing auth/loading flags).


### Framework-Specific Rules (React & Next.js)

- **Client vs Server Components**: Use `"use client"` directive only when hooks (useState, useEffect) or browser APIs (Socket.IO) are required. Default to Server Components for layouts and static sections.
- **Premium UI Patterns**: 
  - Use Tailwind 4 transitions and animations for all state changes.
  - Implement `Skeleton` loaders for all data-fetching components to maintain "Premium Feel" during loading.
- **State Management**:
  - Global UI state (auth, theme) -> Zustand.
  - Game logic state -> Managed via Socket.IO events and local component state/hooks.
- **Form Handling**: Use `react-hook-form` combined with `zod` for all user inputs.

### Testing Rules

- **Framework**: Use Vitest for both unit and integration tests.
- **Organization**: Place tests in `__tests__` folders relative to the code being tested.
- **Game Logic Testing**: All game services (e.g., cell generation, move validation) must have 100% unit test coverage for core rules.
- **Naming**: Test files must follow the `[name].test.ts` or `[name].test.tsx` pattern.
- **Isolation**: Each test suite must reset in-memory data (e.g., clearing the `Map` of game rooms) before execution.

### Code Quality & Style Rules

- **Premium Aesthetics (Mandatory)**: 
  - All new UI elements MUST utilize the project's signature gradients (`from-violet-600 to-indigo-600`).
  - Interactive elements must have hover effects (e.g., `hover:scale-105`, `group-hover:opacity-100`).
- **Naming Conventions**:
  - Components/Pages: `PascalCase` internal names, `kebab-case.tsx` filenames.
  - Utilities/Services: `camelCase` function names, `kebab-case.ts` filenames.
- **File Organization**:
  - Components must be colocated with their specific logic if not reusable.
  - Reusable logic belongs in `hooks/` or `services/`.
- **Documentation**: Use JSDoc for service functions (especially for complex game logic).

### Development Workflow Rules

- **Turbo Orchestration**: Always use `npm run dev` or `npm run build` from the root to ensure all workspace dependencies are correctly resolved and rebuilt.
- **Code Formatting**: Run `npm run format` (Prettier) before every commit to maintain consistent document structure.
- **Database Changes**: All schema modifications MUST be done via Prisma migrations. AI agents should NOT manually edit DB schemas.
- **Dependency Management**: Cross-workspace dependencies (e.g., adding a type to `@mindarena/shared`) must be reflected in the respective `package.json` files and require a rebuild of the shared package.

### Critical Don't-Miss Rules

- **Shared Package Enforcement**: Never duplicate TypeScript interfaces across `apps/`. Use `@mindarena/shared`.
- **Socket Cleanup**: AI agents MUST always implement cleanup functions in `useEffect` when subscribing to Socket.IO events to prevent memory leaks.
- **Backend Performance**: Do not use Prisma for real-time game state updates (e.g., active player positions). Use in-memory `Map` or Redis for transient data.
- **UI Consistency**: Do not use plain CSS colors. Always use Tailwind theme variables (`text-primary`, `bg-background`, etc.) and the project's signature gradients.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when technology stack changes.
- Review quarterly for outdated rules.
- Remove rules that become obvious over time.

Last Updated: 2026-02-05T23:15:00+01:00





