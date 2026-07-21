import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PREVIEW_SEQUENCE } from "./sequence-demo-engine";

type MotionButtonProps = ComponentProps<"button"> & {
  whileTap?: unknown;
  transition?: unknown;
};

const motionControl = vi.hoisted(() => ({
  reduced: false,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");

  return {
    motion: {
      button: ({ whileTap, transition, ...props }: MotionButtonProps) => {
        void transition;
        return React.createElement("button", {
          ...props,
          "data-motion-while-tap": whileTap ? "scale" : "none",
        });
      },
    },
    useReducedMotion: () => motionControl.reduced,
  };
});

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));

const { SequenceGameDemo } = await import("./sequence-game-demo");

function advanceToPlayerTurn() {
  act(() => vi.advanceTimersByTime(PREVIEW_SEQUENCE.length * 520));
}

function boardButtons() {
  return screen.getAllByRole("button", {
    name: /sequence tile/i,
  }) as HTMLButtonElement[];
}

function expectVisibleStatus(status: string) {
  expect(
    screen
      .getAllByText(status)
      .some((element) => element.getAttribute("aria-live") !== "polite"),
  ).toBe(true);
}

describe("SequenceGameDemo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    motionControl.reduced = false;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("stays idle until the user explicitly starts the preview", () => {
    render(<SequenceGameDemo />);

    act(() => vi.advanceTimersByTime(5000));

    expect(boardButtons()).toHaveLength(9);
    expect(boardButtons().every((button) => button.disabled)).toBe(true);
    expectVisibleStatus("Ready when you are");
    expect(
      screen.getByRole("button", { name: "Start sequence" }),
    ).toBeEnabled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("starts after clicking the action and enables the full board after the pattern", () => {
    render(<SequenceGameDemo />);

    fireEvent.click(screen.getByRole("button", { name: "Start sequence" }));
    expectVisibleStatus("Watch the pattern");
    expect(boardButtons().every((button) => button.disabled)).toBe(true);
    expect(
      screen.getByRole("button", { name: "Sequence running" }),
    ).toBeDisabled();

    advanceToPlayerTurn();

    expectVisibleStatus("Your turn");
    expect(boardButtons().every((button) => !button.disabled)).toBe(true);
  });

  it("keeps the tile announcement after visual flash clears and announces correct progress", () => {
    render(<SequenceGameDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Start sequence" }));

    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText("Sequence tile 5")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByText("Sequence tile 5")).toBeInTheDocument();

    advanceToPlayerTurn();
    fireEvent.click(screen.getByRole("button", { name: "Sequence tile 5" }));

    expect(screen.getByText("Correct. 1 of 3")).toBeInTheDocument();
  });

  it("waits for an explicit replay after both failure and success", () => {
    render(<SequenceGameDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Start sequence" }));
    advanceToPlayerTurn();

    fireEvent.click(screen.getByRole("button", { name: "Sequence tile 1" }));
    expectVisibleStatus("Pattern missed. Try again.");
    expect(screen.getByRole("button", { name: "Play again" })).toBeEnabled();
    expect(boardButtons().every((button) => button.disabled)).toBe(true);

    act(() => vi.advanceTimersByTime(5000));
    expectVisibleStatus("Pattern missed. Try again.");
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    advanceToPlayerTurn();
    for (const cell of PREVIEW_SEQUENCE) {
      fireEvent.click(
        screen.getByRole("button", { name: `Sequence tile ${cell + 1}` }),
      );
    }
    expectVisibleStatus("Perfect sequence!");
    expect(screen.getByRole("button", { name: "Play again" })).toBeEnabled();

    act(() => vi.advanceTimersByTime(5000));
    expectVisibleStatus("Perfect sequence!");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears pending timers on unmount", () => {
    const { unmount } = render(<SequenceGameDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Start sequence" }));

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps timed highlights but removes motion transforms when reduced motion is requested", () => {
    motionControl.reduced = true;
    render(<SequenceGameDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Start sequence" }));

    act(() => vi.advanceTimersByTime(0));

    expect(
      screen.getByRole("button", { name: "Sequence tile 5" }),
    ).toHaveAttribute("data-motion-while-tap", "none");
    expect(
      screen.getByRole("button", { name: "Sequence tile 5" }).className,
    ).toContain("bg-portal-mint");
    const fullGameLink = screen.getByRole("link", { name: "Play full game" });
    expect(fullGameLink.className).not.toContain("translate");
    expect(fullGameLink.querySelector("svg")?.className.baseVal).not.toContain(
      "translate",
    );
  });
});
