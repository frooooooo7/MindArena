---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/project-context.md', '_bmad-output/planning-artifacts/prd.md']
date: '2026-02-10'
author: 'Fro'
---

# Product Brief: memoryGAMES

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

memoryGAMES (MindArena) ewoluuje z prostej aplikacji treningowej w kompetytywną platformę e-sportową dla umysłu. Kluczowym elementem nowej wizji jest zaawansowany system rankingowy, który nadaje sens każdej rozgrywce 1v1. Dzięki unikalnym rangom ("mózgowa" hierarchia) oraz natychmiastowej, wysokiej jakości informacji zwrotnej po meczu, budujemy produkt, który uzależnia w pozytywny sposób, promując rozwój funkcji poznawczych poprzez zdrową rywalizację.

---

## Core Vision

### Problem Statement

Tradycyjne gry typu "brain training" cierpią na brak długoterminowego zaangażowania. Użytkownicy często porzucają trening, ponieważ:
1. Nie mają jasnego punktu odniesienia względem innych graczy.
2. Postęp jest abstrakcyjny i mało ekscytujący.
3. Brak jest dreszczyku emocji związanego ze stawką o jaką toczy się gra.

### Problem Impact

Bez systemu rankingowego, arena 1v1 staje się jedynie "serią przypadkowych gier". Gracze o różnych poziomach umiejętności są ze sobą parowani bez klucza, co prowadzi do frustracji u początkujących i nudy u ekspertów, ostatecznie obniżając retencję użytkowników.

### Why Existing Solutions Fall Short

Konkurencja (np. Lumosity, Peak) skupia się na statystykach solo (BMI dla mózgu), które są statyczne i mało angażujące społecznie. Istniejące gry logiczne z rankingami często mają przestarzały interfejs i nie oferują emocji "na żywo". Brakuje rozwiązania, które łączyłoby naukowy charakter gier pamięciowych z nowoczesną dynamiką gier MOBA/e-sportowych.

### Proposed Solution

Wprowadzenie systemu **MindRank**, który obejmuje:
- **Hierarchię Postępu**: Rangi odzwierciedlające rozwój neurologiczny: **Neuron** (Początkujący), **Synapsa**, **Kora**, aż po elitarny tytuł **Geniusz**.
- **Specjalizację**: Osobne rankingi dla gier Sequence, Chimp oraz Code Memory, pozwalające graczom stać się mistrzami w konkretnych dziedzinach.
- **Natychmiastową Satysfakcję**: System wizualny oparty na Tailwind 4, który natychmiast po zakończeniu meczu animuje wzrost punktów i postęp w randze, wykorzystując projektowe "signature gradients".

### Key Differentiators

- **Brain-Specific Identity**: Branding rang silnie powiązany z tematyką neuronauki.
- **Real-Time Stakes**: Każdy mecz w arenie 1v1 bezpośrednio wpływa na status społeczny gracza w systemie.
- **Premium Feedback Loop**: Połączenie backendowej stabilności (Socket.IO) z frontendowym "wow-effect" podczas aktualizacji rankingu.

---

## Target Users

### Primary Users

1. **Ambitny Samodoskonalący się (Persona: Marek, 22 lata)**
   - **Kontekst:** Student lub młody profesjonalista dbający o "mental performance".
   - **Motywacja:** Traktuje MindArena jako narzędzie do weryfikacji swojej formy intelektualnej. Chce mieć dowód w postaci rangi (np. **Kora**), że jego treningi przynoszą efekty.
   - **Problem:** Nuda w tradycyjnych aplikacjach bez rywalizacji.
   - **Sukces:** Widzialny postęp w rankingu po każdej sesji nauki.

2. **Kompetytywny Gracz (Persona: Alex, 28 lat)**
   - **Kontekst:** Fan e-sportu i gier strategicznych.
   - **Motywacja:** Czysta rywalizacja. Kocha wspinać się po drabince rankingowej i udowadniać swoją wyższość nad innymi graczami w czasie rzeczywistym.
   - **Problem:** Brak gier logicznych, które oferowałyby emocje porównywalne z grami multiplayer.
   - **Sukces:** Osiągnięcie elitarnej rangi **Geniusz** i dominacja w tabeli liderów.

### Secondary Users

- **Użytkownik Pragmatyczny (Profilaktyka):** Osoby starsze lub dbające o zdrowie mózgu, które szukają aktywnej formy spędzania czasu, ale doceniają strukturę rang (Neuron -> Synapsa) jako wskaźnik sprawności.

### User Journey

- **Odkrycie:** Gracz widzi reklamę lub stream z "e-sportu dla mózgu" i intrygują go unikalne nazwy rang.
- **Onboarding:** Po pierwszej grze solo, system sugeruje "Sprawdź się w Arenie 1v1, aby zdobyć rangę **Neuron**".
- **Moment "Aha!":** Pierwsze zwycięstwo w Arenie. Na ekranie pojawia się płynna animacja dodająca **+8 punktów** i pasek postępu rangi przesuwa się do przodu.
- **Pętla Zaangażowania:** Gracz przegrywa mecz (-8 pkt), ale czuje, że ranga jest w zasięgu ręki, więc natychmiast klika "Szukaj następnego meczu", aby odrobić stratę.
- **Sukces długoterminowy:** Gracz osiąga rangę **Synapsa** i chwali się statystykami na profilu, budując swoją tożsamość wokół bycia "sprytnym graczem".

---

## Success Metrics

- **Zaangażowanie w rywalizację:** Średnio 5 rozegranych meczów 1v1 na aktywnego użytkownika dziennie.
- **Efektywność systemu rang:** Zbalansowana dystrybucja graczy w hierarchii (np. tylko 5% graczy osiąga rangę **Geniusz**).
- **Zadowolenie z postępu:** Użytkownicy spędzają średnio 5-10 sekund na ekranie wyniku meczu (oglądając animacje postępu).

### Business Objectives

- **Wzrost lojalności (Retention):** Osiągnięcie poziomu 30% retencji D7 (użytkownicy wracający po tygodniu).
- **Walidacja trybu Arena:** Większość (powyżej 50%) czasu sesji użytkownika spędzana na meczach rankingowych, a nie w grach treningowych solo.
- **Budowa marki "MindRank":** Rozpoznawalność rang wewnątrz społeczności jako symbolu realnych umiejętności.

### Key Performance Indicators

- **Szybkość Matchmakingu:** Średni czas oczekiwania na przeciwnika poniżej 15 sekund.
- **Fair Play:** Procent meczów zakończonych wynikiem zbliżonym do 50/50 win-rate dla graczy na tych samych rangach.
- **Stabilność Socket.IO:** Mniej niż 1% meczów przerwanych z powodu błędów technicznych podczas aktualizacji rankingu.

---

## MVP Scope

### Core Features (Niezbędne w wersji 1.0)

- **Silnik Rankingowy MindRank**: Implementacja logiki +8/-8 na backendzie, zintegrowana z bazą danych (Prisma) dla gry Sequence Memory.
- **Hierarchię Mózgowa (Sequence)**: Wdrożenie rang: **Neuron**, **Synapsa**, **Kora**, **Geniusz** jako wizualnego wskaźnika poziomu gracza.
- **Matchmaking Skill-Based**: System parowania graczy w Arenie 1v1 Sequence Memory oparty na zbliżonej liczbie punktów rankingowych.
- **Premium Feedback Loop**: Animowany ekran podsumowania meczu (wykorzystujący Tailwind 4 i projektowe gradienty), prezentujący natychmiastową aktualizację punktów i postęp w randze.
- **Profil Gracza v1**: Wyświetlanie aktualnej rangi i punktów rankingowych dla gry Sequence na stronie konta użytkownika.

### Out of Scope for MVP (Do wdrożenia później)

- **Multi-Game Ranking**: System rankingowy dla Chimp Memory oraz Code Memory (aktywne będą tylko w trybie casual/non-ranked).
- **Zaawansowana Historia Meczów**: Szczegółowe logi każdego rozegranego meczu (zastąpione prostym licznikiem zwycięstw/porażek).
- **System Sezonowy**: Resety rankingu i nagrody za zakończenie sezonu.
- **Customizacja wizualna**: Odznaki, skórki i unikalne ramki avatara odblokowywane za osiągnięcie konkretnych rang.

### MVP Success Criteria

- **Płynność gry**: Każdy mecz Sequence Memory 1v1 kończy się poprawnym zapisem punktów u obu graczy w 99% przypadków.
- **Balans rozgrywki**: Gracze na randze *Neuron* nie są parowani z graczami na randze *Kora*.
- **Satysfakcja wizualna**: Animacja postępu rangi wywołuje pozytywne reakcje użytkowników i zwiększa chęć rozegrania kolejnego meczu.

### Future Vision

W ciągu roku MindArena stanie się globalnym hubem rywalizacji poznawczej, z turniejami międzyuczelnianymi, systemem klanowym (zespołowe ćwiczenia mózgu) oraz globalnym rankingiem "Most Intelligent Players", wspieranym przez unikalną tożsamość wizualną każdej z rang.
