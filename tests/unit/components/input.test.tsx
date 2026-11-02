import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("<Input />", () => {
  it("renders with label linked to input", () => {
    render(<Input label="Registration Number" id="reg-input" placeholder="2441001" />);
    const label = screen.getByText("Registration Number");
    const input = screen.getByPlaceholderText("2441001");
    expect(label).toHaveAttribute("for", "reg-input");
    expect(input).toHaveAttribute("id", "reg-input");
  });

  it("handles typing values correctly", async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await userEvent.type(input, "Campus Connect");
    expect(input).toHaveValue("Campus Connect");
  });

  it("renders error message with alert role and aria-invalid", () => {
    render(
      <Input
        label="Password"
        id="pwd"
        error="Password must be at least 8 characters"
      />
    );
    const input = screen.getByLabelText("Password");
    const errorMsg = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(errorMsg).toHaveTextContent("Password must be at least 8 characters");
  });

  it("renders disabled state", () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();
  });
});
