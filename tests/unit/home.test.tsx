import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows the app name and slogan", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "CleanUp Map" })).toBeInTheDocument();
    expect(screen.getByText("See it. Map it. Clean it. Together.")).toBeInTheDocument();
  });
});
