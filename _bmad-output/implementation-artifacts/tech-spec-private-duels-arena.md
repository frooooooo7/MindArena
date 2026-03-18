---
title: "Private Duels na Arena"
slug: "private-duels-arena"
created: "2026-02-28"
status: "ready-for-dev"
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  [
    "Next.js 16",
    "Express",
    "Socket.IO 4.8",
    "Prisma/PostgreSQL",
    "Zustand",
    "sonner",
    "TypeScript",
  ]
files_to_modify:
  [
    "packages/shared/src/types/arena.ts",
    "apps/api/src/sockets/index.ts",
    "apps/api/src/sockets/handlers/game/common.ts",
    "apps/api/src/services/room.service.ts",
    "apps/api/src/services/matchmaking.service.ts",
    "apps/web/src/components/arena/arena-modes.tsx",
    "apps/web/src/app/arena/page.tsx",
    "apps/web/src/components/account/profile-header.tsx",
  ]
code_patterns:
  [
    "service-repository pattern",
    "Socket.IO user rooms (user:{id})",
    "eventBus for REST→Socket bridge",
    "SCREAMING_SNAKE_CASE events",
    "kebab-case filenames",
    "Zustand stores",
    "sonner toasts",
  ]
test_patterns: ["vitest", "apps/api/vitest.config.mts"]
---

# Tech-Spec: Private Duels na Arena

**Created:** 2026-02-28

## Overview

### Problem Statement

Gracze nie mogą wyzwać znajomych do bezpośredniego pojedynku na arenie. Jedyna dostępna opcja to losowe matchmakowanie w trybie Ranked 1v1. Brak możliwości gry towarzyskiej (bez wpływu na ELO) oraz brak mechanizmu zapraszania konkretnych osób do gry.

### Solution

System private dueli oparty na real-time zaproszeniach Socket.IO. Gracz wybiera znajomego (z modalu na /arena lub z profilu znajomego), wybiera game type (sequence/chimp), oraz tryb (ranked z ELO / casual bez ELO). Zaproszenie leci do znajomego jako real-time powiadomienie (toast/popup) niezależnie od tego, gdzie się znajduje w aplikacji. Zaproszenie ma 5-minutowy timeout, po którym jest automatycznie anulowane. Znajomy musi być online, aby mógł zostać zaproszony.

### Scope

**In Scope:**

- Modal wyboru znajomego na /arena (karta "Private Duel")
- Przycisk "Wyzwij" w profilu znajomego
- Wybór game type: sequence / chimp
- Wybór trybu: arenowy (ranked, +/-ELO) / towarzyski (casual, bez ELO)
- Real-time zaproszenia via Socket.IO z 5-min timeoutem
- Powiadomienia (toast/popup) dla zapraszanego — nawet poza /arena
- Detekcja online/offline znajomych
- Auto-anulowanie zaproszenia po 5 minutach
- Reuse istniejącej logiki gry 1v1 (sequence + chimp)

**Out of Scope:**

- Code Memory 1v1
- Blitz Tournament
- Specjalne tryby gry (3 życia, best-of-3, etc.)
- Skill-based matchmaking
- Persystencja meczów w DB (match history table)

## Context for Development

### Codebase Patterns

- **Monorepo Turborepo** — `apps/web` (Next.js 16), `apps/api` (Express + Prisma), `packages/shared`
- **Shared types = Single Source of Truth** — wszystkie DTOs, socket events, schemas w `@mindarena/shared`
- **Socket.IO personal rooms** — każdy user dołącza do `user:{userId}` na connect → targetowane eventy
- **eventBus pattern** — REST services → `eventBus.emit()` → socket handler → `io.to(user:X).emit(...)` (friend system)
- **In-memory Maps** — `GameRoom`, queue, room state — brak Redis
- **Zustand** — global state (arena store, game stores)
- **sonner** — toast system (`toast.success()`, `toast.error()`)
- **FriendRequestListener pattern** — global component, fixed popup, queue-based, auto-dismiss → wzorzec dla DuelInvitationListener

### Files to Reference

| File                                                        | Purpose                                                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/arena.ts`                        | GameRoom, GamePlayer, ARENA_EVENTS, GAME_EVENTS — trzeba dodać `rated`, `matchType`, `DUEL_EVENTS` |
| `apps/api/src/sockets/index.ts`                             | SocketManager — rejestracja handlerów, `user:{id}` rooms — trzeba dodać duel handler + presence    |
| `apps/api/src/sockets/handlers/game/common.ts`              | `processAndEmitRanks()` — jedyne miejsce ELO update, trzeba dodać guard `if (!room.rated) return`  |
| `apps/api/src/services/room.service.ts`                     | In-memory GameRoom storage, `createRoom()` — trzeba dodać `rated` param                            |
| `apps/api/src/services/matchmaking.service.ts`              | FIFO matchmaking — pass `rated: true` dla queue matches                                            |
| `apps/api/src/services/queue.service.ts`                    | In-memory queue per gameType — nie modyfikujemy, duele omijają queue                               |
| `apps/api/src/services/rank.service.ts`                     | `processMatchRanks(winnerId, loserId)` — nie modyfikujemy, guard jest w common.ts                  |
| `apps/api/src/sockets/handlers/friend.handler.ts`           | Wzorzec emitowania do specific user via eventBus                                                   |
| `apps/web/src/components/friend-request-listener.tsx`       | Wzorzec global popup — basis dla DuelInvitationListener                                            |
| `apps/web/src/components/arena/arena-modes.tsx`             | Private Duel card (UI istnieje) — trzeba podłączyć do friend picker                                |
| `apps/web/src/components/arena/arena-gametype-selector.tsx` | GameType selector modal — wzorzec UI dla duel flow                                                 |
| `apps/web/src/hooks/use-arena.ts`                           | Arena hook pattern — wzorzec dla `use-duel.ts`                                                     |
| `apps/web/src/store/arena.store.ts`                         | ArenaState Zustand store — wzorzec dla duel store                                                  |
| `apps/web/src/hooks/use-friends.ts`                         | Friends hook — dostarcza listę znajomych dla picker                                                |
| `apps/web/src/components/account/profile-header.tsx`        | Profil znajomego — trzeba dodać przycisk "Wyzwij"                                                  |
| `packages/shared/src/types/friend.ts`                       | FriendUserDTO — dane do wyświetlenia w friend picker                                               |

### Technical Decisions

1. **Duele omijają queue** — po akceptacji zaproszenia room tworzony bezpośrednio (nie przez matchmaking queue)
2. **`GameRoom.rated: boolean`** — jedyne rozróżnienie ranked/casual; guard w `processAndEmitRanks`
3. **`GameRoom.matchType: "queue" | "duel"`** — filtrowanie live feed (prywatne gry nie wyświetlane lub oznaczone)
4. **Presence tracking** — nowy `presence.service.ts` z `Map<string, Set<string>>` (userId → socketIds) na connect/disconnect
5. **DuelInvitationListener** — globalny komponent (wzór: FriendRequestListener), popup accept/decline, 5-min timeout
6. **In-memory invitations** — `Map<string, DuelInvitation>` z 5-min TTL, `setInterval` cleanup
7. **Reuse game flow** — po akceptacji duelu → ten sam `MATCH_FOUND` → ta sama gra 1v1 (sequence/chimp)

## Implementation Plan

### Tasks

#### Layer 1: Shared Types & Events (dependency-free base)

- [ ] Task 1: Dodaj `DUEL_EVENTS` i typy dueli do shared package
  - File: `packages/shared/src/types/arena.ts`
  - Action: Dodaj nowe typy i eventy:
    ```typescript
    // Duel match types
    export type MatchType = "queue" | "duel";
    
    export interface DuelInvitation {
      id: string;
      inviterId: string;
      inviterName: string;
      inviterAvatar?: string;
      inviterRankName: string;
      inviterRankPoints: number;
      targetId: string;
      gameType: string;
      rated: boolean;
      createdAt: string;
      expiresAt: string;
    }
    
    export interface SendDuelInvitePayload {
      targetUserId: string;
      gameType: string;
      rated: boolean;
    }
    
    export interface DuelAcceptPayload {
      invitationId: string;
    }
    
    export interface DuelDeclinePayload {
      invitationId: string;
    }
    
    export const DUEL_EVENTS = {
      SEND_INVITE: "duel:send-invite",
      INVITE_RECEIVED: "duel:invite-received",
      ACCEPT: "duel:accept",
      DECLINE: "duel:decline",
      CANCELLED: "duel:cancelled",
      EXPIRED: "duel:expired",
      ERROR: "duel:error",
    } as const;
    ```
  - Notes: Eventy zgodne z konwencją `namespace:action` kebab-case. `DuelInvitation` zawiera wszystkie dane potrzebne do wyświetlenia popupa u odbiorcy.

- [ ] Task 2: Rozszerz `GameRoom` o `rated` i `matchType`
  - File: `packages/shared/src/types/arena.ts`
  - Action: Dodaj dwa pola do interfejsu `GameRoom`:
    ```typescript
    export interface GameRoom {
      // ... istniejące pola ...
      rated: boolean;              // true = ranked (+/- ELO), false = casual
      matchType: MatchType;        // "queue" | "duel"
    }
    ```
  - Notes: Domyślne wartości ustawiane w `createRoom()`. `rated` kontroluje ELO update, `matchType` filtruje live feed.

- [ ] Task 3: Eksportuj nowe typy z shared index
  - File: `packages/shared/src/index.ts`
  - Action: Upewnij się, że `DUEL_EVENTS`, `DuelInvitation`, `SendDuelInvitePayload`, `DuelAcceptPayload`, `DuelDeclinePayload`, `MatchType` są eksportowane (powinny być auto-exportowane przez `export * from "./types/arena"`).
  - Notes: Wystarczy sprawdzić — `export *` pokrywa nowe eksporty.

#### Layer 2: Backend Services (core logic)

- [ ] Task 4: Stwórz presence service (online/offline tracking)
  - File: `apps/api/src/services/presence.service.ts` (NOWY)
  - Action: Stwórz serwis śledzący obecność użytkowników:
    ```typescript
    // In-memory presence tracking
    const onlineUsers: Map<string, Set<string>> = new Map(); // userId → Set<socketId>

    export function userConnected(userId: string, socketId: string): void;
    export function userDisconnected(userId: string, socketId: string): void;
    export function isUserOnline(userId: string): boolean;
    export function getUserSocketIds(userId: string): string[];
    export function getOnlineUserIds(): string[];
    ```
  - Notes: `Map<userId, Set<socketId>>` — user może mieć wiele tabów. `isUserOnline` = set has entries. Cleanup w `userDisconnected` — jeśli set jest pusty, usuń z mapy.

- [ ] Task 5: Stwórz duel service (zarządzanie zaproszeniami)
  - File: `apps/api/src/services/duel.service.ts` (NOWY)
  - Action: Stwórz serwis zarządzający zaproszeniami do dueli:
    ```typescript
    const pendingInvitations: Map<string, DuelInvitation> = new Map(); // invitationId → DuelInvitation
    const INVITATION_TTL_MS = 5 * 60 * 1000; // 5 minut
    const CLEANUP_INTERVAL_MS = 30 * 1000; // 30s check
    
    export function createInvitation(inviterId: string, inviterName: string, inviterAvatar: string | undefined, inviterRankName: string, inviterRankPoints: number, targetId: string, gameType: string, rated: boolean): DuelInvitation;
    export function getInvitation(invitationId: string): DuelInvitation | undefined;
    export function removeInvitation(invitationId: string): void;
    export function getInvitationByPlayers(inviterId: string, targetId: string): DuelInvitation | undefined;
    export function startCleanup(io: Server): void; // setInterval, emituje DUEL_EVENTS.EXPIRED do obu stron przy TTL
    ```
  - Notes: `createInvitation` generuje UUID, ustawia `expiresAt = now + 5min`. Cleanup loop iteruje po zaproszeniach, usuwa wygasłe i emituje `DUEL_EVENTS.EXPIRED` via `io.to(user:X)`. Walidacja: nie pozwalaj na duplikaty (ten sam inviter→target).

- [ ] Task 6: Rozszerz `room.service.ts` — dodaj `rated` i `matchType` do `createRoom()`
  - File: `apps/api/src/services/room.service.ts`
  - Action: 
    1. Zmień sygnaturę `createRoom()` — dodaj opcjonalne parametry `rated?: boolean` i `matchType?: MatchType`:
       ```typescript
       export function createRoom(
         roomId: string,
         gameType: string,
         player1: { id: string; name: string; socketId: string; isGuest?: boolean },
         player2: { id: string; name: string; socketId: string; isGuest?: boolean },
         initialGameData: { sequence: number[]; gridSize: number },
         options?: { rated?: boolean; matchType?: MatchType }
       ): GameRoom
       ```
    2. W tworzeniu obiektu `GameRoom` dodaj:
       ```typescript
       rated: options?.rated ?? true,      // domyślnie ranked (backward compat)
       matchType: options?.matchType ?? "queue",
       ```
    3. W `getLiveGames()` — opcjonalnie dodaj `matchType` do `LiveGameInfo` żeby frontend mógł oznaczać duele.
  - Notes: Backward compat — istniejący matchmaking nie podaje `options`, więc domyślnie `rated: true, matchType: "queue"`.

- [ ] Task 7: Dodaj `rated`/`matchType` do game service `createGameRoom()` calls
  - Files: `apps/api/src/services/games/sequence-memory.service.ts`, `apps/api/src/services/games/chimp-memory.service.ts`
  - Action: Obie funkcje `createGameRoom()` wewnętrznie wywołują `roomService.createRoom()`. Dodaj forwarding parametru `options` z `createRoom()` do tych wrapperów. Sprawdź sygnaturę — prawdopodobnie trzeba dodać `options?: { rated?: boolean; matchType?: MatchType }` do parametrów i przekazać do `roomService.createRoom(...)`.
  - Notes: Alternatywnie — jeśli game services NIE opakowują `roomService.createRoom` lecz tylko generują `initialGameData`, to zmiany nie są potrzebne tu, a tylko w `matchmaking.service.ts` i `duel.handler.ts` (które wywołują `createGameRoom` z game services). Sprawdzić actual flow w runtime.

#### Layer 3: Backend Socket Handlers

- [ ] Task 8: Stwórz duel socket handler
  - File: `apps/api/src/sockets/handlers/duel.handler.ts` (NOWY)
  - Action: Stwórz handler obsługujący flow dueli:
    ```typescript
    import { Socket, Server } from "socket.io";
    import { DUEL_EVENTS, SendDuelInvitePayload, DuelAcceptPayload, DuelDeclinePayload } from "@mindarena/shared";
    import * as duelService from "../../services/duel.service";
    import * as presenceService from "../../services/presence.service";
    import * as friendService from "../../services/friend.service"; // walidacja czy są znajomymi
    import { sequenceMemory, chimpMemory } from "../../services/games";
    
    export function registerDuelHandlers(socket: Socket, io: Server): void {
      const user = socket.data.user;
      
      // SEND_INVITE
      socket.on(DUEL_EVENTS.SEND_INVITE, async (payload: SendDuelInvitePayload) => {
        // 1. Walidacja: czy target jest online? (presenceService.isUserOnline)
        // 2. Walidacja: czy target jest znajomym? (friendService.areFriends)
        // 3. Walidacja: czy nie ma już pending zaproszenia? (duelService.getInvitationByPlayers)
        // 4. Pobierz dane inviter (name, rank, avatar) z DB lub socket.data
        // 5. duelService.createInvitation(...)
        // 6. io.to(`user:${targetId}`).emit(DUEL_EVENTS.INVITE_RECEIVED, invitation)
        // 7. Potwierdź inviterowi sukces (socket.emit z potwierdzeniem)
        // Przy błędzie: socket.emit(DUEL_EVENTS.ERROR, { message: "..." })
      });
    
      // ACCEPT
      socket.on(DUEL_EVENTS.ACCEPT, async (payload: DuelAcceptPayload) => {
        // 1. duelService.getInvitation(payload.invitationId)
        // 2. Walidacja: czy invitation istnieje i nie wygasła
        // 3. Walidacja: czy target = current user
        // 4. duelService.removeInvitation(...)
        // 5. Stwórz room (jak matchmaking.service, ale z rated/matchType z invitation):
        //    - roomId = `duel-${Date.now()}-${random}`
        //    - Pobierz socket inviter z presenceService.getUserSocketIds
        //    - createGameRoom (sequence/chimp) z options: { rated: invitation.rated, matchType: "duel" }
        //    - Join oba sockety do room
        //    - Emit MATCH_FOUND do obu (reuse tego samego payloadu co ranked)
        // 6. Notify inviter: io.to(`user:${inviterId}`).emit(DUEL_EVENTS.ACCEPTED) — opcjonalnie
      });
    
      // DECLINE
      socket.on(DUEL_EVENTS.DECLINE, (payload: DuelDeclinePayload) => {
        // 1. Walidacja invitation
        // 2. duelService.removeInvitation(...)
        // 3. io.to(`user:${inviterId}`).emit(DUEL_EVENTS.CANCELLED, { reason: "declined" })
      });
    }
    ```
  - Notes: `MATCH_FOUND` event jest już obsługiwany przez frontend do przekierowania na stronę gry — reuse tego samego flow. Inviter potrzebuje jednego aktywnego socketa do dołączenia do room.

- [ ] Task 9: Zarejestruj duel handler i presence w SocketManager
  - File: `apps/api/src/sockets/index.ts`
  - Action:
    1. Import: `import { registerDuelHandlers } from "./handlers/duel.handler";` i `import * as presenceService from "../services/presence.service";` i `import * as duelService from "../services/duel.service";`
    2. W `init()` — dodaj `duelService.startCleanup(this.io);` obok `roomService.startRoomCleanup`
    3. W `connection` callback — dodaj `presenceService.userConnected(user.id, socket.id);` po `socket.join(...)` i `registerDuelHandlers(socket, this.io);`
    4. W `disconnect` callback — dodaj `presenceService.userDisconnected(user.id, socket.id);`
  - Notes: Kolejność: presence connect → register handlers. Presence disconnect W disconnect handler.

- [ ] Task 10: Dodaj casual guard do `processAndEmitRanks()`
  - File: `apps/api/src/sockets/handlers/game/common.ts`
  - Action: Na początku funkcji `processAndEmitRanks()`, tuż po pobraniu room, dodaj guard:
    ```typescript
    if (!room || room.rated === false) {
      console.log(`[RANK] Skipping rank update (casual match in room ${roomId})`);
      return;
    }
    ```
  - Notes: Ten 1-liniowy guard pokrywa WSZYSTKIE gry (sequence + chimp), zarówno handlePlayerFailed jak i handlePlayerDisconnect. Istniejące gry rankingowe z queue nie są dotknięte (rated=true domyślnie).

- [ ] Task 11: Dodaj `areFriends()` do friend service (jeśli nie istnieje)
  - File: `apps/api/src/services/friend.service.ts`
  - Action: Dodaj funkcję sprawdzenia czy dwóch użytkowników jest znajomymi:
    ```typescript
    export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
      const friendship = await prisma.friendship.findFirst({
        where: {
          status: "ACCEPTED",
          OR: [
            { requesterId: userId1, addresseeId: userId2 },
            { requesterId: userId2, addresseeId: userId1 },
          ],
        },
      });
      return !!friendship;
    }
    ```
  - Notes: Potrzebne do walidacji w duel handler — nie chcemy aby randomowi użytkownicy mogli wysyłać duele.

- [ ] Task 12: Przekaż `rated: true` w istniejącym matchmaking flow
  - File: `apps/api/src/services/matchmaking.service.ts`
  - Action: W `createGameRoom()` (wywoływanej z `attemptMatch`), upewnij się że room jest tworzony z `rated: true, matchType: "queue"`. Najskuteczniej: jeśli `sequenceMemory.createGameRoom` / `chimpMemory.createGameRoom` przyjmują teraz `options`, przekaż `{ rated: true, matchType: "queue" }`. Jeśli nie — dodaj to bezpośrednio w `room.service.createRoom()` call chain.
  - Notes: Backward compat — upewnij się że istniejące ranked matches nadal działają z `rated: true`.

#### Layer 4: Frontend Components & Hooks

- [ ] Task 13: Stwórz duel Zustand store
  - File: `apps/web/src/store/duel.store.ts` (NOWY)
  - Action: Stwórz store zarządzający stanem duelu:
    ```typescript
    import { create } from "zustand";
    import { DuelInvitation } from "@mindarena/shared";
    
    interface DuelState {
      // Jako inviter
      pendingInvite: DuelInvitation | null;  // zaproszenie które wysłałem
      isWaitingForResponse: boolean;
      
      // Jako target (odbierane zaproszenia)
      incomingInvitations: DuelInvitation[];
      
      // Actions
      setPendingInvite: (invite: DuelInvitation | null) => void;
      setWaitingForResponse: (waiting: boolean) => void;
      addIncomingInvitation: (invite: DuelInvitation) => void;
      removeIncomingInvitation: (invitationId: string) => void;
      resetDuel: () => void;
    }
    ```
  - Notes: Wzorzec z `arena.store.ts`. Separate store bo duel state jest niezależny od arena queue state.

- [ ] Task 14: Stwórz `use-duel` hook
  - File: `apps/web/src/hooks/use-duel.ts` (NOWY)
  - Action: Hook zarządzający flow dueli (wysyłanie/odbieranie zaproszeń):
    ```typescript
    export function useDuel() {
      // Socket listeners: DUEL_EVENTS.INVITE_RECEIVED, CANCELLED, EXPIRED, ERROR
      // Actions: sendInvite(targetUserId, gameType, rated), acceptInvite(invitationId), declineInvite(invitationId), cancelInvite()
      // Uses: duelStore, socket, connectSocket
      // Cleanup: socket.off() w useEffect return
      
      return {
        pendingInvite,
        isWaitingForResponse,
        incomingInvitations,
        sendInvite,
        acceptInvite,
        declineInvite,
        cancelInvite,
      };
    }
    ```
  - Notes: Wzorzec z `use-arena.ts`. `sendInvite` emituje `DUEL_EVENTS.SEND_INVITE`. `acceptInvite` emituje `DUEL_EVENTS.ACCEPT`. Po `MATCH_FOUND` — redirect wyzwalany z `use-arena` (reuse).

- [ ] Task 15: Stwórz komponent DuelInvitationListener (global popup)
  - File: `apps/web/src/components/duel/duel-invitation-listener.tsx` (NOWY)
  - Action: Globalny komponent wzorowany na `FriendRequestListener`:
    - Nasłuchuje na `DUEL_EVENTS.INVITE_RECEIVED` via `useDuel()` hook
    - Wyświetla fixed popup (top-right, z animacją) z:
      - Avatar + nazwa zapraszającego
      - Typ gry (Sequence Memory / Chimp Memory)
      - Tryb (Ranked ⚔️ / Casual 🎮)
      - Rank zapraszającego
      - Przyciski: Accept / Decline
      - Countdown timer (wizualny — bazowany na `expiresAt`)
    - Queue-based: wiele zaproszeń stackuje się
    - Auto-dismiss po wygaśnięciu zaproszenia
    - Accept → `useDuel().acceptInvite(id)` → po `MATCH_FOUND` redirect do gry
    - Decline → `useDuel().declineInvite(id)`
  - Notes: Styling zgodny z FriendRequestListener — violet/indigo gradient, rounded-2xl, backdrop-blur. Ale z dodatkowym info o grze i timerze.

- [ ] Task 16: Zamontuj DuelInvitationListener w root layout
  - File: `apps/web/src/app/layout.tsx`
  - Action: Dodaj `<DuelInvitationListener />` obok `<FriendRequestListener />`:
    ```tsx
    import { DuelInvitationListener } from "@/components/duel/duel-invitation-listener";
    // ...
    <FriendRequestListener />
    <DuelInvitationListener />
    <Toaster position="bottom-right" />
    ```
  - Notes: Musi być globalny — zaproszenia mogą przyjść na dowolnej stronie.

- [ ] Task 17: Stwórz DuelFriendPicker modal
  - File: `apps/web/src/components/arena/duel-friend-picker.tsx` (NOWY)
  - Action: Modal do wyboru znajomego i konfiguracji duelu:
    - **Krok 1: Wybierz game type** — karty Sequence Memory / Chimp Memory (reuse stylu z `GameTypeSelector`)
    - **Krok 2: Wybierz tryb** — toggle/radio: Ranked (⚔️ +/- ELO) / Casual (🎮 no ELO)
    - **Krok 3: Wybierz znajomego** — lista online znajomych z avatarem, rank badge, status online
      - Pobierz listę z `useFriends()`.friends
      - Filtruj online — oznacz kto jest online/offline (potrzebny mechanizm, patrz Task 18)
      - Offline znajomi widoczni ale wyszarzeni z tooltipem "Offline"
    - Przycisk "Send Challenge" → `useDuel().sendInvite(targetId, gameType, rated)`
    - Po wysłaniu — wyświetl waiting state ("Waiting for {name} to accept..." z countdown)
    - Props: `isOpen`, `onClose`, `preselectedFriendId?` (dla flow z profilu)
  - Notes: Krokowy wizard ale w jednym modalu (nie multi-page). Stylowanie zgodne z `GameTypeSelector`.

- [ ] Task 18: Dodaj online status do friend listy (presence na frontend)
  - Files: 
    - `packages/shared/src/types/arena.ts` — dodaj nowy event `PRESENCE_EVENTS`:
      ```typescript
      export const PRESENCE_EVENTS = {
        FRIENDS_ONLINE: "presence:friends-online",
        FRIEND_ONLINE: "presence:friend-online",
        FRIEND_OFFLINE: "presence:friend-offline",
      } as const;
      ```
    - `apps/api/src/sockets/handlers/duel.handler.ts` lub nowy `presence.handler.ts` — przy connect/disconnect emituj status do znajomych
    - `apps/api/src/services/presence.service.ts` — dodaj `getOnlineFriendIds(userId)` — pobiera listę friendIds i filtruje online
    - `apps/web/src/hooks/use-duel.ts` lub nowy `use-presence.ts` — nasłuchuj na `PRESENCE_EVENTS`, utrzymuj `Map<userId, boolean>` statusów online
  - Action: 
    1. Przy socket connect — serwer pobiera listę znajomych usera, filtruje kto jest online, emituje `FRIENDS_ONLINE` z listą online friendIds
    2. Przy connect/disconnect — serwer emituje `FRIEND_ONLINE`/`FRIEND_OFFLINE` do wszystkich online znajomych danego usera
    3. Frontend trzyma `onlineFriends: Set<string>` w store/hook
  - Notes: Minimalistyczne podejście — nie budujemy pełnego presence systemu, tylko tyle ile potrzebne do duel flow.

- [ ] Task 19: Podłącz Private Duel card do DuelFriendPicker
  - File: `apps/web/src/app/arena/page.tsx`
  - Action:
    1. Dodaj state dla duel picker: `const [duelPickerOpen, setDuelPickerOpen] = useState(false);`
    2. Zmień `handleModeSelect` — jeśli `arenaMode === "Private Duel"`, otwórz duel picker zamiast game type selector:
       ```typescript
       const handleModeSelect = (arenaMode: string) => {
         if (arenaMode === "Private Duel") {
           setDuelPickerOpen(true);
           return;
         }
         setSelectedArenaMode(arenaMode);
         setSelectorOpen(true);
       };
       ```
    3. Dodaj `<DuelFriendPicker isOpen={duelPickerOpen} onClose={() => setDuelPickerOpen(false)} />`
  - Notes: Rankowane i Blitz nadal otwierają GameTypeSelector. Tylko Private Duel otwiera nowy flow.

- [ ] Task 20: Dodaj przycisk "Challenge to Duel" w profilu znajomego
  - File: `apps/web/src/components/account/profile-header.tsx`
  - Action:
    1. Dodaj nowe props: `onChallenge?: () => void`
    2. Obok przycisku "Add to friends" (gdy `!isOwner && isFriend`), dodaj przycisk "Challenge":
       ```tsx
       {!isOwner && isFriend && onChallenge && (
         <button onClick={onChallenge} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 transition-all">
           <Swords className="h-4 w-4" />
           Challenge
         </button>
       )}
       ```
    3. W parent page (`apps/web/src/app/account/[name]/page.tsx`) — przy kliknięciu otwórz `DuelFriendPicker` z `preselectedFriendId`.
  - Notes: Przycisk widoczny tylko gdy `isFriend === true`. Kolor cyan-to-blue zgodny z Private Duel card na arenie. Import `Swords` z lucide-react.

- [ ] Task 21: Dodaj eksporty z `apps/web/src/components/arena/index.ts`
  - File: `apps/web/src/components/arena/index.ts`
  - Action: Dodaj eksport nowego komponentu `DuelFriendPicker`.
  - Notes: Sprawdź istniejący barrel export i dodaj nową linię.

### Acceptance Criteria

#### Flow wysyłania zaproszenia

- [ ] AC 1: Given gracz jest zalogowany na /arena, when klika "Enter Arena" na karcie "Private Duel", then otwiera się DuelFriendPicker modal (NIE GameTypeSelector).
- [ ] AC 2: Given DuelFriendPicker jest otwarty, when gracz wybiera game type, tryb (ranked/casual), i online znajomego, then przycisk "Send Challenge" jest aktywny.
- [ ] AC 3: Given gracz kliknął "Send Challenge", when znajomy jest online, then zaproszenie jest wysyłane via socket i gracz widzi waiting state z countdown.
- [ ] AC 4: Given gracz kliknął "Send Challenge", when znajomy jest offline, then gracz widzi komunikat błędu "Użytkownik jest offline".
- [ ] AC 5: Given gracz wysłał zaproszenie, when minie 5 minut bez odpowiedzi, then zaproszenie jest automatycznie anulowane i obie strony są powiadomione.

#### Flow odbierania zaproszenia

- [ ] AC 6: Given gracz jest zalogowany (na dowolnej stronie), when inny gracz wysyła mu zaproszenie do duelu, then pojawia się popup (DuelInvitationListener) z danymi: imię, gra, tryb, rank, countdown.
- [ ] AC 7: Given popup zaproszenia jest widoczny, when gracz klika "Accept", then tworzony jest game room i obie strony są przekierowane do gry (via MATCH_FOUND).
- [ ] AC 8: Given popup zaproszenia jest widoczny, when gracz klika "Decline", then zaproszenie jest anulowane i zapraszający widzi powiadomienie o odrzuceniu.
- [ ] AC 9: Given popup zaproszenia jest widoczny, when zaproszenie wygaśnie (5 min), then popup znika automatycznie.

#### Tryby rated/casual

- [ ] AC 10: Given duel jest w trybie ranked, when gra się kończy, then ELO obu graczy jest aktualizowane (processAndEmitRanks działa normalnie).
- [ ] AC 11: Given duel jest w trybie casual, when gra się kończy, then ELO NIE jest aktualizowane (processAndEmitRanks jest pominięty).
- [ ] AC 12: Given duel jest w trybie casual, when gra się kończy, then wynik jest nadal zapisywany do GameResult (mode: "arena").

#### Online presence

- [ ] AC 13: Given gracz otwiera DuelFriendPicker, when ma znajomych online i offline, then online znajomi mają zielony indicator, a offline są wyszarzeni z informacją "Offline".
- [ ] AC 14: Given gracz otwiera DuelFriendPicker, when znajomy się połączy/rozłączy, then status zmienia się w real-time.

#### Profil znajomego

- [ ] AC 15: Given gracz ogląda profil znajomego, when są znajomymi, then widzi przycisk "Challenge" obok "Already friends".
- [ ] AC 16: Given gracz klika "Challenge" na profilu, when DuelFriendPicker się otwiera, then znajomy jest pre-wybrany.

#### Integracja z istniejącym systemem

- [ ] AC 17: Given istniejący ranked 1v1 via queue, when gracz wchodzi do kolejki i gra, then nic się nie zmienia — rated=true, matchType="queue", ELO działa jak dotychczas.
- [ ] AC 18: Given duel game room, when gra się toczy, then wykorzystywane są dokładnie te same game handlers (sequence/chimp) co w ranked 1v1.

## Additional Context

### Dependencies

- **Socket.IO 4.8** — istniejąca infrastruktura, brak nowych zależności
- **Prisma/PostgreSQL** — tylko do odczytu `Friendship` (areFriends), brak zmian schema
- **Zustand** — nowy `duel.store.ts`
- **sonner** — toast powiadomienia
- **lucide-react** — ikony (Swords, Users, etc.)
- **Istniejące game services** — `sequence-memory.service.ts`, `chimp-memory.service.ts` — reuse bez zmian w logice gry
- **Friends system** — `useFriends()` hook do pobrania listy znajomych

**Żadne nowe npm packages nie są potrzebne.**

### Testing Strategy

**Unit Tests (vitest):**
- `presence.service.ts` — `userConnected`, `userDisconnected`, `isUserOnline`, edge cases (multi-tab, reconnect)
- `duel.service.ts` — `createInvitation`, `removeInvitation`, TTL expiry, duplicate prevention
- `room.service.ts` — `createRoom` z nowymi opcjami rated/matchType
- `processAndEmitRanks` — guard dla `rated === false`

**Integration Tests (socket):**
- Duel flow end-to-end: invite → accept → room created → MATCH_FOUND emitted
- Duel flow: invite → decline → inviter notified
- Duel flow: invite → timeout (5min) → both notified
- Casual duel: game end → no rank update
- Ranked duel: game end → rank update
- Offline target: invite → error response

**Manual Testing:**
1. Otwórz dwie przeglądarki z różnymi kontami (znajomi)
2. Na /arena kliknij Private Duel → wybierz grę, tryb, znajomego → wyślij
3. Sprawdź popup u znajomego → Accept → gra startuje
4. Sprawdź Decline flow
5. Sprawdź timeout (skróć do 30s na czas testów)
6. Sprawdź ranked vs casual — czy ELO się zmienia / nie zmienia
7. Sprawdź przycisk Challenge na profilu znajomego
8. Sprawdź offline znajomego — powinien być wyszarzony

### Notes

**Ryzyka:**
- **Multi-tab presence** — user z wieloma tabami: przy disconnect jednego tabu nie powinien być oznaczony jako offline jeśli drugi tab jest aktywny. Rozwiązane przez `Set<socketId>` per user.
- **Race condition przy accept** — dwóch userow może próbować zaakceptować ten sam duel. Rozwiązane przez `removeInvitation()` — pierwszy accept usuwa, drugi dostaje error.
- **Socket reconnect** — jeśli inviter się rozłączy i połączy ponownie, pending invite może nie mieć poprawnego socketId. Invite trzeba anulować przy disconnect inviter (lub zaktualizować socketId).

**Przyszłe rozszerzenia (poza zakresem):**
- Specjalne tryby gry (3 życia, best-of-3)
- Duel history w DB
- Duel z nieznajoamymi (via link/code)
- Spectator mode dla dueli
- Code Memory 1v1
