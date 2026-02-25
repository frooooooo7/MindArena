---
title: 'Zunifikowany Dialog Edycji Profilu'
slug: 'unified-profile-editing-dialog'
created: '2026-02-25T11:28:20+01:00'
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
tech_stack: ['Next.js 16', 'Prisma v6', 'Tailwind CSS v4', 'Zustand v5', 'Zod', 'Socket.IO']
files_to_modify: [
  'apps/api/src/routes/user.routes.ts',
  'apps/api/src/controllers/user.controller.ts',
  'apps/api/src/services/user.service.ts',
  'packages/shared/src/schemas/auth.ts',
  'apps/web/src/components/account/edit-profile-dialog.tsx',
  'apps/web/src/components/account/profile-header.tsx'
]
code_patterns: ['Controller/Service/Repository', 'Shared Zod Schemas', 'Shadcn/Radix UI', 'Premium Aesthetics']
test_patterns: ['Vitest', 'Unit tests in __tests__ folders']
---

# Overview

## Problem Statement
Obecnie użytkownik może zmienić tylko awatar przez dedykowany dialog. Brakuje scentralizowanego miejsca do zarządzania danymi profilowymi, takimi jak nazwa użytkownika (nickname), email czy hasło.

## Solution
Implementacja komponentu `EditProfileDialog`, który zintegruje zarządzanie awatarem, edycję nickname'u oraz dostarczy placeholdery dla ustawień bezpieczeństwa i adresu email.

## Scope

### In Scope
- Endpoint API do aktualizacji danych profilowych (nickname).
- Nowy schemat Zod w `@mindarena/shared` dla aktualizacji profilu.
- Rozbudowany Dialog UI z sekcjami:
  - **General**: Zmiana Nickname, Email (disabled).
  - **Avatar**: Obecna funkcjonalność przesyłania/usuwania zdjęcia.
  - **Security**: Zmiana hasła (disabled).
- Integracja w `ProfileHeader.tsx`.
- Aktualizacja stanu `authStore` po zmianie danych.

### Out of Scope
- Logika faktycznej zmiany adresu e-mail.
- Logika faktycznej zmiany hasła.

# Context for Development
Zgodnie z zasadami projektu `memoryGAMES`:
- Wykorzystujemy **Premium Aesthetics** (gradienty `from-violet-600 to-indigo-600`, szklany efekt `bg-card/60`).
- Używamy `@mindarena/shared` dla wszystkich interfejsów i schematów przesyłanych między API a Web.
- Backendowa aktualizacja danych musi być zabezpieczona przez middleware uwierzytelniający.

## Codebase Patterns
- **API**: Architektura warstwowa (Router -> Controller -> Service -> Repository).
- **Web**: Komponenty React (Tailwind 4), stan w Zustand (`authStore`).
- **Validation**: Zod używany zarówno na frotendzie jak i backendzie poprzez współdzielone schematy.

## Files to Reference
| File | Purpose |
| --- | --- |
| `apps/web/src/components/account/avatar-upload-dialog.tsx` | Referencyjna implementacja przesyłania awatara |
| `apps/api/src/controllers/avatar.controller.ts` | Przykład obsługi plików i odpowiedzi API |
| `packages/shared/src/schemas/auth.ts` | Miejsce na definicję `updateProfileSchema` |
| `apps/api/prisma/schema.prisma` | Definicja modelu `User` (pola `name`, `email`) |

## Technical Decisions
- Stworzenie nowego `EditProfileDialog`, który zastąpi `AvatarUploadDialog`.
- Dodanie trasy `PATCH /api/users/profile` dla aktualizacji danych tekstowych (nickname).
- Utrzymanie `disabled` dla pól Email i Password zgodnie z prośbą użytkownika.

# Implementation Plan

- [x] Task 1: Dodanie schematu walidacji profilu
  - File: `packages/shared/src/schemas/auth.ts`
  - Action: Zdefiniowanie `updateProfileSchema` zawierającego opcjonalne pole `name` (min 2 znaki).
- [x] Task 2: Implementacja backendowej logiki profilu
  - File: `apps/api/src/services/user.service.ts` (create)
  - Action: Metoda `updateProfile(userId, data)`, która aktualizuje użytkownika w bazie.
  - File: `apps/api/src/controllers/user.controller.ts` (create)
  - Action: Metoda `updateProfile` obsługująca request, walidująca dane i zwracająca zaktualizowanego użytkownika.
  - File: `apps/api/src/routes/user.routes.ts` (create)
  - Action: Endpoint `PATCH /profile` chroniony przez `authMiddleware`.
  - File: `apps/api/src/index.ts` (lub główne trasy)
  - Action: Rejestracja `userRoutes`.
- [x] Task 3: Przygotowanie nowego komponentu Dialogu
  - File: `apps/web/src/components/account/edit-profile-dialog.tsx` (create)
  - Action: Implementacja UI opartego na `Tabs` z Shadcn. Zakładki: Profil (Nickname, Email), Awatar, Bezpieczeństwo (Hasło).
  - Notes: Wykorzystanie logiki z `AvatarUploadDialog`. Przekazanie `user` jako propa.
- [x] Task 4: Integracja z ProfileHeader
  - File: `apps/web/src/components/account/profile-header.tsx`
  - Action: Zamiana `AvatarUploadDialog` na `EditProfileDialog`. Zmiana nazwy stanu `isUploadOpen` na `isEditDialogOpen`.
- [x] Task 5: Obsługa aktualizacji stanu na frotendzie
  - File: `apps/web/src/store/auth.store.ts` (weryfikacja)
  - Action: Upewnienie się, że `authStore` ma metodę do aktualizacji danych użytkownika w stanie lokalnym.

# Acceptance Criteria

- [x] AC 1: Nickname Update - Given a user is logged in, when they enter a new valid nickname and save, then the database is updated and the profile header shows the new name.
- [x] AC 2: Avatar Persistence - Given the unified dialog, when a user uploads a new avatar, then it is saved to Supabase and correctly linked to the profile.
- [x] AC 3: Disabled Fields - Given the "General" and "Security" sections, when a user views Email or Password fields, then they are marked as `disabled` and can't be edited.
- [x] AC 4: Validation - Given the nickname field, when a user enters less than 2 characters, then an appropriate error message is displayed.

# Additional Context

## Dependencies
- `@mindarena/shared` (nowe schematy)
- `lucide-react` (ikony dla zakładek)
- `@radix-ui/react-tabs` (lub Shadcn Tabs)

## Testing Strategy
- **Unit**: Testy `user.service.ts` sprawdzające aktualizację pola `name` w Prisma.
- **Integration**: Test endpointu `PATCH /api/users/profile`.
- **Manual**: Weryfikacja wizualna dialogu (Premium Aesthetics), sprawdzenie czy pola disabled są nieaktywne.

## Notes
- Należy pamiętać o odświeżeniu publicznej ścieżki awatara (timestamp query param), aby uniknąć problemów z cache przeglądarki.
- W przyszłości sekcja Password będzie wymagać weryfikacji obecnego hasła.
