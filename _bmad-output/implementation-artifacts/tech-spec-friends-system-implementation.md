---
title: 'Friends System Implementation'
slug: 'friends-system-implementation'
created: '2026-02-21T11:12:28+01:00'
status: 'Completed'
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
tech_stack: ['Express', 'Prisma', 'Socket.IO', 'Next.js', 'React', 'Tailwind CSS', 'shadcn/ui']
files_to_modify: ['apps/api/prisma/schema.prisma', 'apps/api/src/routes/index.ts', 'apps/api/src/routes/friend.routes.ts', 'apps/api/src/controllers/friend.controller.ts', 'apps/api/src/services/friend.service.ts', 'apps/api/src/repositories/friend.repository.ts', 'apps/api/src/sockets/handlers/friend.handler.ts', 'apps/api/src/sockets/index.ts', 'apps/api/src/utils/event-bus.ts', 'packages/shared/src/types/friend.ts', 'packages/shared/src/schemas/friend.schema.ts', 'apps/web/src/app/account/page.tsx', 'apps/web/src/components/account/friends-section.tsx', 'apps/web/src/hooks/use-friends.ts']
code_patterns: ['Service-Repository Pattern', 'Controller Zod Validation', 'Socket.IO Event Handlers', 'React Custom Hooks', 'shadcn/ui Tabs and Pagination']
test_patterns: []
---

# Tech-Spec: Friends System Implementation

**Created:** 2026-02-21T11:12:28+01:00

## Overview

### Problem Statement

Brak możliwości nawiązywania relacji i interakcji społecznych pomiędzy graczami w aplikacji. Gra oparta na rywalizacji oraz profilach użytkowników bardzo zyskuje na module przyjaciół.

### Solution

Dodanie nowego modelu bazy danych (`Friendship` z odpowiednimi statusami, np. PENDING, ACCEPTED, REJECTED) obsługującego relacje między użytkownikami. Wdrożenie endpointów API (REST) do wyszukiwania po nazwie, a także architektury Socket.IO do obsługi zaproszeń oraz zmian statusów w czasie rzeczywistym. Na froncie powstanie dedykowana zakładka w sekcji "Account" (`/account`) z obsługą paginacji `shadcn`.

### Scope

**In Scope:**
- Modyfikacja `schema.prisma` (relacje i statusy w modelu `Friendship`).
- Nowe serwisy backendowe i endpointy (wyszukiwanie z limitowaniem i paginacją, zarządzanie listą i akcjami).
- Rejestracja zdarzeń w Socket.IO, tak żeby w czasie rzeczywistym informować drugi układ (nowy hook `useFriendRequests` lub w ramach wybranego store).
- Nowa zakładka "Friends" / "Social" na profilu (UI) oparta na aktualnej strukturze komponentów konta.
- Wykorzystanie paginacji z komponentów `shadcn` do renderowania wyników wyszukiwania (limit 10 wyników na akcję).

**Out of Scope:**
- Aktywność znajomych na żywo na feedzie (tzw. wall / timeline).
- Czat tekstowy ze znajomymi.
- Wysyłanie e-maili informujących o przyjściu zaproszenia do znajomych (tylko wewnątrz-aplikacyjne notyfikacje przez Sockety).

## Context for Development

- Wyszukiwanie odbywa się po dokładnej lub częściowej nazwie użytkownika, zwraca `10` wymików na stronę i wykorzystuje paginację z Shadcn UI.
- Pojedynczy model relacji `Friendship` (kolumny `userId`, `friendId`, `status`) wydaje się optymalny by uniknąć złożoności w bazie danych, podczas aktualizacji stanu (PENDING -> ACCEPTED).
- Real-time musi być sprawnie obsłużony. Potrzebujemy nowego namespace'u/handlera (np. `friends.handler.ts`) do dystrybucji zaproszeń do nasłuchujących w danym momencie (online).
- Wcześniejsze ustalenia architektoniczne wskazują na modularność struktury `components/account`, trzeba pod to zaprojektować sekcję UI.

### Codebase Patterns

1. **Service-Repository Pattern**: Endpointy HTTP używają wzorca Controller -> Service -> Repository. Walidacja odbywa się w Controllerze za pomocą biblioteki Zod, logika biznesowa w Service, a dostęp do bazy w Repository.
2. **Real-time Eventing**: Socket.IO obsługiwane jest w katalogu `apps/api/src/sockets/handlers/`. Handler np. `friend.handler.ts` musi nasłuchiwać i emitować zdarzenia definiowane jako stałe w pakiecie `@mindarena/shared`.
3. **Frontend UI**: Główna struktura konta oparta jest o zakladki interfejsu `Tabs` z `shadcn/ui`. "Friends" musi zaistnieć jako kolejny `TabsContent`, a cały routing nie ulegnie modyfikacji. Obsługa zapytań API oraz live-updates przez Socket powinna być opakowana w customowy hook (np. `useFriends.ts` lub store Zustand).

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `apps/api/prisma/schema.prisma` | Baza danych: Model relacyjny `Friendship` pomiędzy `User` a `User`, enum `FriendStatus`. |
| `packages/shared/src/schemas*/types*` | Typy TypeScript i schematy walidacyjne Zod dla operacji na znajomych. |
| `apps/api/src/routes/friend.routes.ts` | Definicja endpointów (GET search, GET invites, POST invite, PUT accept, DELETE discard). |
| `apps/api/src/services/friend.service.ts` | Logika biznesowa znajomych (tworzenie, zatwierdzanie, listowanie, limity na ilość wstrzykniętych wyników m.in 10 na stronę). |
| `apps/api/src/sockets/handlers/friend.handler.ts` | Real-time nasłuchiwanie zaproszeń w środowisku `SocketManager`. |
| `apps/web/src/app/account/page.tsx` | UI: dodanie zakładki (Social/Friends). |
| `apps/web/src/components/account/friends-section.tsx` | Główny kontener na wyszukiwarkę z `shadcn/ui pagination` oraz listę zaproszeń. |

### Technical Decisions

- **REST API + Sockets**: Połączenie dwóch paradygmatów: Listowanie i szukanie odbywa się przez zapytania REST (`fetch` via frontend hooks), podczas gdy zdarzenia "w tle" (nowe zaproszenie) używają Socketa dla szybkiej notyfikacji uderzającej od razu do cache'u stawiając ewentualny badge "1".
- **Database Moddeling**: W relacyjnej bazie `Friendship` stworzymy dwa Foreign Keys: `requesterId` i `addresseeId`. Aby ułatwić wyszukiwanie na wzajemne przyjaźnie (`status: ACCEPTED`), możemy po akceptacji trzymać np. i tak jeden rekord lub dwa - projekt przewiduje prostą implementację, wystarczy jeden rekord odpytywany OR i AND.
- **Search Restrictions**: Wyszukiwanie odbywa się po nazwie użytkownika (`String.contains` z indeksacją jeśli duża baza, tu wystarczy bazowe `contains(ignoreCase)` z Prismy) - limitowane ściśle do maksimum `10` rekordów, i włączona paginacja Shadcn UI po stronie klienta zliczająca offsety `skip` / `take`.

## Implementation Plan

### Tasks

### Tasks

- [x] Task 1: Aktualizacja schematu bazy danych
  - File: `apps/api/prisma/schema.prisma`
  - Action: Dodać model `Friendship` z relacjami do modelu `User` (`requesterId` i `addresseeId`). Dodać enum `FriendStatus` z wartościami `PENDING`, `ACCEPTED`, `REJECTED`. Puścić `npx prisma migrate dev --name add_friendship_model`.
  - Notes: Zapewnić unikalność pary `(requesterId, addresseeId)` np. poprzez `@@unique`.

- [x] Task 2: Dodanie typów i schematów w pakiecie shared
  - File: `packages/shared/src/schemas/friend.schema.ts` i `packages/shared/src/types/friend.ts` (oraz dodanie ich do `index.ts`)
  - Action: Zdefiniowanie Zod schematów na zapytania API (np. `SendFriendRequestSchema`, `RespondFriendRequestSchema`, `SearchPlayersSchema`). Definicja typów odpowiedzi (np. `FriendshipDTO`).
  - Notes: Zwrócić uwagę na eksporty beczkowe w środowisku Lerna/Turborepo.

- [x] Task 3: Implementacja wzorca Repository dla znajomych
  - File: `apps/api/src/repositories/friend.repository.ts`
  - Action: Zaimplementować metody do operacji na bazie: `createRequest`, `updateStatus`, `getFriendsForUser`, `getPendingRequests`, `searchUsersByName` (limitowane do max 10 z opcją `skip/take`).
  - Notes: Optymalizacja zapytań `LIKE` (%nazwa%) aby było wydajne. W przypadku akceptacji trzeba obsłużyć znalezienie odpowiedniego rekordu bez problemu jak id są różnie ustawione.

- [x] Task 4: Logika biznesowa znajomych w warstwie Service
  - File: `apps/api/src/services/friend.service.ts`
  - Action: Implementacja metod używających powiązanego repozytorium. Obsługa błędów np. użytkownik już posiada tego znajomego lub zaproszenie istnieje.
  - Notes: Przygotowanie payloadów eventów, które będą podane do namespace'a Socketa.

- [x] Task 5: Zbudowanie RESTowych endpointów w kontrolerze i routing
  - File: `apps/api/src/controllers/friend.controller.ts` oraz `apps/api/src/routes/friend.routes.ts`
  - Action: Połączenie metod z `friend.service` przez API RESTowe (`/friends/search`, `/friends/requests`, `/friends/:id/accept` itp). Rejestracja `friendRoutes` w `apps/api/src/routes/index.ts` (lub `apps/api/src/index.ts`).
  - Notes: Ubiór wokół funkcji autoryzacji z middleware (`authMiddleware`).

- [x] Task 6: Obsługa zdarzeń Sockets
  - File: `apps/api/src/sockets/handlers/friend.handler.ts` (nowy plik) oraz update w `apps/api/src/sockets/index.ts`
  - Action: Odbieranie i przesyłanie zdarzeń przez Socket.IO (np. powiadomienie gracza online, kiedy dostaje zaproszenie poprzez `emitToRoom` lub mapowania ID do socketa w nowym małym globalnym mapowaniu, jeśli SocketManager go na ten moment go nie dostarcza).
  - Notes: Należy dołączyć rejestrację zdarzeń do generalnego `SocketManager`. Rozważ, że do wysyłania powiadomień użytkownik `addressee` musi byc połączony.

- [x] Task 7: Budowa nowych modułów na widoku Konta
  - File: `apps/web/src/app/account/page.tsx`
  - Action: Dodać nową zakładkę `Social` oraz `TabsContent` wywołujące nowy komponent sekcji `FriendsSection`.
  - Notes: Brak zmian strukturalnych profilu.

- [x] Task 8: Dedykowany moduł sekcji Friends
  - File: `apps/web/src/components/account/friends-section.tsx`
  - Action: Implementacja logiki wyszukiwarki (z throttlowanym inputem) korzystając z hooka/stanu wewnętrznego REST i paginatora `<Pagination>` shadcn/ui.
  - Notes: Layout zakłada "Friends List" jako główną kartę, oraz "Find Friends" i z boku "Pending Requests". Wykorzystaj hook np. `useFriends` do spinania logiki z Socket i z API.

### Acceptance Criteria

- [x] AC 1: Given zalogowanego użytkownika na zakładce `Social`, when wpisze "Fro" w wyszukiwarkę, then otrzyma maksymalnie 10 wyników ze stroną 1 przy użyciu loadera oraz wyświetli kontrolki paginacji `shadcn`.
- [x] AC 2: Given znalezionego gracza z ID innym niż własne, when wciśnie guzik "Add Friend", then w bazie powstaje rekord `Friendship` z statusem `PENDING` a przycisk mienia się na "Requested".
- [x] AC 3: Given użytkownika do którego leci zaproszenie z włączoną aplikacją (połączony Socket), when zaproszenie go dotrze do serwera, then użytkownik ten z miejsca zobaczy zmianę/powiadomienie na swoim layoucie (np w sekcji "Pending requests").
- [x] AC 4: Given zatwierdzonego zaproszenia przez odbiorcę, when kliknie on "Accept", then status w bazie zmienia się na `ACCEPTED` a on sam zaczyna pojawiać się na liście "Friends List" zgłaszającego i odbiorcy.
- [x] AC 5: Given wyszukiwania użytkowników, when użtykownik podaje tekst pusty lub za krótki (np < 2-3 znaki), then zapytanie blokuje się unikając spamu na baze danych bazując na Zod schemas (lub zwraca błąd 400 z Controller'a).

## Additional Context

### Dependencies

### Dependencies

- `@mindarena/shared` - Rozszerzenie eksportów do typowania pomiędzy web i api.
- Prisma ORM - Nowa migracja pod model relacyjny.
- Shadcn UI - Obecne zaimplementowane podsystemy `<Tabs>` i instalacja pakietu `<Pagination>` jeśli nie był wczesniej zainstalowany (lub opcjonalne pobranie via `mcp shadcn`).
- Socket.IO - Używane globalnie po stronie Node backendu i jako klient po stronie app webowej.

### Testing Strategy

- **Unit tests**: Funkcje Serwisu (`friend.service.ts`) sprawdzające limitacje i statusy przyjaźni.
- **Manual testing**: Uruchomienie dwóch kart przeglądarki na dwóch innych test-kontach użytkowników, obserwowanie live-sockets notyfikacji i list wynikowych na żywo podczas wzajemnej interakcji (invite -> accept/reject). Działanie wyszukiwania - sprawdzanie jak działa stronicowanie z shadcn <Pagination> i poprawny offset SQL do bazy po kliknięciu wyższych stron wyników.

### Notes

- Znani ryzykanci: Socket.IO dystrybuuje paczkę do określonego UID, jeśli brakuje systemu relacji SocketId <-> UserId trzeba będzie go dostawić do `SocketManager` aby powiadamiać dokładnie tego drugiego użytkownika, z pominięciem emitowania ogólnego do wszystkich. `ArenaEvent` w obecnym wdrożeniu polega na dołączeniu do pokoju. Przy direct-messaging via sockety wymaga to np mapy `ConnectedUsers`.

## Review Notes
- Adversarial review completed (2026-02-21)
- Findings: 8 total (3 CRITICAL, 3 MEDIUM, 2 LOW)
- Fixed (6/8):
  - 🔴 F1: `declineOrCancelRequest` 3-query N+1 → single `findFirst` in repository
  - 🔴 F2: All `any` types replaced with `unknown`/proper types across service, controller, handler, hook
  - 🔴 F3: Dual `FriendStatus` type acknowledged — `as FriendStatus` casts now properly typed vs `as any`
  - 🟡 F4: `acceptRequest` ALL-fetch → single `findPendingRequestForUser` query
  - 🟡 F5: URL string interpolation → Axios `params` option (XSS-safe)
  - 🟡 F6: Undocumented files (`use-friends.ts`, `event-bus.ts`) added to story file list
- Skipped (2/8):
  - 🟢 F7: Pagination page explosion (PaginationEllipsis) — UX improvement for later
  - 🟢 F8: `structure.md` update — deferred to next task
