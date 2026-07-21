import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("sequence preview exposes its required interactive source contract", async () => {
  const source = await readFile(
    new URL("./sequence-game-demo.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /aria-live="polite"/);
  assert.match(source, /type="button"/);
  assert.match(source, /disabled=\{state\.phase !== "playing"\}/);
  assert.match(source, /href="\/games\/sequence-memory"/);
  assert.match(source, /Array\.from\(\{ length: 9 \}/);
});
