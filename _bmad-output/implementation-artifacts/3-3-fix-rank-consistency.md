---
id: '3-3-rank-consistency'
title: 'Fix Rank Consistency and Real-Time Updates'
status: 'done'
epic: 'Epic 3: MindRank Progression Engine & Persistence'
---

# Story: Fix Rank Consistency and Real-Time Updates

As a gracz,
I want aby moja ranga (nazwa i punkty) była spójna we wszystkich widokach natychmiast po meczu,
So that nie muszę odświeżać strony ani logować się ponownie, aby zobaczyć postęp.

## Acceptance Criteria

- [x] Funkcja `updateRankPoints` w `auth.store.ts` aktualizuje zarówno punkty, jak i nazwę rangi.
- [x] Hooki gier 1v1 (`useSequenceGame1v1`, `useChimpGame1v1`) prawidłowo sprzątają po sobie przy odmontowaniu (brak memory leaks w animacjach).
- [x] Usunięto zbędne logi konsoli z procesów synchronizacji rangi.
- [x] Synchronizacja danych w `auth.store.ts` wykorzystuje pełny payload `RankUpdatePayload`.

## Tasks

- [x] Rozszerzenie `AuthState` o wsparcie dla synchronizacji nazwy rangi.
- [x] Implementacja bezpiecznego przerywania animacji w `useSequenceGame1v1`.
- [x] Refaktoryzacja `handleRankUpdate` w obu hookach gry 1v1.
- [x] Usunięcie "magic numbers" i `console.log` z logiki synchronizacji.

## Dev Agent Record

### File List
- `apps/web/src/store/auth.store.ts`
- `apps/web/src/hooks/use-sequence-game-1v1.ts`
- `apps/web/src/hooks/use-chimp-game-1v1.ts`

### Change Log
- Zaktualizowano `useAuthStore` o metodę `updateRank`, która przyjmuje `points` oraz `rankName`.
- Dodano `isMounted` ref do `useSequenceGame1v1` i `useChimpGame1v1` w celu zabezpieczenia asynchronicznych animacji.
- Poprawiono `showSequenceAnimation` w `useSequenceGame1v1` - teraz sprawdza stan zamontowania przed każdym krokiem.
- Synchronizacja `auth.store.ts` teraz używa `rankName` z serwera, co rozwiązuje błąd "niezmiennej nazwy rangi".
