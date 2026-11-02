import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 3: Cross-Feature Interactions — Discovery -> Friendship -> Messaging Pipeline', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T3-FLOW-02: connects two students from search to friendship, real-time chat, and unfriend permission lockout', async () => {
    // Step 1: Student Aarav searches for Student Priya on /discover
    await harness.login({ regNumber: '24BDS042', password: 'password_789' });
    const searchResults = await harness.search('Priya', 'people');
    expect(searchResults.people.length).toBeGreaterThan(0);
    const priyaProfile = searchResults.people.find((p) => p.handle === 'priya_s')!;
    expect(priyaProfile).toBeDefined();

    // Direct messaging before friendship must fail
    await expect(harness.getOrCreateDirectConversation(priyaProfile.id)).rejects.toThrow(
      /Direct messaging requires accepted mutual friendship/
    );

    // Step 2: Aarav sends friend request to Priya
    const friendReq = await harness.sendFriendRequest(priyaProfile.id);
    expect(friendReq.status).toBe('pending');
    expect(await harness.getFriendshipStatus(priyaProfile.id)).toBe('pending_sent');

    // Step 3: Priya logs in, checks /notifications, sees request
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    const notifications = await harness.getNotifications();
    const reqNotif = notifications.find((n) => n.type === 'friend_request');
    expect(reqNotif).toBeDefined();
    expect(reqNotif?.title).toContain('Aarav Mehta');

    // Step 4: Priya accepts friend request
    await harness.respondFriendRequest(friendReq.id, 'accept');
    expect(await harness.getFriendshipStatus('user_aarav_03')).toBe('friends');

    // Step 5: Priya initiates direct chat thread on /messages
    const conversation = await harness.getOrCreateDirectConversation('user_aarav_03');
    expect(conversation).toBeDefined();
    expect(conversation.type).toBe('direct');
    expect(conversation.otherParticipant?.displayName).toBe('Aarav Mehta');

    // Step 6: Priya sends message to Aarav
    const sentMsg = await harness.sendMessage({
      conversationId: conversation.id,
      content: 'Hey Aarav! Welcome to Christ Lavasa. Let me know if you need any notes for Data Science.',
    });
    expect(sentMsg.content).toContain('Welcome to Christ Lavasa');

    // Step 7: Aarav logs in and views the incoming message
    await harness.login({ regNumber: '24BDS042', password: 'password_789' });
    const aaravConvs = await harness.getConversations();
    expect(aaravConvs.length).toBe(1);
    expect(aaravConvs[0].unreadCount).toBeGreaterThan(0);
    expect(aaravConvs[0].lastMessagePreview).toContain('Welcome to Christ Lavasa');

    // Aarav reads conversation
    await harness.markConversationRead(conversation.id);
    const updatedConv = await harness.getConversationById(conversation.id);
    expect(updatedConv?.unreadCount).toBe(0);

    // Step 8: Aarav unfriends Priya
    await harness.removeFriend('user_priya_01');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('none');

    // Verify direct messaging is now locked
    await expect(harness.getOrCreateDirectConversation('user_priya_01')).rejects.toThrow(
      /Direct messaging requires accepted mutual friendship/
    );
  });
});
