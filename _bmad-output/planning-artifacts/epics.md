---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/product-brief-memoryGAMES-2026-02-10.md']
---

# memoryGAMES - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for memoryGAMES, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Gracz może dołączyć do kolejki matchmakingowej (Sequence Memory).
FR2: System paruje graczy o zbliżonym ELO.
FR3: Gracz musi potwierdzić gotowość przed startem meczu.
FR4: Synchronizacja stanu gry w czasie rzeczywistym przez Socket.IO.
FR5: Walidacja ruchów i zarządzanie timerem oparte na serwerze (Backend-authoritative).
FR6: System rozstrzygania meczów przerwanych (disconnect handling).
FR7: Obliczanie punktów MindRank (+8/-8) i aktualizacja w bazie danych (Prisma).
FR8: Implementacja Recovery Logic (ochrona przed spadkiem przy serii porażek/tilt).
FR9: Animowany ekran "Premium Success" po meczu (Tailwind 4).
FR10: Publiczne profile z wizualną ikoną rangi i stosunkiem wygranych do przegranych (win/loss ratio).

### NonFunctional Requirements

NFR1: Opóźnienie Socket.IO (round-trip) < 200ms.
NFR2: Renderowanie UI < 16ms (60 FPS).
NFR3: Czas ładowania strony (TTI) < 2.5s na połączeniu 4G.
NFR4: Integralność obliczeń ELO wyłącznie po stronie serwera.
NFR5: Zgodność z RODO (GDPR) w zakresie danych profilowych.
NFR6: Monitorowanie wzorców w celu zabezpieczenia przed smurfingiem/boostingiem.
NFR7: Semantyczny HTML (WCAG 2.1 AA) dla nawigacji i profili.
NFR8: Skalowalność do 500 równoległych parowań graczy.

### Additional Requirements

- **Starter Template**: Custom Hybrid Monorepo (Turbo) wykorzystujący Next.js 16, Tailwind 4, Socket.IO 4.8 i Prisma 6.
- **Backend Architecture**: Implementacja `RankService` w `apps/api` do obliczeń i trwałości danych.
- **Shared Logic**: Algorytm ELO jako czysta funkcja w pakiecie `@mindarena/shared`.
- **UI Patterns**: Użycie komponentów `Skeleton` dla wszystkich sekcji ładowania danych rankingowych.
- **UX Flow**: Frontend oczekuje na zdarzenie z serwera (`ARENA_RANK_UPDATED`) przed odtworzeniem animacji sukcesu (Premium Feedback Loop).
- **Naming Conventions**: camelCase dla pól bazy danych, SCREAMING_SNAKE_CASE dla zdarzeń Socket.IO, kebab-case dla plików i komponentów.
- **Error Handling**: Użycie `try-finally` w akcjach formularzy do resetowania flag ładowania.

### FR Coverage Map

- **FR1 (Queue Join):** Epic 1
- **FR2 (Pairing):** Epic 1
- **FR3 (Readiness):** Epic 1
- **FR4 (Sync):** Epic 2
- **FR5 (Validation):** Epic 2
- **FR6 (Disconnect Handling):** Epic 2
- **FR7 (ELO Calculation):** Epic 3
- **FR8 (Tilt Protection):** Epic 3
- **FR9 (Success Animation):** Epic 4
- **FR10 (Rank Identity):** Epic 4

## Epic List

### Epic 1: Arena Matchmaking & Readying [ALREADY IMPLEMENTED]
Gracze mogą wejść do kolejki i zostać sparowani z przeciwnikiem o zbliżonym poziomie umiejętności, co jest pierwszym krokiem do rywalizacji.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Core Arena Combat (1v1 Sequence Memory) [ALREADY IMPLEMENTED]
Zapewnienie fundamentu uczciwej rywalizacji – płynna gra w czasie rzeczywistym z pełną walidacją po stronie serwera i obsługą sytuacji awaryjnych (rozłączenia).
**FRs covered:** FR4, FR5, FR6

### Epic 3: MindRank Progression Engine & Persistence
Implementacja "mózgu" rankingowego – algorytm ELO obliczający punkty po każdym meczu oraz system ochrony przed spadkiem (Recovery Logic).
**FRs covered:** FR7, FR8

### Epic 4: Premium Feedback Loop & Athlete Identity
Wizualne zwieńczenie wysiłku gracza poprzez spektakularne animacje sukcesu oraz budowanie prestiżu na publicznych profilach z ikonami rang.
**FRs covered:** FR9, FR10

## Epic Details

### Epic 1: Arena Matchmaking & Readying [ALREADY IMPLEMENTED]

Gracze mogą wejść do kolejki i zostać sparowani z przeciwnikiem o zbliżonym poziomie umiejętności, co jest pierwszym krokiem do rywalizacji.

Gracze mogą wejść do kolejki i zostać sparowani z przeciwnikiem o zbliżonym poziomie umiejętności, co jest pierwszym krokiem do rywalizacji.

#### Story 1.1: Dołączanie do kolejki Sequence Memory

As a gracz,
I want móc dołączyć do kolejki matchmakingowej dla gry Sequence Memory,
So that system mógł znaleźć mi przeciwnika.

**Acceptance Criteria:**

**Given** Użytkownik jest zalogowany i znajduje się w lobby Areny.
**When** Użytkownik kliknie przycisk "Szukaj meczu" dla trybu Sequence Memory.
**Then** System dodaje gracza do `queue.service.ts` na backendzie.
**And** Interfejs użytkownika wyświetla stan oczekiwania (matchmaking overlay) z licznikiem czasu.

#### Story 1.2: Matchmaking oparty na punktach MindRank

As a gracz,
I want być parowany z osobami o zbliżonej liczbie punktów,
So that mecze były sprawiedliwe i ambitne.

**Acceptance Criteria:**

**Given** W kolejce znajduje się co najmniej dwóch graczy.
**When** `matchmaking.service.ts` uruchamia cykl parowania.
**Then** System paruje graczy, których różnica ELO mieści się w zdefiniowanym progu (zgodnie z NFR8).
**And** System tworzy nowy pokój gry za pomocą `room.service.ts` i wysyła event `ARENA_EVENTS.MATCH_FOUND`.

#### Story 1.3: Potwierdzenie gotowości (Accept Match)

As a gracz,
I want potwierdzić gotowość po znalezieniu przeciwnika,
So that upewnić się, że obaj gracze są obecni przy klawiaturze przed startem.

**Acceptance Criteria:**

**Given** System znalazł przeciwnika i wyświetlił modal potwierdzenia.
**When** Obaj gracze klikną "Akceptuj" w ciągu wyznaczonego czasu (np. 15s).
**Then** System emituje event startu gry i przenosi graczy do widoku `1v1/page.tsx`.
**And** Jeśli jeden z graczy nie zaakceptuje, mecz jest anulowany, a drugi gracz wraca na początek kolejki.

### Epic 2: Core Arena Combat (1v1 Sequence Memory) [ALREADY IMPLEMENTED]

Zapewnienie fundamentu uczciwej rywalizacji – płynna gra w czasie rzeczywistym z pełną walidacją po stronie serwera i obsługą sytuacji awaryjnych (rozłączenia).

Zapewnienie fundamentu uczciwej rywalizacji – płynna gra w czasie rzeczywistym z pełną walidacją po stronie serwera i obsługą sytuacji awaryjnych (rozłączenia).

#### Story 2.1: Synchronizacja sekwencji Sequence Memory (Real-time)

As a gracz,
I want widzieć tę samą sekwencję co mój przeciwnik w tym samym czasie,
So that myśleliśmy mieli równe szanse na start.

**Acceptance Criteria:**

**Given** Mecz został rozpoczęty i obaj gracze są połączeni przez Socket.IO.
**When** Serwer generuje nową rundę sekwencji.
**Then** System emituje sekwencję do obu klientów jednocześnie (`GAME_EVENTS.SEQUENCE_START`).
**And** Interfejs użytkownika u obu graczy blokuje możliwość wprowadzania danych podczas fazy prezentacji.

#### Story 2.2: Backend-Authoritative Walidacja Ruchów

As a system,
I want walidować każdy ruch gracza na serwerze,
So that zapobiec oszustwom i błędnym stanom gry.

**Acceptance Criteria:**

**Given** Trwa faza wprowadzania danych przez gracza.
**When** Gracz klika kafelek na froncie.
**Then** Klient wysyła ruch do `sequence.handler.ts` na backendzie.
**And** Serwer sprawdza poprawność ruchu względem wygenerowanej sekwencji i zwraca wynik (Correct/Fail) bezpośrednio do klienta.

#### Story 2.3: Obsługa Walkowera przy Rozłączeniu

As a gracz,
I want aby system sprawiedliwie rozstrzygał mecze w przypadku rozłączenia przeciwnika,
So that nie tracił czasu na nieaktywne sesje.

**Acceptance Criteria:**

**Given** Trwa aktywny mecz 1v1.
**When** Jeden z graczy traci połączenie z socketem na czas dłuższy niż 10 sekund.
**Then** System przyznaje natychmiastowe zwycięstwo walkowerem graczowi, który pozostał połączony.
**And** System emituje `ARENA_EVENTS.OPPONENT_DISCONNECTED` i zamyka pokój gry, przygotowując wynik do zapisu.

### Epic 3: MindRank Progression Engine & Persistence

Implementacja "mózgu" rankingowego – algorytm ELO obliczający punkty po każdym meczu z twardo zakodowanymi progami rang.

#### Story 3.1: Implementacja algorytmu MindRank (ELO) z progami rang [DONE]

As a system,
I want obliczać zmianę punktów rankingowych (+/- 8) oraz przypisywać odpowiednią rangę,
So that ranga gracza na stałe odzwierciedlała jego poziom umiejętności.

**Acceptance Criteria:**

**Given** Mecz Sequence Memory 1v1 został zakończony.
**When** `rank.service.ts` przetwarza wynik meczu na backendzie.
**Then** Punkty użytkownika w bazie danych są aktualizowane o stałą wartość (np. +/- 8 pkt).
**And** Ranga (Neuron, Synapsa, Kora, Geniusz) jest przeliczana na podstawie twardo zakodowanych progów punktowych w `@mindarena/shared`.

#### Story 3.2: Synchronizacja i rozgłaszanie aktualizacji rankingu [DONE]

As a gracz,
I want otrzymać natychmiastowe powiadomienie o zmianie mojego rankingu,
So that interfejs mógł zainicjować animację sukcesu (Premium Feedback Loop).

**Acceptance Criteria:**

**Given** Zapis punktów w bazie danych przez Prisma zakończył się sukcesem.
**When** Serwis backendowy potwierdzi aktualizację rekordu gracza.
**Then** Serwer emituje zdarzenie `ARENA_RANK_UPDATED` do obu graczy uczestniczących w meczu.
**And** Obiekt zdarzenia zawiera: `currentPoints`, `oldPoints`, `rankName` oraz `rankIcon`.

### Epic 4: Premium Feedback Loop & Athlete Identity

Wizualne zwieńczenie wysiłku gracza poprzez spektakularne animacje sukcesu oraz budowanie prestiżu na publicznych profilach z ikonami rang.

#### Story 4.1: Animowany ekran podsumowania meczu (Premium Success) [DONE]

As a gracz,
I want zobaczyć wysokiej jakości animację zmiany moich punktów po meczu,
So that poczuć stawkę rywalizacji i satysfakcję z postępu.

**Acceptance Criteria:**

**Given** Frontend otrzymał event `ARENA_RANK_UPDATED` z serwera.
**When** Wyświetlany jest ekran podsumowania meczu (`game-result-modal.tsx`).
**Then** System odtwarza animację "liczników" rosnących/malejących punktów oraz paska postępu rangi.
**And** Przy awansie na wyższą rangę odtwarzane są efekty cząsteczkowe (particles) oraz dedykowany efekt dźwiękowy sukcesu.

#### Story 4.2: Wizualna Identyfikacja Rangi na Profilu [DONE]

As a gracz,
I want aby moja ranga była widoczna na moim profilu publicznym oraz w lobby,
So that budować swój prestiż w społeczności MindArena.

**Acceptance Criteria:**

**Given** Użytkownik posiada przypisaną rangę i historię meczów (już zaimplementowaną).
**When** Wyświetlana jest strona konta (`account/page.tsx`) lub nagłówek Areny.
**Then** System renderuje aktualną ikonę rangi (np. Neuron, Synapsa) obok istniejących statystyk.
**And** Wszystkie nowe elementy UI rangi są ładowane z użyciem `Skeleton` loaderów przed wyświetleniem danych docelowych.
