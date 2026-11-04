import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

// UserMenu is an async Server Component that reads cookies; it is covered by the e2e tests.
vi.mock("@/components/UserMenu", () => ({ default: () => <nav>user menu</nav> }));

describe("Header", () => {
  it("shows the app name, slogan and user menu", () => {
    render(<Header />);
    expect(screen.getByRole("heading", { level: 1, name: "CleanUp Map" })).toBeInTheDocument();
    expect(screen.getByText("See it. Map it. Clean it. Together.")).toBeInTheDocument();
    expect(screen.getByText("user menu")).toBeInTheDocument();
  });
});
