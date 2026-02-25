---
title: 'Avatar Upload System (Supabase Storage)'
slug: 'avatar-upload-supabase'
created: '2026-02-24T13:38:00+01:00'
status: 'Completed'
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
tech_stack: ['Express', 'Prisma', 'Supabase Storage', 'Next.js', 'React', 'Tailwind CSS', 'Multer', 'Sharp']
files_to_modify: ['apps/api/prisma/schema.prisma', 'apps/api/src/config/env.ts', 'apps/api/src/lib/supabase.ts', 'apps/api/src/controllers/avatar.controller.ts', 'apps/api/src/services/avatar.service.ts', 'apps/api/src/routes/avatar.routes.ts', 'apps/api/src/index.ts', 'apps/api/package.json', 'packages/shared/src/schemas/auth.ts', 'packages/shared/src/types/friend.ts', 'apps/web/src/components/account/profile-header.tsx', 'apps/web/src/components/ui/user-avatar.tsx', 'apps/web/src/store/auth.store.ts', 'apps/web/src/components/account/avatar-upload-dialog.tsx']
code_patterns: ['Service-Controller Pattern', 'Multer Middleware', 'Supabase Storage SDK', 'React Dialog + File Input', 'Zustand Store Update']
test_patterns: ['Unit tests for avatar.service.ts']
---

# Tech-Spec: Avatar Upload System (Supabase Storage)

**Created:** 2026-02-24T13:38:00+01:00

## Overview

### Problem Statement

Użytkownicy nie mogą ustawić niestandardowego zdjęcia profilowego. Obecnie wyświetlana jest jedynie inicjałka z imienia wewnątrz gradientowego kółka (komponent `UserAvatar`). Brak personalnego avatara zmniejsza poczucie tożsamości użytkownika i atrakcyjność sekcji Social/Friends.

### Solution

Wdrożenie pełnego systemu uploadu avatarów opartego na **Supabase Storage** (darmowy tier: 1GB, 2GB transfer/mies). Express API przyjmuje plik przez `multer`, przetwarza go biblioteką `sharp` (resize do 256×256, konwersja na WebP, walidacja magic bytes), a następnie uploaduje do publicznego bucketu Supabase. URL avatara jest zapisywany w polu `avatarUrl` modelu `User` (Prisma) i propagowany do frontendu. Komponent `UserAvatar` już obsługuje prop `avatarUrl` — wystarczy go przekazywać z prawdziwymi danymi.

### Scope

**In Scope:**
- Modyfikacja `schema.prisma` — dodanie pola `avatarUrl` do modelu `User`.
- Nowy serwis `avatar.service.ts` obsługujący walidację, przetwarzanie i upload.
- Nowy endpoint REST `POST /users/avatar` z middleware `multer`.
- Nowy endpoint REST `DELETE /users/avatar` do usuwania avatara.
- Inicjalizacja klienta Supabase w `apps/api/src/lib/supabase.ts`.
- Dodanie zmiennych `SUPABASE_URL` i `SUPABASE_SERVICE_KEY` do `env.ts`.
- Frontend: Dialog do edycji avatara na stronie `/account` (wyzwalany przyciskiem "Edit Profile" w `ProfileHeader`).
- Frontend: Podgląd pliku przed uploadem, loading state, error handling.
- Aktualizacja interfejsu `User` w `@mindarena/shared` o pole `avatarUrl`.
- Propagacja `avatarUrl` do `FriendUserDTO`, `SearchPlayersResponse` i wszędzie gdzie wyświetlany jest `UserAvatar`.

**Out of Scope:**
- Crop/rotate po stronie klienta (późniejsze rozszerzenie).
- Avatar grupy/clanu.
- Avatar generowany losowo (DiceBear) — potencjalne follow-up jako domyślna wartość.

## Context for Development

### Architektura przepływu

```
┌─────────────┐     POST /users/avatar      ┌──────────────┐     upload()      ┌──────────────────┐
│   Frontend   │  ─────────────────────────> │  Express API  │ ───────────────> │ Supabase Storage  │
│  (Next.js)   │  multipart/form-data        │  multer →     │  sharp → webp    │  avatars/{id}.webp│
│              │                             │  avatar.ctrl  │                  │                   │
│              │  <───────────────────────── │  → service    │ <─────────────── │  → public URL     │
│              │  { avatarUrl: "https://…" } │  → prisma     │  publicUrl       │                   │
└─────────────┘                              └──────────────┘                   └──────────────────┘
```

### Codebase Patterns

1. **Service-Controller Pattern**: Już stosowany w projekcie (friend, auth, stats). Controller waliduje request, service realizuje logikę.
2. **Multer Middleware**: Nowa zależność. Obsługuje `multipart/form-data` na poziomie Express middleware. Korzystamy z `memoryStorage` (plik w RAM → sharp → Supabase, nigdy na dysk).
3. **Sharp**: Nowa zależność. Serwer-side image processing: resize, konwersja na WebP, compression.
4. **Supabase Client**: Nowa zależność (`@supabase/supabase-js`). Inicjalizowany singleton w `lib/supabase.ts` z `SERVICE_ROLE_KEY` (nie anon key — backend-only).
5. **Nazewnictwo plików w Storage**: `avatars/{userId}.webp` — deterministyczne, nadpisuje stary avatar bez potrzeby usuwania.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `apps/api/prisma/schema.prisma` | Dodanie pola `avatarUrl String?` do modelu `User`. |
| `apps/api/src/config/env.ts` | Dodanie `SUPABASE_URL` i `SUPABASE_SERVICE_KEY`. |
| `apps/api/src/lib/supabase.ts` | Singleton klienta Supabase (nowy plik). |
| `apps/api/src/services/avatar.service.ts` | Logika: walidacja → sharp → upload → prisma update (nowy plik). |
| `apps/api/src/controllers/avatar.controller.ts` | Obsługa HTTP, multer middleware (nowy plik). |
| `apps/api/src/routes/avatar.routes.ts` | Route `POST /users/avatar`, `DELETE /users/avatar` (nowy plik). |
| `packages/shared/src/schemas/auth.ts` | Rozszerzenie `interface User` o `avatarUrl?: string | null`. |
| `packages/shared/src/types/friend.ts` | Rozszerzenie `FriendUserDTO` o `avatarUrl`. |
| `apps/web/src/components/account/profile-header.tsx` | Wyświetlanie avatara + przycisk "Edit Profile" otwierający dialog. |
| `apps/web/src/components/account/avatar-upload-dialog.tsx` | Dialog do wybrania pliku, podglądu i uploadu (nowy plik). |
| `apps/web/src/components/ui/user-avatar.tsx` | Już gotowy — obsługuje `avatarUrl` prop. |
| `apps/web/src/store/auth.store.ts` | Aktualizacja `user.avatarUrl` po udanym uploadzie. |

### Technical Decisions

1. **Supabase Storage z Service Role Key**: Unikamy konfigurowania RLS (Row Level Security) po stronie Supabase. Backend ma pełne uprawnienia do bucketu. Frontend NIGDY nie komunikuje się bezpośrednio z Supabase — zawsze przez Express API.
2. **WebP format**: Mniejszy rozmiar (o 25-34% mniejszy niż JPEG), szeroka obsługa przeglądarek, lepsza jakość. Sharp konwertuje dowolny input (JPEG, PNG, GIF, AVIF) na WebP.
3. **Deterministyczne nazwy plików**: `avatars/{userId}.webp` — re-upload nadpisuje plik, więc stare avatary nie zajmują miejsca. Nie trzeba śledzić starych URLi.
4. **Memory storage w multer**: Plik nigdy nie trafia na dysk serwera — jest przetwarzany w pamięci. To zapobiega wektorom ataku opartym o pliki tmp oraz eliminuje konieczność czyszczenia.
5. **Przetwarzanie server-side (Sharp)**: Gwarantuje spójny rozmiar i format niezależnie od tego, co wyślą użytkownicy. Zmniejsza rozmiar pliku przed uploadem do Supabase.
6. **Publiczny bucket**: Avatary to publiczne zasoby — NIE wymagają autoryzacji przy odczycie. Upload jest chroniony przez `authMiddleware` + rate limiting.

## Implementation Plan

### Prerequisites (ONE-TIME SETUP)

Przed rozpoczęciem implementacji, developer musi:

1. **Utworzyć projekt Supabase** na [supabase.com](https://supabase.com) (darmowy tier).
2. **Pobrać dane z Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (NIE anon key) → `SUPABASE_SERVICE_KEY`
3. **Utworzyć bucket `avatars`** w Supabase Dashboard → Storage:
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: `5MB`
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`
4. **Dodać zmienne do pliku `.env`** w `apps/api/`:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

### Tasks

- [x] Task 1: Aktualizacja schematu Prisma
  - **File**: `apps/api/prisma/schema.prisma`
  - **Action**: Dodać pole `avatarUrl String?` do modelu `User`.
  - **Migration**: `npx prisma migrate dev --name add_avatar_url`
  - **Notes**: Pole opcjonalne (`String?`) — null oznacza brak avatara (fallback do inicjałki).

- [x] Task 2: Aktualizacja interfejsu User w shared
  - **File**: `packages/shared/src/schemas/auth.ts`
  - **Action**: Dodać pole `avatarUrl?: string | null` do interfejsu `User`.
  - **Notes**: Pole opcjonalne — kompatybilne wstecz z istniejącym kodem.

- [x] Task 3: Aktualizacja FriendUserDTO w shared
  - **File**: `packages/shared/src/types/friend.ts`
  - **Action**: Dodać pole `avatarUrl?: string | null` do interfejsu `FriendUserDTO`.
  - **Notes**: Propaguje avatar do: listy znajomych, wyszukiwania graczy, powiadomień o zaproszeniach.

- [x] Task 4: Instalacja nowych zależności backendowych
  - **Cwd**: `apps/api`
  - **Command**: `npm install @supabase/supabase-js multer sharp && npm install -D @types/multer @types/sharp`
  - **Notes**: `multer` do obsługi `multipart/form-data`, `sharp` do image processing, `@supabase/supabase-js` do komunikacji ze Storage API.

- [x] Task 5: Konfiguracja zmiennych środowiskowych
  - **File**: `apps/api/src/config/env.ts`
  - **Action**: Dodać `SUPABASE_URL` i `SUPABASE_SERVICE_KEY` do obiektu `env`.
  - **Implementation**:
    ```typescript
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || "",
    ```
  - **Notes**: Oba pola wymagane w produkcji. W dev mogą być puste (upload wyrzuci błąd z czytelnym komunikatem).

- [x] Task 6: Inicjalizacja klienta Supabase
  - **File**: `apps/api/src/lib/supabase.ts` (NOWY)
  - **Action**: Eksportować singleton `supabase` z `createClient()`.
  - **Implementation**:
    ```typescript
    import { createClient } from "@supabase/supabase-js";
    import { env } from "../config/env";

    export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
    export const AVATAR_BUCKET = "avatars";
    ```
  - **Notes**: Używamy `SERVICE_ROLE_KEY` — pomija RLS. NIE eksponować tego na frontend.

- [x] Task 7: Implementacja Avatar Service
  - **File**: `apps/api/src/services/avatar.service.ts` (NOWY)
  - **Action**: Implementacja klasy/modułu `AvatarService` z metodami:
    - `uploadAvatar(userId: string, fileBuffer: Buffer, mimeType: string): Promise<string>`:
      1. Walidacja magic bytes (sprawdzenie nagłówka pliku, nie ufamy `Content-Type`).
      2. Przetworzenie `sharp(buffer).resize(256, 256, { fit: 'cover' }).webp({ quality: 80 })`.
      3. Upload do Supabase: `supabase.storage.from(AVATAR_BUCKET).upload(path, processed, { upsert: true })`.
      4. Pobranie publicznego URL: `supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)`.
      5. Aktualizacja w Prisma: `prisma.user.update({ where: { id }, data: { avatarUrl } })`.
      6. Return `avatarUrl`.
    - `deleteAvatar(userId: string): Promise<void>`:
      1. Usunięcie z Supabase: `supabase.storage.from(AVATAR_BUCKET).remove([path])`.
      2. Aktualizacja Prisma: `prisma.user.update({ data: { avatarUrl: null } })`.
  - **Walidacja magic bytes**:
    ```typescript
    const ALLOWED_SIGNATURES: Record<string, number[]> = {
      "image/jpeg": [0xFF, 0xD8, 0xFF],
      "image/png": [0x89, 0x50, 0x4E, 0x47],
      "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF
      "image/gif": [0x47, 0x49, 0x46],
    };
    ```
  - **Notes**: `upsert: true` nadpisuje istniejący plik — nie trzeba ręcznie usuwać starego avatara przy re-uploadzie.

- [x] Task 8: Implementacja Avatar Controller
  - **File**: `apps/api/src/controllers/avatar.controller.ts` (NOWY)
  - **Action**: Dwa handlery:
    - `uploadAvatar`: Sprawdza `req.file` (istnieje? rozmiar < 5MB? MIME OK?), wywołuje `avatarService.uploadAvatar()`.
    - `deleteAvatar`: Wywołuje `avatarService.deleteAvatar()`.
  - **Multer config**: `multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })` — odrzuci za duże pliki na poziomie middleware.
  - **Notes**: `fileFilter` sprawdza `mimetype` (pierwsza linia obrony), `AvatarService` sprawdza magic bytes (druga linia obrony).

- [x] Task 9: Routing i rejestracja endpointów
  - **File**: `apps/api/src/routes/avatar.routes.ts` (NOWY), `apps/api/src/index.ts` (UPDATE)
  - **Action**:
    - `POST /users/avatar` — `authMiddleware` → `multer.single('avatar')` → `avatarController.uploadAvatar`
    - `DELETE /users/avatar` — `authMiddleware` → `avatarController.deleteAvatar`
    - Rate limiting: max 5 uploadów na minutę per user.
  - **Registration w index.ts**: `app.use("/users", avatarRoutes);`
  - **Notes**: Ścieżka `/users/avatar` zamiast `/avatar` — semantycznie poprawna i gotowa na rozszerzenie o inne endpointy `/users/*`.

- [x] Task 10: Propagacja avatarUrl w istniejących endpointach
  - **Files**: 
    - `apps/api/src/repositories/friend.repository.ts` — dodać `avatarUrl` do `select` w query'ach zwracających `User` data (friends list, search, pending requests).
    - `apps/api/src/services/auth.service.ts` — upewnić się, że `avatarUrl` jest zwracane w payloadzie logowania/refresha.
  - **Notes**: Wszędzie gdzie API zwraca dane usera lub `FriendUserDTO`, musi zawierać `avatarUrl`.

- [x] Task 11: Frontend — Dialog uploadu avatara
  - **File**: `apps/web/src/components/account/avatar-upload-dialog.tsx` (NOWY)
  - **Action**: Komponent bazujący na `@radix-ui/react-dialog` (już w projekcie jako zależność):
    - Trigger: Kliknięcie na ikonę edycji / przycisk "Edit Profile" na avatarze w `ProfileHeader`.
    - Content: `<input type="file" accept="image/*">` + podgląd wybranego pliku.
    - Upload: `FormData` z plikiem → `axios.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })`.
    - Po sukcesie: Aktualizacja `authStore.updateUser({ ...user, avatarUrl })`.
    - Loading state: `Loader2` spinner, disabled przycisk.
    - Error state: Komunikat o błędzie pod podglądem.
    - Przycisk "Remove Avatar": Widoczny gdy avatar istnieje → `axios.delete('/users/avatar')`.
  - **Design**: Glassmorphism, gradientowy border, zgodne z Premium Aesthetics projektu.

- [x] Task 12: Frontend — Aktualizacja ProfileHeader
  - **File**: `apps/web/src/components/account/profile-header.tsx`
  - **Action**: 
    - Zastąpić hardcoded inicjałkę komponentem `UserAvatar` z propem `avatarUrl={user.avatarUrl}` w większym rozmiarze.
    - Dodać overlay na avatarze z ikoną kamery i napisem "Change" (widoczne on hover).
    - Kliknięcie avatara otwiera `AvatarUploadDialog`.
    - Przycisk "Edit Profile" otwiera ten sam dialog.
  - **Notes**: `UserAvatar.tsx` już obsługuje `avatarUrl` prop — nie wymaga zmian.

- [x] Task 13: Frontend — Propagacja avatarUrl do list znajomych
  - **Files**: 
    - `apps/web/src/components/account/friends-section.tsx` — zamienić `avatarUrl={null}` na `avatarUrl={f.friend?.avatarUrl ?? null}` we wszystkich instancjach `<UserAvatar>`.
    - `apps/web/src/components/friend-request-listener.tsx` — analogicznie.
  - **Notes**: Już wystarczy przekazać prop — `UserAvatar` zajmie się resztą.

- [x] Task 14: Aktualizacja auth store
  - **File**: `apps/web/src/store/auth.store.ts`
  - **Action**: Dodać metodę `updateAvatarUrl(avatarUrl: string | null)` do store.
  - **Implementation**:
    ```typescript
    updateAvatarUrl: (avatarUrl) => set((state) => ({
        user: state.user ? { ...state.user, avatarUrl } : null,
    })),
    ```
  - **Notes**: Alternatywnie, istniejąca metoda `updateUser` wystarczy jeśli otrzyma pełny obiekt `User` z odpowiedzi API.

### Acceptance Criteria

- [x] AC 1: Given zalogowanego użytkownika, when kliknie na swój avatar na stronie `/account`, then otworzy się dialog z opcją "Upload Avatar".
- [x] AC 2: Given dialog uploadu, when użytkownik wybierze plik JPEG/PNG/WebP/GIF ≤ 5MB, then wyświetli się podgląd zdjęcia.
- [x] AC 3: Given podgląd pliku, when użytkownik kliknie "Upload", then plik zostanie przetworzony (256×256, WebP), uploadowany do Supabase, a avatar zostanie natychmiastowo zaktualizowany w UI (Cache busting URL).
- [x] AC 4: Given plik > 5MB lub niewspierany format (np. SVG, BMP), when użytkownik spróbuje go załadować, then wyświetli się czytelny komunikat o błędzie (bez crashu).
- [x] AC 5: Given użytkownika ze zdjęciem profilowym, when inny użytkownik wyświetli go na liście znajomych lub w wynikach wyszukiwania, then ujrzy jego avatar (a nie inicjałkę).
- [x] AC 6: Given użytkownika ze zdjęciem profilowym, when kliknie "Remove Avatar" w dialogu, then avatar zostanie usunięty i przywrócona zostanie inicjałka.
- [x] AC 7: Given serwer API bez skonfigurowanych zmiennych Supabase, when użytkownik spróbuje uploadować avatar, then otrzyma czytelny błąd HTTP 500 z komunikatem "Avatar upload is not configured" (bez stack trace).

## Security Considerations

| Threat | Mitigation |
| ------ | ---------- |
| Złośliwy plik (np. SVG z JS, wykonywalny) | Walidacja magic bytes (nie ufamy Content-Type). Sharp konwertuje do WebP = stripping wszystkich metadanych/embeds. |
| Denial of Service (duże pliki) | Multer `fileSize: 5MB`, rate limiting (5 req/min). |
| Unauthenticated upload | Endpoint chroniony `authMiddleware`. |
| Path traversal | Nazwa pliku deterministyczna `{userId}.webp` — generowana server-side, user input nie wpływa na path. |
| Service Role Key leak | Key tylko w `.env` backendu, nigdy na froncie. `.env` w `.gitignore`. |
| SSRF via image URL | Nie akceptujemy URLi — tylko upload pliku (multipart). |

## Dependencies

| Package | Version | Purpose |
| ------- | ------- | ------- |
| `@supabase/supabase-js` | `^2.x` | Komunikacja z Supabase Storage API |
| `multer` | `^1.4.x` | Middleware do obsługi `multipart/form-data` |
| `sharp` | `^0.33.x` | Server-side image processing (resize, format conversion) |
| `@types/multer` | latest | TypeScript types (dev) |
| `@types/sharp` | latest | TypeScript types (dev) — uwaga: sharp od 0.33 wbudowany TS |

## Testing Strategy

- **Unit tests**: `avatar.service.test.ts` — mockowanie Supabase i Prisma:
  - ✅ Upload pliku z prawidłowymi magic bytes → sukces.
  - ✅ Upload pliku z fałszywymi magic bytes (np. `.exe` z rozszerzeniem `.jpg`) → error.
  - ✅ Upload pliku >5MB → odrzucenie przez multer.
  - ✅ Usunięcie avatara → `avatarUrl` ustawione na `null`.
  - ✅ Re-upload → stary plik nadpisany (upsert).
- **Manual testing**: Zalogować się na dwóch kontach, uploadować avatar, sprawdzić:
  - Avatar widoczny w ProfileHeader.
  - Avatar widoczny na liście znajomych drugiego użytkownika.
  - Avatar widoczny w wynikach wyszukiwania.
  - Usunięcie avatara przywraca inicjałkę we wszystkich miejscach.

## Notes

- **Cache busting**: Supabase Storage domyślnie ustawia nagłówki cache. Przy re-uploadzie URL się nie zmienia (`avatars/{id}.webp`), więc przeglądarka może serwować stary obraz. Rozwiązanie: dodać query param `?t={timestamp}` do `avatarUrl` przy każdej aktualizacji → `${publicUrl}?t=${Date.now()}`. Alternatywnie użyj nagłówka `Cache-Control: no-cache` w konfiguracji bucketu na Supabase Dashboard (Settings → mniej optymalne).
- **Przyszłe rozszerzenia**: Crop UI po stronie klienta (np. `react-image-crop`), domyślne avatary z DiceBear, CDN caching z Supabase Edge Functions.

## Dev Agent Record

**Lista plików (File List):**
- `apps/api/prisma/schema.prisma`
- `apps/api/src/config/env.ts`
- `apps/api/src/lib/supabase.ts`
- `apps/api/src/services/avatar.service.ts`
- `apps/api/src/controllers/avatar.controller.ts`
- `apps/api/src/routes/avatar.routes.ts`
- `apps/api/src/middleware/upload.middleware.ts` (Dodany nowy plik konfiguracyjny)
- `apps/api/src/index.ts`
- `apps/api/package.json`
- `apps/api/src/__tests__/services/avatar.service.test.ts` (Dodany zgodnie z wymogami)
- `packages/shared/src/schemas/auth.ts`
- `packages/shared/src/types/friend.ts`
- `apps/web/src/components/account/profile-header.tsx`
- `apps/web/src/components/ui/user-avatar.tsx`
- `apps/web/src/store/auth.store.ts`
- `apps/web/src/components/account/avatar-upload-dialog.tsx`

**Change Log:**
- Implementacja backendu i frontendu.
- Zautomatyzowane poprawki w ramach Code Review:
  - Cache Busting dla zaktualizowanego awatara dodany w service.
  - Testy jednostkowe dopisane dla usługi AvatarService.
  - Wyłapanie i sformatowanie (JSON zamiast HTML 500) Multer limit payload erroru w middleware/ruterze.
  - Dodawanie jawnej metody `updateAvatarUrl` w zustand store.
  - Poprawa stylizacji wielkości overlaya.
