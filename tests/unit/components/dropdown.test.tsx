import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

describe("<DropdownMenu />", () => {
  it("opens menu and handles item selection", async () => {
    const handleEdit = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>Options</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEdit}>Edit Post</DropdownMenuItem>
          <DropdownMenuItem destructive>Delete Post</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole("button", { name: "Options" });
    await userEvent.click(trigger);

    const editItem = screen.getByText("Edit Post");
    expect(editItem).toBeInTheDocument();

    await userEvent.click(editItem);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });
});
