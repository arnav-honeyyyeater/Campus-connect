import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SimpleTooltip } from "@/components/ui/tooltip";

describe("<SimpleTooltip />", () => {
  it("renders trigger element without errors", () => {
    render(
      <SimpleTooltip content="Helpful information">
        <button>Hover me</button>
      </SimpleTooltip>
    );

    expect(screen.getByRole("button", { name: "Hover me" })).toBeInTheDocument();
  });
});
