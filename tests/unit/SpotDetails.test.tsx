import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SpotDetails from "@/components/SpotDetails";
import { makeSpot } from "./fixtures";

describe("SpotDetails", () => {
  it("shows the spot's photo, title, description, labels, address and date", () => {
    render(<SpotDetails spot={makeSpot()} onClose={() => {}} />);

    expect(screen.getByRole("heading", { name: "Plastic around Panther Hollow Lake" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Spot photo" })).toHaveAttribute(
      "src",
      "https://picsum.photos/seed/cleanup-1/800/600",
    );
    expect(screen.getByText("Bottles and plastic bags along the edge of the lake.")).toBeInTheDocument();
    expect(screen.getByText("Park")).toBeInTheDocument();
    expect(screen.getByText(/High urgency/)).toBeInTheDocument();
    expect(screen.getByText("Needs cleanup")).toBeInTheDocument();
    expect(screen.getByText(/Panther Hollow Lake, Schenley Park, Pittsburgh/)).toBeInTheDocument();
    expect(screen.getByText(/Nov 1, 2026/)).toBeInTheDocument();
  });

  it("shows before and after photos for a cleaned spot", () => {
    render(
      <SpotDetails
        spot={makeSpot({ status: "clean", after_photo_url: "https://picsum.photos/seed/after/800/600" })}
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole("img", { name: "Before photo" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "After photo" })).toBeInTheDocument();
    expect(screen.getByText("Clean")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<SpotDetails spot={makeSpot()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close details" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
