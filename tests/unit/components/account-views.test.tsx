import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccountViews } from "@/components/campus/account-views";

const { store, profile, push } = vi.hoisted(() => ({
  store: {
    signInWithRegistration: vi.fn(),
    updateProfile: vi.fn(),
    getConversations: vi.fn(),
    getConversationById: vi.fn(),
    getMessages: vi.fn(),
    markConversationRead: vi.fn(),
    sendMessage: vi.fn(),
    getProfileByHandle: vi.fn(),
    getPosts: vi.fn(),
    getFriendshipStatus: vi.fn(),
    sendFriendRequest: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
  profile: { id: "me", displayName: "Campus Student", handle: "student", bio: "Hello campus", course: "BCA", yearOfStudy: 2, avatarUrl: "", interests: [] },
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/mock-store/context", () => ({ useMockStore: () => ({ store, currentUser: { id: "me" }, currentProfile: profile }) }));

describe("account views", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(cleanup);

  it("preserves profile edits after a failed save and allows retry", async () => {
    store.updateProfile.mockRejectedValueOnce(new Error("Storage unavailable")).mockResolvedValueOnce(profile);
    render(<AccountViews section="settings" onError={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Updated Student" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Storage unavailable");
    expect(screen.getByLabelText("Display name")).toHaveValue("Updated Student");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Profile updated");
    expect(store.updateProfile).toHaveBeenLastCalledWith({ displayName: "Updated Student", bio: "Hello campus", course: "BCA", yearOfStudy: 2 });
  });

  it("retains an unsent chat message when sending fails", async () => {
    const conversation = { id: "chat", type: "direct", members: [{ userId: "me", status: "accepted" }], otherParticipant: { displayName: "Classmate" }, unreadCount: 0 };
    store.getConversations.mockResolvedValue([conversation]);
    store.getConversationById.mockResolvedValue(conversation);
    store.getMessages.mockResolvedValue([]);
    store.sendMessage.mockRejectedValue(new Error("Message not saved"));
    const onError = vi.fn();
    render(<AccountViews section="messages" id="chat" onError={onError} />);
    const composer = await screen.findByLabelText("Message");
    fireEvent.change(composer, { target: { value: "See you at campus" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith("Message not saved"));
    expect(composer).toHaveValue("See you at campus");
    expect(store.sendMessage).toHaveBeenCalledWith({ conversationId: "chat", content: "See you at campus" });
  });

  it("accepts an incoming friend request and shows the resulting friendship", async () => {
    store.getProfileByHandle.mockResolvedValue({ ...profile, id: "classmate", handle: "classmate", displayName: "Campus Classmate", createdAt: "2026-08-15T10:00:00Z" });
    store.getPosts.mockResolvedValue({ items: [], hasMore: false });
    store.getFriendshipStatus.mockResolvedValue("pending_received");
    store.sendFriendRequest.mockResolvedValue({ status: "accepted" });
    render(<AccountViews section="profile" id="classmate" onError={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept request" }));
    expect(await screen.findByRole("button", { name: "Friends" })).toBeDisabled();
    expect(store.sendFriendRequest).toHaveBeenCalledWith("classmate");
  });

  it("continues with any nonempty registration number without a password", async () => {
    store.signInWithRegistration.mockResolvedValue({ profile });
    render(<AccountViews section="login" onError={vi.fn()} />);
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /create|reset|forgot/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Registration number"), { target: { value: " x " } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(store.signInWithRegistration).toHaveBeenCalledWith("x"));
    expect(push).toHaveBeenCalledWith("/feed");
  });

  it("keeps the registration entry when continuing fails", async () => {
    store.signInWithRegistration.mockRejectedValue(new Error("Couldn’t continue. Try again."));
    render(<AccountViews section="signup" onError={vi.fn()} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Registration number"), { target: { value: "A" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t continue. Try again.");
    expect(screen.getByLabelText("Registration number")).toHaveValue("A");
  });
});
