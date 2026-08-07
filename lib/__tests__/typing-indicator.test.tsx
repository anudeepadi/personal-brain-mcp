import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TypingIndicator } from "@/components/brain/typing-indicator";

describe("TypingIndicator", () => {
  it("renders three pulsing dots", () => {
    render(<TypingIndicator />);

    const dots = screen.getAllByTestId("typing-dot");
    expect(dots).toHaveLength(3);
  });

  it("has accessible label", () => {
    render(<TypingIndicator />);

    expect(screen.getByLabelText("Thinking...")).toBeInTheDocument();
  });

  it("each dot has amber color class", () => {
    render(<TypingIndicator />);

    const dots = screen.getAllByTestId("typing-dot");
    dots.forEach((dot) => {
      expect(dot.className).toContain("bg-accent");
    });
  });
});
