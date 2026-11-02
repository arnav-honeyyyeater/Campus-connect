import { describe, it, expect, beforeEach } from "vitest";
import { MockStore } from "@/lib/mock-store/store";

describe("MockStore - Messaging & Groups", () => {
  let store: MockStore;

  beforeEach(() => {
    store = MockStore.getInstance();
    store.resetToDefaultSeeds();
  });

  it("getConversations returns conversations for the logged in user", async () => {
    const convs = await store.getConversations();
    expect(convs.length).toBeGreaterThan(0);
    const directChat = convs.find((c) => c.type === "direct");
    expect(directChat).toBeDefined();
    expect(directChat?.otherParticipant).toBeDefined();
  });

  it("sendMessage appends message and updates conversation snippet", async () => {
    const convs = await store.getConversations();
    const convId = convs[0].id;

    const sent = await store.sendMessage({
      conversationId: convId,
      content: "Testing real-time message sync",
    });

    expect(sent.content).toBe("Testing real-time message sync");
    expect(sent.sender?.displayName).toBe("Arnav Sharma");

    const messages = await store.getMessages(convId);
    expect(messages.some((m) => m.id === sent.id)).toBe(true);

    const updatedConv = await store.getConversationById(convId);
    expect(updatedConv?.lastMessagePreview).toBe("Testing real-time message sync");
  });

  it("createGroup creates group with members and enforces 30 member cap", async () => {
    const newGroup = await store.createGroup("BSc DS Study Squad", [
      "usr_priya_k",
      "usr_rahul_v",
      "usr_sneha_m",
    ]);

    expect(newGroup.type).toBe("group");
    expect(newGroup.title).toBe("BSc DS Study Squad");
    expect(newGroup.members.length).toBe(4); // includes creator

    const excessiveMembers = Array.from({ length: 31 }, (_, i) => `usr_mock_${i}`);
    await expect(store.createGroup("Too Big", excessiveMembers)).rejects.toThrow(
      "Group chat capacity is limited to 30 members."
    );
  });
});
