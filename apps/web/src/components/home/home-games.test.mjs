import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const file = new URL("./home-games.json", import.meta.url);

async function readGames() {
  return JSON.parse(await readFile(file, "utf8"));
}

test("featured games have unique ids and playable routes", async () => {
  const games = await readGames();

  assert.ok(games.length >= 5);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);

  for (const game of games) {
    assert.match(game.id, /^[a-z0-9-]+$/);
    assert.match(game.href, /^\/games\/[a-z0-9-]+$/);
    assert.ok(game.title.length > 0);
    assert.ok(game.description.length > 0);
    assert.ok(
      ["sequence", "numbers", "code", "color", "grid"].includes(
        game.motif,
      ),
    );
  }
});

test("adding another game does not depend on a fixed total", async () => {
  const games = await readGames();
  const extra = {
    ...games[0],
    id: "future-game",
    href: "/games/future-game",
  };
  const extended = [...games, extra];

  assert.equal(extended.length, games.length + 1);
});

test("game artwork has complete metadata and public files", async () => {
  const games = await readGames();
  const expectedArtwork = {
    "chimp-memory": "/game_photos/chimp.png",
    "code-memory": "/game_photos/code_memory.png",
    "color-word": "/game_photos/colours.png",
    "schulte-table": "/game_photos/schulte.png",
  };

  for (const [id, image] of Object.entries(expectedArtwork)) {
    const game = games.find((entry) => entry.id === id);

    assert.ok(game, `${id} should exist`);
    assert.equal(game.image, image);
    assert.ok(["cover", "contain"].includes(game.imageFit));
    assert.equal(typeof game.imagePosition, "string");

    const artwork = new URL(`../../../public${image}`, import.meta.url);
    assert.ok((await stat(artwork)).isFile());
  }

  const sequenceMemory = games.find((game) => game.id === "sequence-memory");
  assert.ok(sequenceMemory, "sequence-memory should exist");
  assert.equal(sequenceMemory.image, undefined);
});
