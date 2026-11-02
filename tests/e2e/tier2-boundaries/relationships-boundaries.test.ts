import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 2: Boundary & Corner Cases — Relationships & Privacy Boundaries', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T2-REL-01: prevents sending friend requests to oneself', async () => {
    const currentUser = harness.getCurrentUser()!;
    await expect(harness.sendFriendRequest(currentUser.id)).rejects.toThrow(
      /Cannot send friend request to yourself/
    );
  });

  it('T2-REL-02: prevents duplicate or redundant friend requests', async () => {
    // Priya sends to Rahul
    await harness.sendFriendRequest('user_rahul_02');

    // Attempt second friend request while pending
    await expect(harness.sendFriendRequest('user_rahul_02')).rejects.toThrow(
      /Friend request already pending/
    );

    // Accept request
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const reqs = await harness.getFriendshipStatus('user_priya_01');
    expect(reqs).toBe('pending_received');

    // Search for the request id to accept
    const convId = 'user_priya_01';
    // Switch back to Priya and attempt request when already friends
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    // Let's accept via helper
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const notifs = await harness.getNotifications();
    const friendReqNotif = notifs.find((n) => n.type === 'friend_request');
    expect(friendReqNotif).toBeDefined();

    // Since friends:
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    await expect(harness.sendFriendRequest('user_rahul_02')).rejects.toThrow(
      /Friend request already pending/
    );
  });

  it('T2-REL-03: forbids direct messaging between non-friends', async () => {
    // Priya and Aarav are not friends yet
    const status = await harness.getFriendshipStatus('user_aarav_03');
    expect(status).toBe('none');

    await expect(harness.getOrCreateDirectConversation('user_aarav_03')).rejects.toThrow(
      /Direct messaging requires accepted mutual friendship/
    );
  });

  it('T2-REL-04: enforces 30-member ceiling on group chats', async () => {
    // Generate 31 member IDs
    const memberIds = Array.from({ length: 31 }, (_, i) => `user_extra_${i}`);

    await expect(
      harness.createGroup('Massive Group Chat', memberIds)
    ).rejects.toThrow(/Group conversations are capped at 30 members/);
  });

  it('T2-REL-05: completely isolates blocked user posts and profile visibility', async () => {
    // Priya creates a campus post
    const post = await harness.createPost({
      content: 'Important updates for BCA students.',
    });

    // Rahul logs in and blocks Priya
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.blockUser('user_priya_01');

    // Rahul's campus feed must exclude Priya's posts
    const { items } = await harness.getPosts('campus');
    expect(items.some((p) => p.authorId === 'user_priya_01')).toBe(false);

    // Rahul searching for Priya's profile returns null
    const profile = await harness.getProfileByHandle('priya_s');
    expect(profile).toBeNull();
  });
});
