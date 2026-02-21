---
title: 'Live Arena Feed Implementation'
slug: 'live-arena-feed'
created: '2026-02-20T19:00:00+01:00'
status: 'Completed'
stepsCompleted: [1, 2, 3, 4, 5, 6]
tech_stack: ['Next.js 16', 'React 19', 'Socket.IO', 'Zustand', 'Turborepo']
files_to_modify: 
  - packages/shared/src/types/arena.ts
  - apps/api/src/services/room.service.ts
  - apps/api/src/services/matchmaking.service.ts
  - apps/api/src/sockets/handlers/arena.handler.ts
  - apps/api/src/sockets/handlers/game/sequence.handler.ts
  - apps/api/src/sockets/handlers/game/chimp.handler.ts
  - apps/api/src/sockets/handlers/game/common.ts
  - apps/web/src/hooks/use-arena.ts
  - apps/web/src/store/arena.store.ts
  - apps/web/src/components/arena/live-feed.tsx
code_patterns: ['Socket broadcasting (io.emit)', 'Service-provided game state', 'Barrel exports', 'Zustand stores']
test_patterns: ['Manual verification with multiple tabs', 'Socket event logging']

---

# Tech-Spec: Live Arena Feed Implementation

**Created:** 2026-02-20T19:00:00+01:00

## Overview

### Problem Statement

Komponent `LiveFeed` na stronie `/arena` wyświetla obecnie statyczne dane testowe (placeholder). Użytkownicy nie widzą rzeczywistych meczów odbywających się w systemie, co obniża dynamikę platformy i zaangażowanie.

### Solution

Implementacja systemu rozsyłania (broadcast) informacji o aktywnych i niedawno zakończonych meczach z serwera do wszystkich klientów w lobby `/arena`. System będzie wykorzystywał Socket.IO do przesyłania aktualizacji przy zmianie stanu pokoju (start gry, koniec gry).

### Scope

**In Scope:**
- Definicja typów `LiveGameInfo` i zdarzenia `LIVE_GAMES_UPDATE` w `@mindarena/shared`.
- Rozszerzenie `room.service.ts` o funkcję pobierającą listę publicznych informacji o grach.
- Zmiana `startGame` i `endGame` w API, aby triggerowały broadcast do wszystkich połączonych użytkowników.
- Aktualizacja hooka `useArena` do nasłuchiwania na nowe zdarzenie.
- Refaktor `LiveFeed.tsx`, aby wyświetlał rzeczywiste dane (limit 4 najnowsze).

**Out of Scope:**
- Tryb obserwatora (Spectator Mode).
- Pełnostronicowa widok wszystkich meczów ("View All").
- Trwałe logowanie historii meczów w bazie danych (wykracza poza wymagany feed).

## Context for Development

### Codebase Patterns

- **Monorepo Structure**: Shared types w `packages/shared`, logic rozdzielony na `apps/api` i `apps/web`.
- **Socket.IO Event Flow**: Eventy definiowane w `ARENA_EVENTS`, obsługiwane przez dedykowane handlery w `apps/api/src/sockets/handlers/`.
- **Service Layer**: `room.service.ts` trzyma Mapę `gameRooms`, co czyni go naturalnym punktem wyjścia dla zbierania aktywnych gier.
- **Client Hooks**: `useArena.ts` zarządza subskrypcją zdarzeń areny – idealne miejsce na dodanie listenera live feed.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `packages/shared/src/types/arena.ts` | Definicja interfejsu `LiveGameInfo` i eventu `LIVE_GAMES_UPDATE`. |
| `apps/api/src/services/room.service.ts` | Logika zbierania danych o aktywnych pokojach (`getLiveGames`). |
| `apps/api/src/services/matchmaking.service.ts` | Wyzwalanie broadcastu po utworzeniu meczu. |
| `apps/api/src/sockets/handlers/arena.handler.ts` | Rejestracja handlerów i obsługa początkowego stanu feedu przy połączeniu. |
| `apps/web/src/hooks/use-arena.ts` | Zarządzanie stanem `liveGames` na kliencie. |
| `apps/web/src/components/arena/live-feed.tsx` | Wyświetlanie danych z real-time feedu. |

### Technical Decisions

1.  **Format Danych**: `LiveGameInfo` zawiera `id`, `p1Name`, `p2Name`, `gameType`, `status`, `winnerName`, `createdAt`, `updatedAt`.
2.  **Mechanizm Broadcastu**: Globalny `io.emit(ARENA_EVENTS.LIVE_GAMES_UPDATE, games)` z throttlingiem 1000ms.
3.  **Początkowy Stan**: Przesyłany natychmiast przy połączeniu socketu do areny.
4.  **Limitowanie**: Server wysyła do 20 gier, Frontend wyświetla 4 najnowsze.


## Implementation Plan

### Tasks

- [x] Task 1: Definicja typów i stałych zdarzeń
  - File: `packages/shared/src/types/arena.ts`
  - Action: Dodać interfejs `LiveGameInfo` oraz stałą `LIVE_GAMES_UPDATE` do obiektu `ARENA_EVENTS`.
  - Notes: `LiveGameInfo` powinno zawierać `id`, `p1Name`, `p2Name`, `gameType`, `status` ("waiting" | "playing" | "finished") oraz opcjonalnie `winnerName`.

- [x] Task 2: Implementacja zbierania danych o grach w serwisie
  - File: `apps/api/src/services/room.service.ts`
  - Action: Dodać funkcję `getLiveGames(): LiveGameInfo[]`, która filtruje `gameRooms` (status "playing" lub "finished") i mapuje je na format uproszczony dla feedu.
  - Notes: Sortowanie po `createdAt` malejąco.

- [x] Task 3: Funkcja pomocnicza do broadcastu
  - File: `apps/api/src/sockets/handlers/arena.handler.ts`
  - Action: Wyeksportować funkcję `broadcastLiveGames(io: Server)`, która pobiera dane z serwisu i robi `io.emit(ARENA_EVENTS.LIVE_GAMES_UPDATE, games)`.

- [x] Task 4: Wyzwalanie aktualizacji na serwerze
  - Files: `apps/api/src/services/matchmaking.service.ts`, `apps/api/src/services/room.service.ts`
  - Action: Wywołać `broadcastLiveGames` w miejscach, gdzie zmienia się status pokoju (po utworzeniu pokoju oraz po wywołaniu `endGame`).
  - Notes: Wymaga przekazania instancji `io` tam, gdzie obecnie jej brakuje (np. do `endGame` w serwisie lub obsłużenie tego w handlerze po wywołaniu serwisu).

- [x] Task 5: Przesłanie początkowego stanu przy dołączeniu
  - File: `apps/api/src/sockets/handlers/arena.handler.ts`
  - Action: W `registerArenaHandlers`, podczas zdarzenia połączenia lub wejścia do lobby, wysłać `socket.emit` z aktualną listą gier.

- [x] Task 6: Zarządzanie stanem na kliencie
  - Files: `apps/web/src/store/arena.store.ts`, `apps/web/src/hooks/use-arena.ts`
  - Action: Dodać `liveGames: LiveGameInfo[]` do store'a i zaktualizować hook `use-arena.ts`, aby nasłuchiwał na `LIVE_GAMES_UPDATE`.

- [x] Task 7: Odświeżenie UI Live Feed
  - File: `apps/web/src/components/arena/live-feed.tsx`
  - Action: Podpiąć dane ze store'a, usunąć placeholder i zaimplementować limitowanie do 4 elementów (`.slice(0, 4)`).

### Acceptance Criteria

- [x] AC 1: Given użytkownik jest w lobby `/arena`, when rozpoczyna się nowy mecz między innymi graczami, then feed aktualizuje się automatycznie pokazując nową grę jako "In Progress".
- [x] AC 2: Given mecz widoczny w feedzie kończy się, when serwer wyśle informację o zwycięzcy, then status w feedzie zmienia się na "Won by [Imię]".
- [x] AC 3: Given na serwerze trwa więcej niż 4 mecze, when użytkownik patrzy na feed, then widzi tylko 4 najnowsze rozgrywki.
- [x] AC 4: Given użytkownik odświeży stronę, when połączy się z socketem, then natychmiast widzi aktualny stan feedu bez czekania na nowe zdarzenie.

## Review Notes
- Adversarial review #1 completed (Step 5) — 10 total, 9 fixed (real), 1 skipped (noise)
- Adversarial review #2 completed (2026-02-20T19:17+01:00)
  - Findings: 8 total (1 🔴 Critical, 4 🟡 Medium, 3 🟢 Low)
  - Fixed: 6 (all Critical + Medium + 1 Low)
  - Remaining (Low/unfixed): gameType normalization split, verbose console.log in hook
  - Key fixes: `any[]` → `LiveGameInfo[]`, `resetArena` clears liveGames, finished room cleanup uses `updatedAt`, dead button disabled, 3 undocumented files added to spec

## Additional Context

### Dependencies

- **Socket.IO Instancja**: Handlery muszą mieć dostęp do globalnego obiektu `io` (już zapewnione w `registerArenaHandlers`).

### Testing Strategy

- Otwarcie dwóch kart w trybie Incognito (jako różni gracze) oraz trzeciej karty jako obserwator lobby.
- Uruchomienie meczu między graczami A i B.
- Weryfikacja czy w karcie obserwatora pojawił się wpis.
- Zakończenie meczu (jeden gracz przegrywa) i sprawdzenie aktualizacji statusu.

### Notes

- **Performance**: Broadcast do wszystkich przy każdym ruchu (score update) został odrzucony na rzecz aktualizacji tylko przy zmianach stanu (start/koniec), aby oszczędzać pasmo.
- **Future**: W przyszłości można dodać `spectate` klikając w przycisk "Watch".
