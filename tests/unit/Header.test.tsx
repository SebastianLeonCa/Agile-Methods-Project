import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

// UserMenu is an async Server Component that reads cookies; it is covered by the e2e tests.
vi.mock("@/components/UserMenu", () => ({ default: () => <div>user menu</div> }));

describe("Header", () => {
  it("shows the logo, the Map link and the user menu", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "CleanUp Map home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute("href", "/map");
    expect(screen.getByText("user menu")).toBeInTheDocument();
  });
});
