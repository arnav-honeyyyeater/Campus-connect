import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/modal";

describe("<Modal />", () => {
  it("renders content when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Create Post">
        <p>Post editor content</p>
      </Modal>
    );

    expect(screen.getByText("Create Post")).toBeInTheDocument();
    expect(screen.getByText("Post editor content")).toBeInTheDocument();
  });

  it("does not render dialog content when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
        <p>Hidden content</p>
      </Modal>
    );

    expect(screen.queryByText("Hidden Modal")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Dismissable Modal">
        <p>Modal body</p>
      </Modal>
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
