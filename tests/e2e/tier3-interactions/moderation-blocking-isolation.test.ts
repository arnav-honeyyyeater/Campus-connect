import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 3: Cross-Feature Interactions — Safety, Moderation & Blocking Pipeline', () => {
  let harness: TestStoreHarness;

  beforeEach(async () => {
    harness = new TestStoreHarness();
    // Establish friendship between Priya (user_priya_01) and Rahul (user_rahul_02)
    const req = await harness.sendFriendRequest('user_rahul_02');
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.respondFriendRequest(req.id, 'accept');
  });

  it('T3-FLOW-05: executes moderation report, blocks offending student, dissolves relationships, and hides content across feeds and search', async () => {
    // Step 1: Priya posts a campus update
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    const priyaPost = await harness.createPost({
      content: 'Controversial debate topic on cafeteria food quality.',
    });

    // Step 2: Rahul views post and submits a moderation report
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const report = await harness.submitReport({
      targetType: 'post',
      targetId: priyaPost.id,
      category: 'spam',
      notes: 'Repeated off-topic cafeteria complaints',
    });
    expect(report.id).toBeDefined();
    expect(report.category).toBe('spam');

    // Step 3: Rahul blocks Priya
    await harness.blockUser('user_priya_01');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('blocked');

    // Step 4: Verify Content Isolation
    // In Rahul's feed, Priya's post is completely hidden
    const { items: rahulFeed } = await harness.getPosts('campus');
    expect(rahulFeed.some((p) => p.id === priyaPost.id)).toBe(false);

    // In Rahul's search, Priya's profile does not appear
    const rahulSearch = await harness.search('Priya', 'people');
    expect(rahulSearch.people.some((p) => p.id === 'user_priya_01')).toBe(false);

    // Step 5: Verify Relationship & Messaging Dissolution
    // Direct messaging is blocked
    await expect(harness.getOrCreateDirectConversation('user_priya_01')).rejects.toThrow(
      /Direct messaging requires accepted mutual friendship/
    );

    // Step 6: Priya logs in, attempts to view Rahul's profile -> hidden
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    const profileView = await harness.getProfileByHandle('rahul_v');
    expect(profileView).toBeNull();

    // Step 7: Rahul unblocks Priya from Settings
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.unblockUser('user_priya_01');
    expect(await harness.getFriendshipStatus('user_priya_01')).toBe('none');

    // After unblocking, Priya's post is visible in feed again
    const { items: restoredFeed } = await harness.getPosts('campus');
    expect(restoredFeed.some((p) => p.id === priyaPost.id)).toBe(true);
  });
});
