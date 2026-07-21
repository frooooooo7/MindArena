export const PREVIEW_SEQUENCE = [4, 1, 7] as const;

export type SequenceDemoPhase = "watching" | "playing" | "success" | "failure";

export interface SequenceDemoState {
  phase: SequenceDemoPhase;
  inputIndex: number;
}

export function createSequenceDemoState(): SequenceDemoState {
  return { phase: "watching", inputIndex: 0 };
}

export function beginPlayerTurn(state: SequenceDemoState): SequenceDemoState {
  if (state.phase !== "watching") {
    return state;
  }

  return { phase: "playing", inputIndex: 0 };
}

export function acceptSequenceInput(
  state: SequenceDemoState,
  cell: number,
  sequence: readonly number[] = PREVIEW_SEQUENCE,
): SequenceDemoState {
  if (state.phase !== "playing") {
    return state;
  }

  if (cell !== sequence[state.inputIndex]) {
    return { phase: "failure", inputIndex: state.inputIndex };
  }

  const inputIndex = state.inputIndex + 1;

  if (inputIndex === sequence.length) {
    return { phase: "success", inputIndex };
  }

  return { phase: "playing", inputIndex };
}

export function resetSequenceDemo(): SequenceDemoState {
  return createSequenceDemoState();
}
