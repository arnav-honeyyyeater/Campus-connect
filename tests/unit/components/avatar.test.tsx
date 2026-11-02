import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("<Avatar />", () => {
  it("renders fallback initials when name is provided without src", () => {
    render(<Avatar name="Arnav Sharma" />);
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("renders default fallback initials when neither src nor name is provided", () => {
    render(<Avatar />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("renders status indicator when status is online", () => {
    render(<Avatar name="Priya K" status="online" />);
    const statusIndicator = screen.getByLabelText("Status: online");
    expect(statusIndicator).toBeInTheDocument();
    expect(statusIndicator).toHaveClass("bg-green-500");
  });
});
