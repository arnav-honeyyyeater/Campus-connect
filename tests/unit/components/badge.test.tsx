import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge } from "@/components/ui/badge";

describe("<Badge />", () => {
  it("renders badge text with rounded-full pill styling", () => {
    render(<Badge variant="lime">Coding Club</Badge>);
    const badge = screen.getByText("Coding Club");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("rounded-full");
    expect(badge).toHaveClass("bg-campus-lime");
  });

  it("handles onRemove button click and stops event propagation", async () => {
    const handleRemove = vi.fn();
    const handleBadgeClick = vi.fn();

    render(
      <Badge variant="coral" onRemove={handleRemove} onClick={handleBadgeClick}>
        Tag
      </Badge>
    );

    const removeButton = screen.getByRole("button", { name: /remove tag/i });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleBadgeClick).not.toHaveBeenCalled();
  });
});
