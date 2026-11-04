import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AuthPromptModal from "@/components/AuthPromptModal";

describe("AuthPromptModal", () => {
  it("asks the visitor to log in and links back to where they were", () => {
    render(<AuthPromptModal action="report a spot" next="/map" onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Log in to report a spot" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fmap");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup?next=%2Fmap");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveFocus();
  });

  it("closes with Escape and with Not now", () => {
    const onClose = vi.fn();
    render(<AuthPromptModal action="report a spot" next="/map" onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
