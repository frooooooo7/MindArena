---
title: "Publiczny profil użytkownika przez /account/[name]"
slug: "publiczny-profil-uzytkownika-account-name"
created: "2026-02-26T00:00:00+01:00"
status: "Completed"
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  [
    "Next.js 16 (App Router)",
    "React 19",
    "Tailwind CSS v4",
    "Zustand v5",
    "Axios",
    "Express",
    "Prisma v6",
    "Zod",
    "@mindarena/shared",
    "Vitest",
  ]
files_to_modify:
  [
    "apps/web/src/app/account/[name]/page.tsx",
    "apps/web/src/app/account/page.tsx",
    "apps/web/src/components/account/profile-header.tsx",
    "apps/web/src/components/navbar.tsx",
    "apps/web/src/lib/axios.ts",
    "apps/api/src/routes/user.routes.ts",
    "apps/api/src/controllers/user.controller.ts",
    "apps/api/src/services/user.service.ts",
    "apps/api/src/__tests__/services/user.service.test.ts",
    "packages/shared/src/schemas/auth.ts",
  ]
code_patterns:
  [
    "Router -> Controller -> Service na API",
    "Prisma select public fields (USER_PUBLIC_SELECT)",
    "Walidacja wejścia przez Zod schemas z @mindarena/shared",
    "Frontend przez współdzieloną instancję axios z interceptorami auth",
    "Warunkowe renderowanie UI na podstawie auth/user context",
  ]
test_patterns:
  [
    "Vitest",
    "Testy API w apps/api/src/__tests__/services/*.test.ts z mockowanym prisma",
    "Nazewnictwo *.test.ts",
  ]
---

# Tech-Spec: Publiczny profil użytkownika przez /account/[name]

**Created:** 2026-02-26T00:00:00+01:00

## Overview

### Problem Statement

Obecna strona `/account` działa wyłącznie jako widok własnego konta zalogowanego użytkownika i nie pozwala przejść do profilu innego gracza po nazwie (np. `/account/messi`). Brakuje więc czytelnego mechanizmu przeglądania profili innych użytkowników w obrębie istniejącego UX konta.

### Solution

Pozostawić `/account` jako widok „Mój profil”, a równolegle dodać dynamiczny route `/account/[name]` dla profilu innego użytkownika. Widok ma ładować dane użytkownika po polu `name`, wymagać zalogowania oraz ukrywać elementy owner-only.

### Scope

**In Scope:**

- Utrzymanie `/account` jako widoku własnego konta.
- Dodanie routingu `/account/[name]` dla profilu wskazanego użytkownika.
- Dostęp wyłącznie dla użytkowników zalogowanych.
- Wyświetlanie wszystkich danych poza sekcjami/akcjami owner-only.
- Wyszukiwanie profilu po istniejącym polu `name` (bez nowego `username`).

**Out of Scope:**

- Publiczny dostęp do profili bez logowania.
- Wprowadzenie nowego, osobnego pola `username` w modelu danych.
- Udostępnianie owner-only funkcji na cudzym profilu (np. edycja, security).

## Context for Development

### Codebase Patterns

- Frontend konta jest obecnie komponentem klientowym (`"use client"`) w App Router i używa `useSearchParams` + lokalnych `useState` do zakładek oraz trybów.
- Auth opiera się o `useAuthStore` (Zustand, persisted) i redirect do `/auth` przy braku sesji; tokeny idą przez wspólną instancję `api` (`apps/web/src/lib/axios.ts`) z interceptorami refresh.
- API stosuje wzorzec Router -> Controller -> Service i selekcję publicznych pól usera przez stały `USER_PUBLIC_SELECT`.
- Walidacja requestów realizowana przez schematy Zod ze współdzielonego pakietu `@mindarena/shared` (np. `updateProfileSchema`, `SearchPlayersSchema`).
- W repo istnieje już wzorzec wyszukiwania userów po `name` (`friendRepository.searchUsersByName`) z sanitizacją query i Prisma `contains`/`mode: "insensitive"`.

### Files to Reference

| File                                                       | Purpose                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/web/src/app/account/page.tsx`                        | Aktualny self-profile; punkt odniesienia dla logiki auth i zakładek       |
| `apps/web/src/components/account/profile-header.tsx`       | Header zawiera elementy owner-only (mail, edycja profilu) do warunkowania |
| `apps/web/src/components/account/local-stats-section.tsx`  | Sekcja overview (local) używająca API statystyk                           |
| `apps/web/src/components/account/arena-stats-section.tsx`  | Sekcja overview (arena) używająca API statystyk                           |
| `apps/web/src/components/account/game-records-section.tsx` | Sekcja statystyk/historyczna                                              |
| `apps/web/src/components/account/friends-section.tsx`      | Sekcja social, obecnie zależna od zalogowanego usera i hooka friends      |
| `apps/web/src/components/navbar.tsx`                       | Wejścia na `/account` i podzakładki                                       |
| `apps/web/src/lib/axios.ts`                                | Wspólny klient HTTP z Bearer + refresh flow                               |
| `apps/api/src/routes/user.routes.ts`                       | Miejsce dodania endpointu GET usera po `name`                             |
| `apps/api/src/controllers/user.controller.ts`              | Controller dla pobierania profilu po `name`                               |
| `apps/api/src/services/user.service.ts`                    | Serwis usera; obecnie update, docelowo też read-by-name                   |
| `apps/api/src/repositories/friend.repository.ts`           | Referencja dla wyszukiwania po nazwie i sanitizacji query                 |
| `apps/api/prisma/schema.prisma`                            | Model `User` (brak osobnego `username`, używamy `name`)                   |
| `apps/api/src/__tests__/services/user.service.test.ts`     | Wzorzec testów serwisu usera (Vitest + mocked prisma)                     |

### Technical Decisions

- Utrzymujemy dualny routing: `/account` jako self-profile oraz nowy `/account/[name]` jako profile-view po nazwie.
- Dostęp do obu widoków pozostaje auth-only, zgodnie z istniejącą polityką (redirect na `/auth` po stronie frontu + auth middleware w API).
- API użytkownika rozszerzamy o odczyt profilu po `name` (public fields only), bez wprowadzania nowego pola `username`.
- `profile-header` i ewentualne sekcje będą otrzymywać flagę kontekstu (`isOwner`/`viewerContext`) do ukrycia owner-only elementów (mail, edycja, security itp.).
- Dla spójności i bezpieczeństwa wyszukiwania po nazwie stosujemy sanitizację podobną do modułu friends (`query.replace(/[%_\\]/g, '').trim()`).
- Zakres Step 3 musi jawnie rozstrzygnąć zachowanie dla niejednoznacznych nazw (`name` nie ma unikalności w Prisma) i zwracanie 404/not-found UX.

## Implementation Plan

### Tasks

- [x] Task 1: Dodać backendowy odczyt profilu użytkownika po `name`
  - File: `apps/api/src/services/user.service.ts`
  - Action: Dodać funkcję `getUserProfileByName(name: string)` zwracającą tylko publiczne pola (`USER_PUBLIC_SELECT`) i rzucającą `UserServiceError(404)` gdy brak wyniku.
  - Notes: Sanitizować input (`trim`, usunięcie `%`, `_`, `\\`), użyć wyszukiwania case-insensitive, zachować deterministyczny wybór rekordu (np. pierwszy po `createdAt asc`) przy nieunikalnym `name`.

- [x] Task 2: Wystawić nowy endpoint API dla profilu po nazwie
  - File: `apps/api/src/controllers/user.controller.ts`
  - Action: Dodać handler `getUserProfileByName` z walidacją parametru i mapowaniem błędów (`400` dla niepoprawnego parametru, `404` dla braku usera, `200` dla sukcesu).
  - Notes: Utrzymać aktualny styl kontrolera i obsługę `UserServiceError`.
  - File: `apps/api/src/routes/user.routes.ts`
  - Action: Dodać `GET /users/profile/:name` zabezpieczony `authMiddleware` (feature jest auth-only).
  - Notes: Zachować istniejący rate-limit profile update bez zmian dla `PATCH`.

- [x] Task 3: Rozszerzyć kontrakty współdzielone dla odczytu profilu
  - File: `packages/shared/src/schemas/auth.ts`
  - Action: Dodać schemat walidacji `profileNameParamSchema` i/lub typ DTO odpowiedzi dla publicznego profilu.
  - Notes: Unikać duplikacji typów między `apps/api` i `apps/web`; eksportować przez `packages/shared/src/index.ts` jeśli potrzebne.

- [x] Task 4: Dodać dynamiczny route profilu użytkownika na froncie
  - File: `apps/web/src/app/account/[name]/page.tsx`
  - Action: Utworzyć nową stronę, która po auth pobiera profil przez `GET /users/profile/:name` i renderuje istniejący układ konta.
  - Notes: W stanie loading użyć neutralnego placeholdera/skeleton, przy `404` pokazać czytelny stan not-found; zachować aktualne zakładki i game-mode toggle.

- [x] Task 5: Wydzielić/udoskonalić wspólny layout self/other profile
  - File: `apps/web/src/app/account/page.tsx`
  - Action: Zachować semantykę self-profile (`/account`) i ograniczyć ewentualną duplikację z `/account/[name]` poprzez prostą ekstrakcję wspólnej logiki/komponentu (bez zmiany UX).
  - Notes: Nie zmieniać obecnego redirectu auth i domyślnego zachowania zakładek.

- [x] Task 6: Dodać kontekst właściciela w headerze i ukryć owner-only elementy
  - File: `apps/web/src/components/account/profile-header.tsx`
  - Action: Rozszerzyć propsy o `isOwner` i warunkowo ukryć: mail, przyciski/akcje `Edit Profile`, dialog edycji i inne elementy owner-only.
  - Notes: Dla `isOwner=false` zachować spójny layout (brak „pustych” przestrzeni).

- [x] Task 7: Spiąć nawigację z profilem po nazwie
  - File: `apps/web/src/components/navbar.tsx`
  - Action: Upewnić się, że link do „My Account” prowadzi do `/account`; opcjonalnie dodać linki do profilu wybranego usera w miejscach social/friends (jeśli już istnieje trigger UI).
  - Notes: Zakres minimalny: nie psuć istniejącej nawigacji.

- [x] Task 8: Pokryć backend testami jednostkowymi
  - File: `apps/api/src/__tests__/services/user.service.test.ts`
  - Action: Dodać testy dla `getUserProfileByName`: success, not-found, sanitizacja parametru, deterministyczny wybór przy wielu dopasowaniach.
  - Notes: Utrzymać wzorzec mockowania `prisma.user.findFirst/findMany` zgodny z obecnymi testami.

- [ ] Task 9: Walidacja manualna end-to-end na webie
  - File: `apps/web/src/app/account/page.tsx`
  - Action: Zweryfikować self-profile i other-profile pod kątem zgodności UX oraz blokad owner-only.
  - Notes: Checklista manualna w PR: auth redirect, 404, poprawne dane, brak opcji edycji na cudzym profilu.

### Acceptance Criteria

- [ ] AC 1: Given zalogowany użytkownik wchodzi na `/account`, when strona się renderuje, then widzi swój profil i wszystkie elementy owner-only jak dotychczas.
- [ ] AC 2: Given zalogowany użytkownik wchodzi na `/account/{name}` istniejącego gracza, when profil zostanie pobrany, then widzi dane wskazanego użytkownika bez elementów owner-only.
- [ ] AC 3: Given niezalogowany użytkownik wchodzi na `/account` lub `/account/{name}`, when app sprawdza auth, then następuje redirect do `/auth`.
- [ ] AC 4: Given endpoint `GET /users/profile/:name` dostaje poprawny parametr istniejącego użytkownika, when request przejdzie auth, then API zwraca `200` i tylko publiczne pola profilu.
- [ ] AC 5: Given endpoint `GET /users/profile/:name` dostaje nazwę, która nie istnieje, when request jest wykonany, then API zwraca `404`, a frontend pokazuje stan not-found.
- [ ] AC 6: Given parametr `:name` zawiera znaki specjalne (`%`, `_`, `\\`) lub puste wartości po trim, when backend przetwarza request, then wejście jest walidowane/sanitizowane i zwracany jest błąd `400` lub `404` zgodnie z kontraktem.
- [ ] AC 7: Given istnieją co najmniej dwa konta o tej samej wartości `name`, when użytkownik otwiera `/account/{name}`, then system wybiera rekord deterministycznie według ustalonej reguły i zachowuje stabilny wynik między requestami.
- [ ] AC 8: Given użytkownik przegląda cudzy profil, when próbuje znaleźć akcje edycji profilu lub security, then te akcje nie są renderowane i nie są dostępne z UI.

## Additional Context

### Dependencies

- Brak nowych bibliotek runtime; feature realizowany na istniejącym stosie (`axios`, `zod`, `zustand`, `prisma`, `@mindarena/shared`).
- Możliwe rozszerzenie typów/schematów w `@mindarena/shared` dla kontraktu endpointu GET usera po nazwie.
- Zależność od aktualnej struktury danych `User` w Prisma (pole `name` wykorzystywane jako identyfikator URL bez gwarancji unikalności).

### Testing Strategy

- API: dodać/rozszerzyć testy Vitest w `apps/api/src/__tests__/services/user.service.test.ts` dla ścieżki `find by name` (found, not found, sanitizacja wejścia).
- API: dodać testy kontrolera użytkownika na walidację params i mapowanie kodów odpowiedzi (200/404/400).
- Web: test manualny przepływów `/account` vs `/account/[name]` (auth redirect, poprawne dane, brak owner-only).
- Web: weryfikacja edge-case dla nieistniejącej nazwy i dla wejścia z poziomu linku bezpośredniego.
- Integracja: smoke test endpointu z webem (`api.get('/users/profile/:name')`) i potwierdzenie, że interceptory auth nie psują requestu.

### Notes

- **High-risk:** `name` nie jest unikalne w modelu Prisma, więc URL może wskazywać wielu użytkowników; obecna specyfikacja przyjmuje deterministyczny wybór rekordu jako rozwiązanie tymczasowe.
- **High-risk:** Przeniesienie istniejących sekcji konta na cudzy profil może ujawnić owner-only dane przez pominięty warunek; wymagany przegląd wszystkich sekcji i komponentów zależnych od `useAuthStore`.
- **Known limitation:** URL oparty o `name` może być niestabilny po zmianie nazwy użytkownika.
- **Future consideration (out of scope):** migracja do unikalnego `username/slug` i canonical redirects z historycznych nazw.

## Review Notes

- Adversarial review completed
- Findings: 6 total, 4 fixed, 2 skipped
- Resolution approach: auto-fix
