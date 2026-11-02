import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Messaging & Conversations Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(async () => {
    harness = new TestStoreHarness();
    // Establish mutual friendship between Priya (user_priya_01) and Rahul (user_rahul_02)
    const req = await harness.sendFriendRequest('user_rahul_02');
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.respondFriendRequest(req.id, 'accept');
    // Switch back to Priya
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
  });

  it('T1-MSG-01: opens direct conversation between mutual friends (/messages/[id])', async () => {
    // Feature 27: Messaging Conversations
    const conv = await harness.getOrCreateDirectConversation('user_rahul_02');

    expect(conv).toBeDefined();
    expect(conv.type).toBe('direct');
    expect(conv.otherParticipant?.displayName).toBe('Rahul Verma');

    const conversations = await harness.getConversations();
    expect(conversations.some((c) => c.id === conv.id)).toBe(true);
  });

  it('T1-MSG-02: sends text message and updates conversation last preview and timestamp', async () => {
    // Feature 28: Direct & Group Chat Thread
    const conv = await harness.getOrCreateDirectConversation('user_rahul_02');

    const msg = await harness.sendMessage({
      conversationId: conv.id,
      content: 'Hey Rahul, are you attending the Hackathon orientation today?',
    });

    expect(msg).toBeDefined();
    expect(msg.content).toContain('Hackathon orientation');
    expect(msg.sender?.displayName).toBe('Priya Sharma');

    const thread = await harness.getMessages(conv.id);
    expect(thread.length).toBe(1);
    expect(thread[0].id).toBe(msg.id);

    const updatedConv = await harness.getConversationById(conv.id);
    expect(updatedConv?.lastMessagePreview).toContain('Hackathon orientation');
  });

  it('T1-MSG-03: sends message with custom sticker attachment', async () => {
    // Feature 28: Attachment sharing in chat
    const conv = await harness.getOrCreateDirectConversation('user_rahul_02');

    const msg = await harness.sendMessage({
      conversationId: conv.id,
      content: 'Check out this new campus sticker!',
      attachmentKind: 'custom_sticker',
      creationId: 'creation_sticker_01',
    });

    expect(msg.attachmentKind).toBe('custom_sticker');
    expect(msg.creationId).toBe('creation_sticker_01');

    const thread = await harness.getMessages(conv.id);
    expect(thread[0].attachmentKind).toBe('custom_sticker');
  });

  it('T1-MSG-04: creates group conversation and broadcasts to multiple members', async () => {
    // Group Chat Thread
    const group = await harness.createGroup('Christ Lavasa Hackathon Team', [
      'user_rahul_02',
      'user_aarav_03',
      'user_ananya_04',
    ]);

    expect(group.type).toBe('group');
    expect(group.title).toBe('Christ Lavasa Hackathon Team');
    expect(group.members.length).toBe(4); // Priya + 3 members

    const msg = await harness.sendMessage({
      conversationId: group.id,
      content: 'Welcome team! Let us prepare our project proposal.',
    });

    const thread = await harness.getMessages(group.id);
    expect(thread.length).toBe(1);
    expect(thread[0].content).toContain('Welcome team');
  });

  it('T1-MSG-05: marks unread conversations as read, clearing unread badge', async () => {
    // Unread count tracking and read receipts
    const conv = await harness.getOrCreateDirectConversation('user_rahul_02');

    // Priya sends message
    await harness.sendMessage({
      conversationId: conv.id,
      content: 'Reminder about team meeting at 4 PM.',
    });

    const convBefore = await harness.getConversationById(conv.id);
    expect(convBefore?.unreadCount).toBeGreaterThan(0);

    // Mark as read
    await harness.markConversationRead(conv.id);
    const convAfter = await harness.getConversationById(conv.id);
    expect(convAfter?.unreadCount).toBe(0);
  });
});
