import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecallResults } from "@/components/brain/recall-results";
import type { SearchResultItem } from "@/lib/api";

describe("RecallResults", () => {
  const sampleResults: readonly SearchResultItem[] = [
    {
      content: "I live in Austin, Texas",
      metadata: { source: "chat" },
      relevanceScore: 0.95,
      documentId: "doc_1",
      references: [],
    },
    {
      content: "I work at Acme Corp as an engineer",
      metadata: { source: "chat" },
      relevanceScore: 0.82,
      documentId: "doc_2",
      references: [],
    },
  ];

  it("renders memory cards for each result", () => {
    render(<RecallResults results={sampleResults} />);

    expect(screen.getByText("I live in Austin, Texas")).toBeInTheDocument();
    expect(
      screen.getByText("I work at Acme Corp as an engineer"),
    ).toBeInTheDocument();
  });

  it("shows relevance score as amber badge", () => {
    render(<RecallResults results={sampleResults} />);

    const badges = screen.getAllByTestId("relevance-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0].textContent).toContain("0.95");
    expect(badges[1].textContent).toContain("0.82");
  });

  it("shows empty state when no results", () => {
    render(<RecallResults results={[]} />);

    expect(screen.getByText("No memories found")).toBeInTheDocument();
  });

  it("relevance badges have amber styling", () => {
    render(<RecallResults results={sampleResults} />);

    const badges = screen.getAllByTestId("relevance-badge");
    badges.forEach((badge) => {
      expect(badge.className).toContain("bg-accent");
    });
  });

  it("uses stone background for cards", () => {
    render(<RecallResults results={sampleResults} />);

    const cards = screen.getAllByTestId("recall-card");
    cards.forEach((card) => {
      expect(card.className).toContain("bg-surface");
    });
  });
});
