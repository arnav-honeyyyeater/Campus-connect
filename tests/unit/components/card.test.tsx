import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("<Card />", () => {
  it("renders compound card structure", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>HackLavasa 2026</CardTitle>
          <CardDescription>24-hour hackathon</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Details about the hackathon</p>
        </CardContent>
        <CardFooter>
          <span>Central Block</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText("HackLavasa 2026")).toBeInTheDocument();
    expect(screen.getByText("24-hour hackathon")).toBeInTheDocument();
    expect(screen.getByText("Details about the hackathon")).toBeInTheDocument();
    expect(screen.getByText("Central Block")).toBeInTheDocument();
  });

  it("applies interactive variant styling", () => {
    const { container } = render(<Card variant="interactive">Content</Card>);
    expect(container.firstChild).toHaveClass("cursor-pointer");
  });
});
