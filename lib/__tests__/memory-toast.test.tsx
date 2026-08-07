import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryToast } from "@/components/ui/memory-toast";

describe("MemoryToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the toast with truncated content", () => {
    render(
      <MemoryToast
        content="This is a memory about living in San Francisco and working on cool projects"
        visible={true}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByText("MEMORY STORED")).toBeInTheDocument();
    // Content should be truncated to 60 chars
    expect(
      screen.getByText(
        /This is a memory about living in San Francisco and working/,
      ),
    ).toBeInTheDocument();
  });

  it("truncates content to 60 characters with ellipsis", () => {
    const longContent =
      "A".repeat(70) + " should be cut off here and not displayed fully";
    render(
      <MemoryToast
        content={longContent}
        visible={true}
        onDismiss={() => {}}
      />,
    );

    const displayed = screen.getByTestId("memory-toast-content");
    expect(displayed.textContent).toHaveLength(63); // 60 chars + "..."
  });

  it("does not truncate short content", () => {
    render(
      <MemoryToast
        content="Short memory"
        visible={true}
        onDismiss={() => {}}
      />,
    );

    const displayed = screen.getByTestId("memory-toast-content");
    expect(displayed.textContent).toBe("Short memory");
  });

  it("calls onDismiss after 4 seconds", () => {
    const onDismiss = vi.fn();
    render(
      <MemoryToast
        content="test"
        visible={true}
        onDismiss={onDismiss}
      />,
    );

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not render when visible is false", () => {
    render(
      <MemoryToast
        content="test"
        visible={false}
        onDismiss={() => {}}
      />,
    );

    expect(screen.queryByText("MEMORY STORED")).not.toBeInTheDocument();
  });

  it("has amber left border styling", () => {
    render(
      <MemoryToast
        content="test"
        visible={true}
        onDismiss={() => {}}
      />,
    );

    const toast = screen.getByTestId("memory-toast");
    expect(toast.className).toContain("border-l");
  });

  it("uses Geist Mono for content text", () => {
    render(
      <MemoryToast
        content="test memory"
        visible={true}
        onDismiss={() => {}}
      />,
    );

    const content = screen.getByTestId("memory-toast-content");
    expect(content.className).toContain("font-mono");
  });
});
