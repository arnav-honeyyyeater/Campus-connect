import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommunityViews } from "@/components/campus/community-views";
import type { SearchResults } from "@/lib/mock-store/types";

const { store } = vi.hoisted(() => ({ store: {
  getClubs: vi.fn(), getEvents: vi.fn(), search: vi.fn(), subscribe: vi.fn(() => () => {}), toggleClubMembership: vi.fn(),
} }));
vi.mock("@/lib/mock-store/context", () => ({ useMockStore: () => ({ store, currentUser: { id: "self" } }) }));

const empty: SearchResults = { people: [], clubs: [], events: [], posts: [], tags: [] };

afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks(); });

describe("campus discovery", () => {
  it("starts empty without fetching suggested profiles or showing invented images", async () => {
    store.getClubs.mockResolvedValue([]);
    store.getEvents.mockResolvedValue([]);
    render(<CommunityViews section="discover" onError={vi.fn()} />);
    expect(await screen.findByText("Find your campus")).toBeInTheDocument();
    expect(store.search).not.toHaveBeenCalled();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("keeps newer search results when an older response arrives late", async () => {
    vi.useFakeTimers();
    store.getClubs.mockResolvedValue([]);
    store.getEvents.mockResolvedValue([]);
    let finishOld!: (value: SearchResults) => void;
    const oldSearch = new Promise<SearchResults>(resolve => { finishOld = resolve; });
    store.search.mockImplementation((query: string) => query === "old" ? oldSearch : Promise.resolve(empty));
    render(<CommunityViews section="discover" onError={vi.fn()} />);
    await act(async () => {});
    const input = screen.getByRole("searchbox", { name: "Search students, clubs, events and posts" });
    fireEvent.change(input, { target: { value: "old" } });
    await act(async () => { vi.advanceTimersByTime(350); });
    fireEvent.change(input, { target: { value: "new" } });
    await act(async () => { vi.advanceTimersByTime(350); });
    expect(screen.getByText("No matches for “new”")).toBeInTheDocument();
    await act(async () => { finishOld({ ...empty, people: [{ id: "old", displayName: "Stale person", handle: "stale", avatarUrl: "", bio: "", course: "BCA", yearOfStudy: 1, interests: [], createdAt: "", updatedAt: "" }] }); });
    expect(screen.queryByText("Stale person")).not.toBeInTheDocument();
    expect(screen.getByText("No matches for “new”")).toBeInTheDocument();
  });

  it("keeps a failed club join available to retry and reports the error", async () => {
    store.getClubs.mockResolvedValue([{ id: "coding", name: "Coding Club", slug: "coding", description: "Build together.", category: "Tech", coverImageUrl: "/test-club.jpg", memberCount: 3, isJoined: false }]);
    store.getEvents.mockResolvedValue([]);
    store.search.mockResolvedValue(empty);
    store.toggleClubMembership.mockRejectedValue(new Error("Unable to save. Try again."));
    const onError = vi.fn();
    render(<CommunityViews section="clubs" onError={onError} />);
    const join = await screen.findByRole("button", { name: "Join Coding Club" });
    fireEvent.click(join);
    await waitFor(() => expect(onError).toHaveBeenCalledWith("Unable to save. Try again."));
    expect(join).not.toBeDisabled();
    expect(join).toHaveAttribute("aria-pressed", "false");
    expect(store.toggleClubMembership).toHaveBeenCalledWith("coding");
  });
});
