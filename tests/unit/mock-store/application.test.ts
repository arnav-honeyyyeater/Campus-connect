import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockStore } from "@/lib/mock-store/store";

describe("Campus application data", () => {
  beforeEach(() => { window.localStorage.clear(); });

  it("starts empty and keeps legacy sample storage separate", async () => {
    MockStore.getInstance().resetToDefaultSeeds();
    const legacy = window.localStorage.getItem("cc_mock_posts");
    const store = MockStore.createApplicationStore();

    expect(store.getSession()).toBeNull();
    expect((await store.getPosts()).items).toEqual([]);
    expect(await store.getClubs()).toEqual([]);
    expect(await store.getEvents()).toEqual([]);
    expect(await store.getConversations()).toEqual([]);
    expect(await store.getCreations()).toEqual([]);
    expect(await store.getStickerPacks()).toEqual([]);
    expect(await store.getNotifications()).toEqual([]);
    expect((await store.search("a")).people).toEqual([]);
    expect((await store.search("")).tags).toEqual([]);
    expect(window.localStorage.getItem("cc_mock_posts")).toBe(legacy);
  });

  it("accepts any nonempty registration and reloads only user-entered data", async () => {
    const store = MockStore.createApplicationStore();
    await expect(store.signInWithRegistration("   ")).rejects.toThrow("Enter your registration number");
    const session = await store.signInWithRegistration(" x ");
    expect(session.user.normalizedRegNumber).toBe("X");
    expect(session.user.passwordHash).toBe("");
    expect(session.profile).toMatchObject({ displayName: "X", avatarUrl: "", bio: "", course: "", yearOfStudy: 0, interests: [] });
    expect((await store.getSettings()).theme).toBe("dark");
    await store.updateProfile({ displayName: "My own name" });
    const post = await store.createPost({ content: "My first real campus post" });

    const reloaded = MockStore.createApplicationStore();
    expect(reloaded.getCurrentProfile()?.displayName).toBe("My own name");
    expect((await reloaded.getPosts()).items.map(item => item.id)).toEqual([post.id]);
    expect((await reloaded.signInWithRegistration("x")).user.id).toBe(session.user.id);
    await reloaded.logout();
    expect(MockStore.createApplicationStore().getSession()).toBeNull();
  });

  it("does not generate sample peer replies in application conversations", async () => {
    const store = MockStore.createApplicationStore();
    const session = await store.signInWithRegistration("MY-REG");
    window.localStorage.setItem("cc_app_conversations", JSON.stringify([{
      id: "direct", type: "direct", creatorId: session.user.id, unreadCount: 0, lastMessageAt: new Date().toISOString(),
      members: [{ userId: session.user.id, status: "accepted" }, { userId: "usr_priya_k", status: "accepted" }],
    }]));
    const reloaded = MockStore.createApplicationStore();

    vi.useFakeTimers();
    try {
      const sending = reloaded.sendMessage({ conversationId: "direct", content: "A real message" });
      await vi.runAllTimersAsync();
      await sending;
      expect(JSON.parse(window.localStorage.getItem("cc_app_messages") || "[]")).toHaveLength(1);
    } finally { vi.useRealTimers(); }
  });

  it("keeps the current profile when browser storage rejects a registration", async () => {
    const store = MockStore.createApplicationStore();
    const existing = await store.signInWithRegistration("MY-REG");
    const persistedSession = window.localStorage.getItem("cc_app_session");
    const changed = vi.fn();
    const unsubscribe = store.subscribe(changed);
    const write = vi.spyOn(window.localStorage, "setItem").mockImplementationOnce(() => { throw new DOMException("Storage is full", "QuotaExceededError"); });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await expect(store.signInWithRegistration("OTHER-REG")).rejects.toThrow("Your registration could not be saved");
      expect(store.getCurrentUser()?.id).toBe(existing.user.id);
      expect(window.localStorage.getItem("cc_app_session")).toBe(persistedSession);
      expect((await store.search("OTHER-REG")).people).toEqual([]);
      expect(changed).not.toHaveBeenCalled();
    } finally { unsubscribe(); write.mockRestore(); warn.mockRestore(); }
  });
});
