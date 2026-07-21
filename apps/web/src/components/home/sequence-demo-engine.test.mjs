import assert from "node:assert/strict";
import test from "node:test";

import {
  PREVIEW_SEQUENCE,
  acceptSequenceInput,
  beginPlayerTurn,
  createSequenceDemoState,
  resetSequenceDemo,
} from "./sequence-demo-engine.ts";

test("correct first prefix advances inputIndex and stays playing", () => {
  const playing = beginPlayerTurn(createSequenceDemoState());

  assert.deepEqual(acceptSequenceInput(playing, PREVIEW_SEQUENCE[0]), {
    phase: "playing",
    inputIndex: 1,
  });
});

test("incorrect cell moves to failure with inputIndex 0", () => {
  const playing = beginPlayerTurn(createSequenceDemoState());

  assert.deepEqual(acceptSequenceInput(playing, 0), {
    phase: "failure",
    inputIndex: 0,
  });
});

test("every preview cell reaches success at the sequence length", () => {
  let state = beginPlayerTurn(createSequenceDemoState());

  for (const cell of PREVIEW_SEQUENCE) {
    state = acceptSequenceInput(state, cell);
  }

  assert.deepEqual(state, {
    phase: "success",
    inputIndex: PREVIEW_SEQUENCE.length,
  });
});

test("input while watching returns the exact same state object", () => {
  const watching = createSequenceDemoState();

  assert.strictEqual(acceptSequenceInput(watching, PREVIEW_SEQUENCE[0]), watching);
});

test("reset returns a clean watching state", () => {
  assert.deepEqual(resetSequenceDemo(), {
    phase: "watching",
    inputIndex: 0,
  });
});
