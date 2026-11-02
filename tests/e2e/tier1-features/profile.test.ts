import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Profiles, Friendships & Safety Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-PROF-01: views student profile by handle (/people/[handle]) with accurate details', async () => {
    // Feature 24: Student Profile View
    const profile = await harness.getProfileByHandle('rahul_v');

    expect(profile).toBeDefined();
    expect(profile?.displayName).toBe('Rahul Verma');
    expect(profile?.course).toBe('BBA');
    expect(profile?.yearOfStudy).toBe(3);
    expect(profile?.bio).toContain('President, Management Circle');
    expect(profile?.interests).toContain('Football');
  });

  it('T1-PROF-02: executes friend request lifecycle from pending to accepted', async () => {
    // Feature 25: Friendship Lifecycle Management
    // Currently Priya is logged in. Let Priya send request to Rahul.
    const initialStatus = await harness.getFriendshipStatus('user_rahul_02');
    expect(initialStatus).toBe('none');

    const request = await harness.sendFriendRequest('user_rahul_02');
    expect(request.status).toBe('pending');
    expect(await harness.getFriendshipStatus('user_rahul_02')).toBe('pending_sent');

    // Switch session to Rahul to accept
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('pending_received');

    await harness.respondFriendRequest(request.id, 'accept');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('friends');
  });

  it('T1-PROF-03: rejects pending friend request and removes pending state', async () => {
    // Friend request rejection
    const request = await harness.sendFriendRequest('user_aarav_03');
    expect(request.status).toBe('pending');

    // Switch to Aarav to reject
    await harness.login({ regNumber: '24BDS042', password: 'password_789' });
    await harness.respondFriendRequest(request.id, 'reject');

    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('none');
  });

  it('T1-PROF-04: allows unfriending a mutual friend', async () => {
    // Establish mutual friendship first
    const request = await harness.sendFriendRequest('user_rahul_02');
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.respondFriendRequest(request.id, 'accept');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('friends');

    // Remove friend
    await harness.removeFriend('user_priya_01');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('none');
  });

  it('T1-PROF-05: blocks user, dissolves friendship, and isolates profile from discoverability', async () => {
    // Feature 26: Account Blocking & Privacy
    // First establish friendship between Priya and Rahul
    const request = await harness.sendFriendRequest('user_rahul_02');
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.respondFriendRequest(request.id, 'accept');

    // Rahul blocks Priya
    await harness.blockUser('user_priya_01');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('blocked');

    // Verify blocked user is in blocked list
    const blockedList = await harness.getBlockedUsers();
    expect(blockedList.some((p) => p.id === 'user_priya_01')).toBe(true);

    // Profile lookup for blocked user returns null
    const profileView = await harness.getProfileByHandle('priya_s');
    expect(profileView).toBeNull();

    // Unblock restores visibility
    await harness.unblockUser('user_priya_01');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('none');
  });
});
