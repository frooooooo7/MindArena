import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PREVIEW_SEQUENCE } from "./sequence-demo-engine";

type ViewportProps = ComponentProps<"div"> & {
  onViewportEnter?: () => void;
  onViewportLeave?: () => void;
  viewport?: unknown;
};
type MotionButtonProps = ComponentProps<"button"> & {
  whileTap?: unknown;
  transition?: unknown;
};

const motionControl = vi.hoisted(() => ({
  enter: undefined as undefined | (() => void),
  leave: undefined as undefined | (() => void),
  reduced: false,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");

  return {
    motion: {
      div: ({ onViewportEnter, onViewportLeave, viewport, ...props }: ViewportProps) => {
        void viewport;
        motionControl.enter = onViewportEnter;
        motionControl.leave = onViewportLeave;
        return React.createElement("div", props);
      },
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
  default: ({ children, ...props }: ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

const { SequenceGameDemo } = await import("./sequence-game-demo");

function enterViewport() {
  expect(motionControl.enter).toBeTypeOf("function");
  act(() => motionControl.enter?.());
}

function leaveViewport() {
  expect(motionControl.leave).toBeTypeOf("function");
  act(() => motionControl.leave?.());
}

function advanceToPlayerTurn() {
  act(() => vi.advanceTimersByTime(PREVIEW_SEQUENCE.length * 520));
}

function boardButtons() {
  return screen.getAllByRole("button", { name: /sequence tile/i }) as HTMLButtonElement[];
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
    motionControl.enter = undefined;
    motionControl.leave = undefined;
    motionControl.reduced = false;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("does not start or enable input before the preview enters the viewport", () => {
    render(<SequenceGameDemo />);

    act(() => vi.advanceTimersByTime(5000));

    expect(boardButtons()).toHaveLength(9);
    expect(boardButtons().every((button) => button.disabled)).toBe(true);
    expectVisibleStatus("Watch the pattern");
  });

  it("starts on viewport entry and enables the full board after the pattern", () => {
    render(<SequenceGameDemo />);

    enterViewport();
    expectVisibleStatus("Watch the pattern");
    expect(boardButtons().every((button) => button.disabled)).toBe(true);

    advanceToPlayerTurn();

    expectVisibleStatus("Your turn");
    expect(boardButtons().every((button) => !button.disabled)).toBe(true);
  });

  it("keeps the tile announcement after visual flash clears and announces correct progress", () => {
    render(<SequenceGameDemo />);
    enterViewport();

    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText("Sequence tile 5")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByText("Sequence tile 5")).toBeInTheDocument();

    advanceToPlayerTurn();
    fireEvent.click(screen.getByRole("button", { name: "Sequence tile 5" }));

    expect(screen.getByText("Correct. 1 of 3")).toBeInTheDocument();
  });

  it("replays after a failed input and after a completed sequence", () => {
    render(<SequenceGameDemo />);
    enterViewport();
    advanceToPlayerTurn();

    fireEvent.click(screen.getByRole("button", { name: "Sequence tile 1" }));
    expectVisibleStatus("That was not the pattern. Replaying shortly.");

    act(() => vi.advanceTimersByTime(1300));
    expectVisibleStatus("Watch the pattern");

    advanceToPlayerTurn();
    for (const cell of PREVIEW_SEQUENCE) {
      fireEvent.click(screen.getByRole("button", { name: `Sequence tile ${cell + 1}` }));
    }
    expectVisibleStatus("Perfect sequence! Replaying shortly.");

    act(() => vi.advanceTimersByTime(2800));
    expectVisibleStatus("Watch the pattern");
  });

  it("resets when leaving and starts a fresh pattern when re-entering", () => {
    render(<SequenceGameDemo />);
    enterViewport();
    advanceToPlayerTurn();

    leaveViewport();
    act(() => vi.advanceTimersByTime(5000));
    expectVisibleStatus("Watch the pattern");
    expect(boardButtons().every((button) => button.disabled)).toBe(true);

    enterViewport();
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText("Sequence tile 5")).toBeInTheDocument();
  });

  it("clears pending timers on unmount", () => {
    const { unmount } = render(<SequenceGameDemo />);
    enterViewport();

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps timed highlights but removes motion transforms when reduced motion is requested", () => {
    motionControl.reduced = true;
    render(<SequenceGameDemo />);
    enterViewport();

    act(() => vi.advanceTimersByTime(0));

    expect(screen.getByRole("button", { name: "Sequence tile 5" })).toHaveAttribute(
      "data-motion-while-tap",
      "none",
    );
    expect(screen.getByRole("button", { name: "Sequence tile 5" }).className).toContain(
      "bg-portal-mint",
    );
    const fullGameLink = screen.getByRole("link", { name: "Play full game" });
    expect(fullGameLink.className).not.toContain("translate");
    expect(fullGameLink.querySelector("svg")?.className.baseVal).not.toContain("translate");
  });
});
