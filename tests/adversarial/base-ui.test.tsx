import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Milestone 1 Adversarial Challenge: Base UI Component Library", () => {
  /* =========================================================================
     1. COMPONENT EDGE CASES (Input & Button)
     ========================================================================= */
  describe("1. Component Edge Cases", () => {
    describe("Input Edge Cases", () => {
      it("renders cleanly with empty strings for label, error, and helperText without orphan elements", () => {
        render(
          <Input
            id="empty-test"
            label=""
            error=""
            helperText=""
            placeholder="Empty prop test"
          />
        );
        const input = screen.getByPlaceholderText("Empty prop test");
        expect(input).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "false");
      });

      it("handles extremely long values (10,000 characters) without truncating or failing", () => {
        const longValue = "A".repeat(10000);
        const handleChange = vi.fn();
        render(
          <Input
            id="long-value-test"
            value={longValue}
            onChange={handleChange}
            placeholder="Long string test"
          />
        );
        const input = screen.getByPlaceholderText("Long string test") as HTMLInputElement;
        expect(input.value.length).toBe(10000);
      });

      it("handles hostile special characters, emojis, HTML injections, and RTL text", () => {
        const maliciousPayload = "<script>alert('xss')</script>\"'`; &amp; \u200B\u200E";
        const emojiPayload = "🚀🎓🔥💯 — Special Characters 測試 ةيبرعل";
        render(
          <Input
            id="special-char-input"
            label={maliciousPayload}
            helperText={emojiPayload}
            placeholder="Payloads"
          />
        );
        // Ensure text is rendered as safe text content, not interpreted as HTML DOM nodes
        expect(screen.getByText(maliciousPayload)).toBeInTheDocument();
        expect(screen.getByText(emojiPayload)).toBeInTheDocument();
        expect(document.querySelector("script")).toBeNull();
      });

      it("supports controlled typing of hostile injection sequences", async () => {
        const user = userEvent.setup();
        function ControlledInput() {
          const [val, setVal] = React.useState("");
          return (
            <Input
              id="controlled-hostile"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Type payload"
            />
          );
        }
        render(<ControlledInput />);
        const input = screen.getByPlaceholderText("Type payload");
        await user.type(input, "<test>&amp;'\"");
        expect(input).toHaveValue("<test>&amp;'\"");
      });
    });

    describe("Button Edge Cases", () => {
      it("renders without error when children is an empty string or null", () => {
        const { container } = render(<Button aria-label="empty-button">{""}</Button>);
        const btn = screen.getByRole("button", { name: "empty-button" });
        expect(btn).toBeInTheDocument();
        expect(container.firstChild).toBeInTheDocument();
      });

      it("renders extremely long unbroken text without throwing runtime exceptions", () => {
        const extremeText = "UNBROKEN_LONG_TEXT_".repeat(200);
        render(<Button>{extremeText}</Button>);
        const btn = screen.getByRole("button");
        expect(btn).toHaveTextContent(extremeText);
      });

      it("renders special characters and emojis safely", () => {
        const specialString = "<svg onload=alert(1)> & ' \" 🎓 Lavasa #1";
        render(<Button>{specialString}</Button>);
        expect(screen.getByRole("button")).toHaveTextContent(specialString);
        expect(document.querySelector("svg[onload]")).toBeNull();
      });

      it("polymorphic asChild renders slot child element cleanly", () => {
        render(
          <Button asChild>
            <a href="/login" data-testid="anchor-btn">
              Login Link
            </a>
          </Button>
        );
        const anchor = screen.getByTestId("anchor-btn");
        expect(anchor.tagName.toLowerCase()).toBe("a");
        expect(anchor).toHaveAttribute("href", "/login");
        expect(anchor).toHaveClass("bg-campus-lime");
      });
    });
  });

  /* =========================================================================
     2. BUTTON LOADING STATE VERIFICATION
     ========================================================================= */
  describe("2. Button Loading State Invariants", () => {
    it("disables the button and marks aria-busy when isLoading is true", () => {
      render(
        <Button isLoading loadingText="Submitting...">
          Submit
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Submitting...")).toBeInTheDocument();
      // Original children replaced or loadingText displayed
      expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    });

    it("falls back to children when loadingText is omitted", () => {
      render(<Button isLoading>Confirm Action</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    it("strictly prevents onClick handlers from firing when isLoading is true", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Click Me
        </Button>
      );
      const button = screen.getByRole("button");
      await user.click(button);
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("strictly prevents form submission when submit button is in isLoading state", async () => {
      const user = userEvent.setup();
      const handleFormSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={handleFormSubmit}>
          <input name="test-field" defaultValue="Campus Lavasa" />
          <Button type="submit" isLoading={true} loadingText="Saving...">
            Submit Form
          </Button>
        </form>
      );
      const submitBtn = screen.getByRole("button");
      expect(submitBtn).toBeDisabled();

      // Attempt clicking the button
      await user.click(submitBtn);
      fireEvent.click(submitBtn);

      // Form submission should be prevented
      expect(handleFormSubmit).not.toHaveBeenCalled();
    });

    it("allows form submission when isLoading is false", async () => {
      const user = userEvent.setup();
      const handleFormSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={handleFormSubmit}>
          <input name="test-field" defaultValue="Campus Lavasa" />
          <Button type="submit" isLoading={false}>
            Submit Form
          </Button>
        </form>
      );
      const submitBtn = screen.getByRole("button", { name: "Submit Form" });
      expect(submitBtn).not.toBeDisabled();
      await user.click(submitBtn);
      expect(handleFormSubmit).toHaveBeenCalledTimes(1);
    });
  });

  /* =========================================================================
     3. BADGE PILL INVARIANT (Strictly rounded-full)
     ========================================================================= */
  describe("3. Badge Pill Invariant", () => {
    const variants = [
      "default",
      "lime",
      "coral",
      "outline",
      "success",
      "warning",
      "destructive",
    ] as const;

    const sizes = ["sm", "md", "lg"] as const;

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        it(`enforces rounded-full class for variant="${variant}" and size="${size}"`, () => {
          const { container } = render(
            <Badge variant={variant} size={size}>
              {variant}-{size}
            </Badge>
          );
          const badge = container.firstChild as HTMLElement;
          expect(badge).toHaveClass("rounded-full");
        });
      });
    });

    it("ensures remove button inside badge also adheres to pill/circular invariant", () => {
      const handleRemove = vi.fn();
      render(
        <Badge variant="lime" onRemove={handleRemove} removeAriaLabel="Dismiss tag">
          Lavasa Tag
        </Badge>
      );
      const removeBtn = screen.getByRole("button", { name: "Dismiss tag" });
      expect(removeBtn).toHaveClass("rounded-full");
    });

    it("stops click propagation on badge removal to parent element", async () => {
      const user = userEvent.setup();
      const handleParentClick = vi.fn();
      const handleRemove = vi.fn();
      render(
        <div onClick={handleParentClick}>
          <Badge onRemove={handleRemove}>Clickable Tag</Badge>
        </div>
      );
      const removeBtn = screen.getByRole("button", { name: /remove tag/i });
      await user.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledTimes(1);
      expect(handleParentClick).not.toHaveBeenCalled();
    });
  });

  /* =========================================================================
     4. CARD COMPOUND COMPONENT COMPOSITION & NESTING
     ========================================================================= */
  describe("4. Card Compound Component Composition & Nesting", () => {
    it("renders complete compound hierarchy correctly", () => {
      render(
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>HackLavasa Announcement</CardTitle>
            <CardDescription>Join the 24h innovation sprint</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main body content with details</p>
          </CardContent>
          <CardFooter>
            <button>Register Now</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText("HackLavasa Announcement")).toBeInTheDocument();
      expect(screen.getByText("Join the 24h innovation sprint")).toBeInTheDocument();
      expect(screen.getByText("Main body content with details")).toBeInTheDocument();
      expect(screen.getByText("Register Now")).toBeInTheDocument();
    });

    it("forwards refs cleanly across all 6 compound card primitives", () => {
      const cardRef = React.createRef<HTMLDivElement>();
      const headerRef = React.createRef<HTMLDivElement>();
      const titleRef = React.createRef<HTMLHeadingElement>();
      const descRef = React.createRef<HTMLParagraphElement>();
      const contentRef = React.createRef<HTMLDivElement>();
      const footerRef = React.createRef<HTMLDivElement>();

      render(
        <Card ref={cardRef}>
          <CardHeader ref={headerRef}>
            <CardTitle ref={titleRef}>Title</CardTitle>
            <CardDescription ref={descRef}>Description</CardDescription>
          </CardHeader>
          <CardContent ref={contentRef}>Content</CardContent>
          <CardFooter ref={footerRef}>Footer</CardFooter>
        </Card>
      );

      expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
      expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
      expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
      expect(descRef.current).toBeInstanceOf(HTMLParagraphElement);
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it("supports deep multi-level card nesting without layout collision", () => {
      render(
        <Card data-testid="card-level-1">
          <CardHeader>
            <CardTitle>Level 1 Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card data-testid="card-level-2">
              <CardHeader>
                <CardTitle>Level 2 Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Card data-testid="card-level-3">
                  <CardContent>
                    <p>Level 3 Nested Content</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      const level1 = screen.getByTestId("card-level-1");
      const level2 = screen.getByTestId("card-level-2");
      const level3 = screen.getByTestId("card-level-3");

      expect(level1).toContainElement(level2);
      expect(level2).toContainElement(level3);
      expect(screen.getByText("Level 3 Nested Content")).toBeInTheDocument();
    });

    it("supports partial composition without header or footer", () => {
      render(
        <Card>
          <CardContent>
            <p>Standalone Content Card</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText("Standalone Content Card")).toBeInTheDocument();
    });
  });

  /* =========================================================================
     5. MODAL FOCUS TRAPPING, ESCAPE DISMISSAL & BODY SCROLL LOCKING
     ========================================================================= */
  describe("5. Modal Focus Trapping, Escape Dismissal & Body Scroll Locking", () => {
    it("renders modal dialog in portal with proper ARIA attributes when isOpen is true", () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Campus Modal Title"
          description="Description text"
        >
          <p>Dialog inner body</p>
        </Modal>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(screen.getByText("Campus Modal Title")).toBeInTheDocument();
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("dismisses modal when Escape key is pressed", async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Escape Test">
          <p>Press escape</p>
        </Modal>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
      expect(handleClose).toHaveBeenCalled();
    });

    it("dismisses modal on close button click", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Close Button Test">
          <p>Click X</p>
        </Modal>
      );

      const closeBtn = screen.getByRole("button", { name: /close/i });
      await user.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("locks body pointer-events / interaction while modal is open and restores on unmount", () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}} title="Scroll Lock Test">
          <p>Modal Open</p>
        </Modal>
      );

      // Radix Dialog locks pointer-events on body or adds data attribute during open state
      expect(document.body.style.pointerEvents || document.body.hasAttribute("data-scroll-locked")).toBeTruthy();

      unmount();
      // On unmount/close, body should not remain permanently locked
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
  });

  /* =========================================================================
     6. TABS KEYBOARD NAVIGATION & ACCESSIBILITY
     ========================================================================= */
  describe("6. Tabs Keyboard Navigation & Active State Switching", () => {
    it("manages aria-selected and roving tabIndex accurately", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Panel 1</TabsContent>
          <TabsContent value="tab2">Panel 2</TabsContent>
          <TabsContent value="tab3">Panel 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });
      const tab3 = screen.getByRole("tab", { name: "Tab 3" });

      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab1).toHaveAttribute("tabindex", "0");

      expect(tab2).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("tabindex", "-1");

      expect(tab3).toHaveAttribute("aria-selected", "false");
      expect(tab3).toHaveAttribute("tabindex", "-1");
    });

    it("navigates tabs using ArrowRight, ArrowLeft, Home, and End keys", async () => {
      render(
        <Tabs defaultValue="campus">
          <TabsList>
            <TabsTrigger value="campus">Campus</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
          </TabsList>
          <TabsContent value="campus">Campus Content</TabsContent>
          <TabsContent value="friends">Friends Content</TabsContent>
          <TabsContent value="clubs">Clubs Content</TabsContent>
        </Tabs>
      );

      const campusTab = screen.getByRole("tab", { name: "Campus" });
      const friendsTab = screen.getByRole("tab", { name: "Friends" });
      const clubsTab = screen.getByRole("tab", { name: "Clubs" });

      campusTab.focus();
      expect(document.activeElement).toBe(campusTab);

      // ArrowRight to Friends
      fireEvent.keyDown(campusTab, { key: "ArrowRight", code: "ArrowRight" });
      await waitFor(() => {
        expect(friendsTab).toHaveAttribute("aria-selected", "true");
        expect(screen.getByText("Friends Content")).toBeInTheDocument();
      });

      // ArrowRight to Clubs
      fireEvent.keyDown(friendsTab, { key: "ArrowRight", code: "ArrowRight" });
      await waitFor(() => {
        expect(clubsTab).toHaveAttribute("aria-selected", "true");
        expect(screen.getByText("Clubs Content")).toBeInTheDocument();
      });

      // ArrowLeft back to Friends
      fireEvent.keyDown(clubsTab, { key: "ArrowLeft", code: "ArrowLeft" });
      await waitFor(() => {
        expect(friendsTab).toHaveAttribute("aria-selected", "true");
      });

      // Home key back to first tab (Campus)
      fireEvent.keyDown(friendsTab, { key: "Home", code: "Home" });
      await waitFor(() => {
        expect(campusTab).toHaveAttribute("aria-selected", "true");
      });

      // End key to last tab (Clubs)
      fireEvent.keyDown(campusTab, { key: "End", code: "End" });
      await waitFor(() => {
        expect(clubsTab).toHaveAttribute("aria-selected", "true");
      });
    });

    it("renders underline variant tabs with active border styling", () => {
      render(
        <Tabs defaultValue="overview">
          <TabsList variant="underline">
            <TabsTrigger value="overview" variant="underline">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" variant="underline">
              Members
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview Details</TabsContent>
          <TabsContent value="members">Members List</TabsContent>
        </Tabs>
      );

      const overviewTab = screen.getByRole("tab", { name: "Overview" });
      expect(overviewTab).toHaveClass("border-b-2");
      expect(screen.getByText("Overview Details")).toBeInTheDocument();
    });
  });

  /* =========================================================================
     7. ZERO HORIZONTAL OVERFLOW UNDER EXTREME CONTENT
     ========================================================================= */
  describe("7. Zero Horizontal Overflow Under Extreme Content", () => {
    it("Card enforces overflow-hidden to contain extreme unbounded child contents", () => {
      const extremeString = "https://campus-connect.christuniversity.lavasa/feed/post/".concat(
        "A".repeat(1000)
      );
      const { container } = render(
        <Card data-testid="overflow-card">
          <CardHeader>
            <CardTitle>{extremeString}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{extremeString}</p>
          </CardContent>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("overflow-hidden");
      expect(card).toHaveClass("rounded-2xl");
    });

    it("Input container uses w-full and flex-col to avoid horizontal extrusion", () => {
      const { container } = render(
        <Input
          label="Label that might be long"
          placeholder="Placeholder text"
          value={"SuperLongTokenWithoutSpaces".repeat(30)}
          onChange={() => {}}
        />
      );

      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("w-full");
      expect(root).toHaveClass("flex-col");
    });

    it("Modal content container enforces max-w-lg and overflow-y-auto bounds", () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Extreme Content Modal"
        >
          <p>{"OverflowParagraphText".repeat(100)}</p>
        </Modal>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("overflow-y-auto");
      expect(dialog).toHaveClass("max-w-lg");
      expect(dialog).toHaveClass("max-h-[90vh]");
    });
  });
});
