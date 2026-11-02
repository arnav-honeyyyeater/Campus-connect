import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FeedView, PostComposer } from "@/components/campus/feed";

const { store, profile } = vi.hoisted(() => ({
  store: {
    getPosts: vi.fn(),
    getComments: vi.fn(),
    toggleReaction: vi.fn(),
    toggleBookmark: vi.fn(),
    addComment: vi.fn(),
    createPost: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
  profile: { id: "me", displayName: "Campus Student", handle: "student", avatarUrl: "" },
}));

vi.mock("@/lib/mock-store/context", () => ({ useMockStore: () => ({ store, currentUser: { id: "me" }, currentProfile: profile }) }));

const post = {
  id: "moment", authorId: "classmate", author: { displayName: "My Classmate", handle: "classmate", avatarUrl: "" },
  content: "A campus moment", createdAt: "2026-10-30T10:00:00Z", attachments: [], isPinned: false, isBookmarked: false,
  reactions: { like: 0, love: 0, laugh: 0, fire: 0, clap: 0 }, commentsCount: 0,
};

describe("campus feed", () => {
  beforeEach(() => { vi.clearAllMocks(); store.getPosts.mockResolvedValue({ items: [post], hasMore: false }); });
  afterEach(cleanup);

  it("saves a post and sends a comment through the existing store", async () => {
    store.toggleBookmark.mockResolvedValue(true);
    store.getComments.mockResolvedValue([]);
    store.addComment.mockResolvedValue({ id: "comment", content: "See you there", author: profile, createdAt: "2026-10-31T10:00:00Z" });
    const onNotice = vi.fn();
    render(<FeedView mode="feed" clubs={[]} onCompose={vi.fn()} onNotice={onNotice} />);
    fireEvent.click(await screen.findByRole("button", { name: "Save post" }));
    expect(await screen.findByRole("button", { name: "Unsave post" })).toHaveAttribute("aria-pressed", "true");
    expect(store.toggleBookmark).toHaveBeenCalledWith("moment");
    fireEvent.click(screen.getByRole("button", { name: "Show comments" }));
    const composer = await screen.findByLabelText("Add a comment");
    fireEvent.change(composer, { target: { value: "See you there" } });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));
    expect(await screen.findByText("See you there")).toBeInTheDocument();
    expect(store.addComment).toHaveBeenCalledWith("moment", "See you there");
    expect(composer).toHaveValue("");
  });

  it("retains a post draft after publishing fails", async () => {
    store.createPost.mockRejectedValue(new Error("Please try sharing again"));
    const onClose = vi.fn();
    render(<PostComposer open onClose={onClose} onNotice={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Post text"), { target: { value: "My campus moment" } });
    fireEvent.click(screen.getByRole("button", { name: "Share post" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please try sharing again");
    expect(screen.getByLabelText("Post text")).toHaveValue("My campus moment");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("rejects oversized local uploads before reading or publishing them", async () => {
    render(<PostComposer open onClose={vi.fn()} onNotice={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Add photos"), { target: { files: [new File([new Uint8Array(1024 * 1024 + 1)], "large.png", { type: "image/png" })] } });
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("under 1 MB combined"));
    expect(screen.getByRole("button", { name: "Share post" })).toBeDisabled();
    expect(store.createPost).not.toHaveBeenCalled();
  });
});

