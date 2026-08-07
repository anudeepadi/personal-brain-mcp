import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { WelcomeState } from "@/components/brain/welcome-state";

describe("WelcomeState", () => {
  it("renders the welcome heading", () => {
    render(<WelcomeState onSendPrompt={() => {}} />);

    expect(
      screen.getByText("Tell me something about yourself."),
    ).toBeInTheDocument();
  });

  it("renders the subtext", () => {
    render(<WelcomeState onSendPrompt={() => {}} />);

    expect(screen.getByText("I'll remember it.")).toBeInTheDocument();
  });

  it("renders three suggested prompt chips", () => {
    render(<WelcomeState onSendPrompt={() => {}} />);

    expect(
      screen.getByText("I live in San Francisco"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("I'm working on a React project"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("I prefer dark mode for coding"),
    ).toBeInTheDocument();
  });

  it("calls onSendPrompt when a chip is clicked", () => {
    const onSendPrompt = vi.fn();
    render(<WelcomeState onSendPrompt={onSendPrompt} />);

    fireEvent.click(screen.getByText("I live in San Francisco"));

    expect(onSendPrompt).toHaveBeenCalledWith("I live in San Francisco");
  });

  it("calls onSendPrompt with correct content for each chip", () => {
    const onSendPrompt = vi.fn();
    render(<WelcomeState onSendPrompt={onSendPrompt} />);

    fireEvent.click(screen.getByText("I'm working on a React project"));
    expect(onSendPrompt).toHaveBeenCalledWith(
      "I'm working on a React project",
    );

    fireEvent.click(screen.getByText("I prefer dark mode for coding"));
    expect(onSendPrompt).toHaveBeenCalledWith(
      "I prefer dark mode for coding",
    );
  });

  it("heading uses display font (Instrument Serif italic)", () => {
    render(<WelcomeState onSendPrompt={() => {}} />);

    const heading = screen.getByText("Tell me something about yourself.");
    expect(heading.className).toContain("font-display");
    expect(heading.className).toContain("italic");
  });

  it("chips use mono font", () => {
    render(<WelcomeState onSendPrompt={() => {}} />);

    const chip = screen.getByText("I live in San Francisco");
    expect(chip.className).toContain("font-mono");
  });
});
