---
stepsCompleted: ['step-01-init', 'step-01b-continue', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/project-context.md', '_bmad-output/planning-artifacts/product-brief-memoryGAMES-2026-02-10.md']
classification:
  projectType: 'web_app'
  domain: 'edtech'
  complexity: 'medium'
  projectContext: 'brownfield'
workflowType: 'prd'
project_name: 'memoryGAMES'
user_name: 'Fro'
date: '2026-02-05T23:20:06+01:00'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 1
---

# Product Requirements Document - MindArena (memoryGAMES)

**Author:** Fro
**Date:** 2026-02-05T23:20:06+01:00

## 1. Executive Summary
**MindArena** to nowoczesna platforma typu "e-sport dla mózgu", redefiniująca tradycyjny trening poznawczy jako dynamiczną rywalizację 1v1. Niniejszy dokument opisuje wdrożenie systemu **MindRank** – autorskiego mechanizmu rankingowego opartego na ELO, który wprowadza biologiczną hierarchię rang (od **Neurona** do **Geniusza**). MVP koncentruje się na idealnym dopracowaniu pętli rywalizacji w grze Sequence Memory, wykorzystując **Premium Feedback Loop** (zaawansowane animacje Tailwind 4 i Socket.IO) w celu zmaksymalizowania retencji i satysfakcji użytkownika.

## ## 2. Strategic Vision & Success Criteria

### Strategic Innovation
MindArena wypełnia lukę rynkową między surowymi aplikacjami medycznymi a grami rozrywkowymi. Poprzez wprowadzenie realnej stawki (punkty rankingowe) i bezpośredniej rywalizacji, przekształca naukowe testy pamięciowe w angażującą dyscyplinę sportową.

### User Success
Użytkownik odczuwa satysfakcję z postępu dzięki "Premium Feedback Loop" – animacjom po meczu (5-10s), które budują poczucie triumfu. Sukcesem jest awans powyżej rangi startowej (Neuron) w ciągu pierwszego tygodnia.

### Business Success
- **Retencja D7:** 30% (system rankingowy jako habit-builder).
- **Engagement:** Ponad 50% czasu sesji spędzanego w trybie Arena 1v1.

### Technical Success
- **Matchmaking:** Średni czas parowania graczy < 15s przy zachowaniu balansu rang.
- **Data Integrity:** 99.9% meczów zakończonych poprawnym zapisem punktów ELO (Prisma).

## ## 3. User Journeys & Experience Design

### 3.1 Marek: Powrót do formy (Brain Training)
*   **Motywacja:** Marek chce sprawdzić swoją ostrość umysłu po ciężkim dniu.
*   **Akcja:** Wchodzi do Areny ze swoją rangą **Synapsa**, wygrywa zacięty mecz.
*   **Efekt:** Dzięki wizualizacji paska postępu widzi zbliżanie się do rangi **Kora**, co motywuje go do regularnych powrotów.

### 3.2 Alex: Wspinaczka na szczyt (Competitive)
*   **Motywacja:** Osiągnięcie prestiżowej rangi **Geniusz**.
*   **Akcja:** Seria wygranych (+8 pkt każda), analiza statystyk na stronie konta.
*   **Efekt:** Udostępnienie unikalnej ikony rangi społeczności, budowanie statusu.

### 3.3 Alex: Odbicie od dna (Recovery)
*   **Motywacja:** Przerwanie passy porażek (tilt).
*   **Akcja:** Matchmaking dobiera przeciwnika z dolnego zakresu ELO po 3 przegranych.
*   **Efekt:** Wygrana i komunikat motywacyjny przywracają radość z gry.

## ## 4. Product Scope & Roadmap

### MVP (Phase 1) - Focus: Experience & Core Loop
- **Game Support:** Pełna obsługa Sequence Memory 1v1.
- **MindRank Engine:** Algorytm ELO z progami rang: Neuron, Synapsa, Kora, Geniusz.
- **Visuals:** Ekran podsumowania meczu (Tailwind 4) i animacje postępu.

### Phase 2: Growth
- Rankingi dla gier Chimp Memory i Code Memory.
- Globalna tabela liderów (Top 100) i rozszerzona historia meczów.

### Phase 3: Vision
- System sezonowy z nagrodami kosmetycznymi (ramki avatarów).
- Oficjalne turnieje i zaawansowane odznaki.

## ## 5. Capability Contract (Functional Requirements)

### 5.1 Arena & Matchmaking
- **FR1:** Gracz może dołączyć do kolejki matchmakingowej (Sequence Memory).
- **FR2:** System paruje graczy o zbliżonym ELO.
- **FR3:** Gracz musi potwierdzić gotowość przed startem meczu.

### 5.2 Game Mechanics
- **FR4:** Real-time sync stanu gry przez Socket.IO.
- **FR5:** Backend-authoritative walidacja ruchów i zarządzanie timerem.
- **FR6:** System rozstrzyga mecze przerwane (disconnect handling).

### 5.3 MindRank Engine
- **FR7:** Obliczanie punktów (+8/-8) i aktualizacja rang w bazie danych.
- **FR8:** Implementacja Recovery Logic (ochrona przed spadkiem przy tilt).

### 5.4 Profile & UX
- **FR9:** Animowany ekran "Premium Success" po meczu.
- **FR10:** Publiczne profile z wizualną ikoną rangi i win/loss ratio.

## ## 6. Technical & Quality Standards (NFR)

### Performance
- **Latency:** Round-trip < 200ms dla Socket.IO.
- **UI:** Renderowanie interakcji < 16ms (60 FPS).
- **Page Load:** TTI < 2.5s na 4G.

### Security & Compliance
- **Integrity:** Obliczenia ELO wyłącznie po stronie serwera.
- **Privacy:** Zgodność z RODO (GDPR) w zakresie danych profilowych.
- **Authenticity:** Zabezpieczenie przed smurfingiem/boostingiem przez monitoring wzorców.

### Accessibility & Scalability
- **HTML:** Semantic HTML (WCAG 2.1 AA) dla nawigacji i profili.
- **Scale:** Obsługa 500 równoległych parowań graczy.
