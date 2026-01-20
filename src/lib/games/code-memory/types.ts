export type GameState = "idle" | "memorize" | "input" | "success" | "gameover";

export const MEMORIZE_TIME = 3000; // 3 seconds to memorize
export const CHARS = "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"; // Removed O to avoid confusion with 0

export const generateCode = (length: number): string => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
};
