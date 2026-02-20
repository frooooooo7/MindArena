---
id: '4-3-arena-rank-system-display'
title: 'Fix Arena Rank System Display'
status: 'done'
epic: 'Epic 4: Premium Feedback Loop & Athlete Identity'
---

# Story: Fix Arena Rank System Display

As a gracz,
I want aby komponent Arena Rank System wyświetlał rzeczywiste rangi zdefiniowane w systemie,
So that mam jasną informację o progach punktowych i wizualnej reprezentacji rang.

## Acceptance Criteria

- [x] Komponent `RankSystemCard` używa rzeczywistych rang z `RANK_TIERS` (@mindarena/shared).
- [x] Zakresy punktowe (RP) są obliczane dynamicznie na podstawie progów `minPoints`.
- [x] Każda ranga posiada swoją ikonę i dedykowany kolor spójny z systemem.
- [x] Dodano efekty wizualne (hover, transition) podkreślające jakość "Premium".
- [x] Importy są uporządkowane, a kod jest wolny od nieużywanych zmiennych.

## Tasks

- [x] Import `RANK_TIERS` z `@mindarena/shared` w `arena-info-cards.tsx`.
- [x] Refaktoryzacja `RankSystemCard` do mapowania po `RANK_TIERS`.
- [x] Implementacja logiki obliczania `rangeText` dla każdego poziomu.
- [x] Dodanie mapowania `RANK_COLORS` i stylizacji ikon.
- [x] Weryfikacja wizualna i czyszczenie kodu (linting).

## Dev Agent Record

### File List
- `apps/web/src/components/arena/arena-info-cards.tsx`

### Change Log
- Zaktualizowano `RankSystemCard` - teraz mapuje po rzeczywistej tablicy `RANK_TIERS`.
- Dodano ikonki rang (🧠, ⚡, 🌀, 🏆) do widoku.
- Dodano animacje hover i przejścia kolorystyczne.
- Uporządkowano importy i usunięto placeholdery ("Cyber", "Quantum", "Nova").
