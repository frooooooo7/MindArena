---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/product-brief-memoryGAMES-2026-02-10.md', '_bmad-output/project-context.md']
workflowType: 'architecture'
project_name: 'memoryGAMES'
user_name: 'Fro'
date: '2026-02-10T16:45:00+01:00'
lastStep: 8
status: 'complete'
completedAt: '2026-02-10T16:51:00+01:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Architektura musi wspierać system parowania graczy (Matchmaking Skill-Based), dynamiczną walidację ruchów w grze Sequence Memory oraz automatyczne obliczanie i wizualizację punktów MindRank (ELO). Kluczowe jest wsparcie dla stanów "Premium Feedback Loop" po meczu.

**Non-Functional Requirements:**
- **Reliability**: 99.9% poprawnie zapisanych wyników meczów.
- **Performance**: Opóźnienia Round-trip < 200ms, UI 60 FPS.
- **Security**: Obliczenia ELO tylko na serwerze, ochrona przed smurfingiem.
- **UX**: Animowane przejścia Tailwind 4, Skeleton loaders dla Premium Feel.

**Scale & Complexity:**
Projekt charakteryzuje się średnią złożonością wynikającą z interakcji w czasie rzeczywistym i konieczności utrzymania spójności danych między wieloma graczami a bazą danych.

- Primary domain: Web (Full-stack)
- Complexity level: Medium
- Estimated architectural components: 6 (Matchmaking Service, Game Engine, Rank Service, Socket Handler, Shared Types, Premium UI Components)

### Technical Constraints & Dependencies

- **Framework**: Next.js 16 (App Router).
- **Styling**: Tailwind CSS v4.
- **Database**: Prisma v6.
- **Real-time**: Socket.IO v4.8.
- **Infrastructure**: Monorepo z pakietem `@mindarena/shared` (wymuszone).

### Cross-Cutting Concerns Identified

- **State Sync**: Spójność stanu gry między Socket.IO a lokalnym stanem (Zustand).
- **Error Recovery**: Obsługa zerwanych połączeń i ochrona rankingu/punktów gracza.
- AI Consistency: Wymóg stosowania współdzielonych interfejsów TypeScript w celu zapobiegania konfliktom między agentami AI pracującymi nad różnymi częściami systemu.

## Starter Template & Architectural Foundations

### Primary Technology Domain
**Full-stack Web Application (Monorepo)** oparta na Next.js i Socket.IO, zoptymalizowana pod kątem rywalizacji w czasie rzeczywistym.

### Selected Foundation: Custom Hybrid Monorepo (Turbo)

**Rationale for Selection:**
Projekt posiada już ustalone fundamenty techniczne (Next.js 16, Tailwind 4, Socket.IO), które idealnie wpisują się w wymagania "e-sportu dla mózgu". Architektura monorepo zapewnia synchronizację typów między serwerem a klientem, co jest krytyczne dla integralności systemu rankingowego.

**Architectural Decisions Provided by Foundations:**

**Language & Runtime:**
- TypeScript w trybie Strict.
- Node.js runtime dla API, Next.js dla frontendu.

**Styling Solution:**
- Tailwind CSS v4 z autorskimi gradientami (`violet-600` do `indigo-600`).
- Shadcn/ui jako baza komponentów.

**Build Tooling:**
- Turborepo do orkiestracji zadań w monorepo.

**Testing Framework:**
- Vitest dla testów jednostkowych i integracyjnych (wymagane 100% pokrycia dla logiki gry).

**Code Organization:**
- `@mindarena/shared`: Współdzielone schematy Zod, interfejsy DTO i definicje eventów Socket.IO.
- `apps/api`: Autoratywny backend (Prisma, Socket.IO handlers).
- `apps/web`: React Server Components (RSC) oraz Client Components dla interakcji realtime.

## Core Architectural Decisions

### Data Architecture
- **MindRank Persistence**: Bezpośredni zapis do PostgreSQL (Prisma) po każdym meczu w celu zachowania maksymalnej integralności.
- **Validation**: Zod (v3.24) jako jedyny parser danych w pakiecie `shared`.

### Authentication & Security
- **Backend-Authoritative**: Cała logika obliczania punktów ELO rezyduje wyłącznie na serwerze; serwer pobiera dane o graczach bezpośrednio z DB.
- **Anti-Cheat**: Walidacja wszystkich ruchów i stanów końcowych gry przed przeliczeniem rankingu.

### API & Communication
- **Socket Events**: `ARENA_RANK_UPDATED` jako główny sygnał do aktualizacji widoku u obu graczy.
- **Single Source of Truth**: `@mindarena/shared` definiuje wszystkie interfejsy komunikacyjne.

### Frontend Strategy
- **Server-Triggered UX**: Frontend czeka na oficjalny event z serwera zanim odtworzy animację sukcesu (Premium Feedback Loop).

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **Database Fields**: camelCase (zgodnie z Prisma conventions, np. `rankPoints`).
- **Socket Events**: SCREAMING_SNAKE_CASE (np. `ARENA_GAME_FINISHED`).
- **Files/Components**: kebab-case dla plików, PascalCase dla nazw komponentów.

### Structural Patterns
- **Logic Isolation**: Algorytm ELO musi być czystą funkcją wyeksportowaną z `@mindarena/shared`.
- **Testing**: Pliki testowe `*.test.ts` muszą znajdować się obok plików źródłowych.

### Process & UX Patterns
- **Loading States**: Użycie komponentu `Skeleton` dla wszystkich sekcji ładowania danych rankingowych.
- **Error Handling**: Formularze i akcje muszą używać `try-finally` do resetowania flag ładowania.
- **Premium Aesthetics**: Zakaz używania surowych kolorów CSS; wyłącznie tokeny Tailwind 4 i zdefiniowane gradienty.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
memoryGAMES/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── services/
│   │       │   └── rank.service.ts         <-- Obliczenia i persistence
│   │       └── sockets/
│   │           └── handlers/
│   │               └── rank.handler.ts     <-- Eventy RANK_UPDATED
│   └── web/
│       └── src/
│           ├── components/
│           │   └── features/
│           │       └── arena/
│           │           └── rank-card.tsx   <-- Premium UI
│           └── hooks/
│               └── use-rank-sync.ts        <-- Synchronizacja z socketami
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── game/
│   │       │   └── mind-rank.ts            <-- Czysty algorytm ELO
│   │       └── schemas/
│   │           └── rank.schema.ts          <-- Zod: Rangi i punkty
│   └── database/
│       └── prisma/
│           └── schema.prisma               <-- Nowe pola rankingu
```

### Architectural Boundaries

**API Boundaries:**
Backend (`apps/api`) jest jedynym właścicielem bazy danych. Wszystkie odczyty i zapisy punktów MindRank przechodzą przez `RankService`.

**Component Boundaries:**
Komponenty UI w `apps/web` są pasywne wobec logiki rankingu – reagują na eventy Socket.IO i wyświetlają stany obliczone przez serwer.

**Service Boundaries:**
`RankService` jest odizolowany od logiki samej gry (Sequence Memory), otrzymując jedynie wynik (win/loss/draw) do przeliczenia punktów.

**Data Boundaries:**
Single Source of Truth dla schematów danych rankingowych znajduje się w `@mindarena/shared`.

### Requirements to Structure Mapping

**Feature: MindRank Engine**
- Logika ELO: `packages/shared/src/game/mind-rank.ts`
- Serwis backendowy: `apps/api/src/services/rank.service.ts`
- Walidacja Zod: `packages/shared/src/schemas/rank.schema.ts`

**Feature: Premium Feedback Loop**
- Komponenty UI: `apps/web/src/components/features/arena/`
- Animacje i stan: `apps/web/src/hooks/use-rank-sync.ts`

### Integration Points
- **Internal Communication**: Socket.IO dla eventów realtime (`ARENA_RANK_UPDATED`).
- **Data Flow**: Klient -> Surowy Ruch -> Serwer (Walidacja) -> Win/Loss -> RankService -> Prisma DB Update -> Socket.IO Emit -> Klient (Premium UI Update).

## Architecture Validation Results

### Coherence Validation ✅
Wszystkie decyzje technologiczne są spójne. Wybór Monorepo Turbo zapewnia idealną synchronizację typów przez pakiet `@mindarena/shared`.

### Requirements Coverage Validation ✅
Architektura w 100% pokrywa wymogi PRD dotyczące systemu MindRank oraz pętli "Premium Feedback Loop".

### Implementation Readiness Validation ✅
Dokumentacja zawiera konkretne ścieżki plików oraz wzorce (np. `try-finally` w handlowaniu formami), co minimalizuje ryzyko konfliktów między agentami AI.

### Architecture Readiness Assessment
**Status:** READY FOR IMPLEMENTATION
**Confidence Level:** HIGH

**Kluczowe mocne strony:**
- Single Source of Truth w `@mindarena/shared`.
- Bezpieczny, serwerowy model przeliczania rankingu.
- Jasno zdefiniowane granice między logiką gry a systemem rang.

### Implementation Handoff
**AI Agent Guidelines:**
- Zawsze sprawdzaj `@mindarena/shared` przed definiowaniem nowych typów.
- Logika ELO musi pozostać czystą funkcją.
- Nie używaj bezpośrednich zapytań Prisma w modułach Socketowych; deleguj to do `RankService`.
