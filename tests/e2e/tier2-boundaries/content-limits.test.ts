import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 2: Boundary & Corner Cases — Content Limits & Validation', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T2-LIM-01: enforces 160-character boundary on student bio', async () => {
    // Exactly 160 characters should succeed
    const validBio160 = 'A'.repeat(160);
    const updated = await harness.updateProfile({ bio: validBio160 });
    expect(updated.bio.length).toBe(160);

    // 161 characters should fail
    const invalidBio161 = 'A'.repeat(161);
    await expect(harness.updateProfile({ bio: invalidBio161 })).rejects.toThrow(
      /Bio exceeds maximum limit of 160 characters/
    );
  });

  it('T2-LIM-02: enforces 2,000-character boundary and non-empty constraint on post content', async () => {
    // Empty post content should fail
    await expect(harness.createPost({ content: '   ' })).rejects.toThrow(/Post content cannot be empty/);

    // Exactly 2000 characters should succeed
    const validPost2000 = 'P'.repeat(2000);
    const post = await harness.createPost({ content: validPost2000 });
    expect(post.content.length).toBe(2000);

    // 2001 characters should fail
    const invalidPost2001 = 'P'.repeat(2001);
    await expect(harness.createPost({ content: invalidPost2001 })).rejects.toThrow(
      /Post content exceeds 2,000 character maximum limit/
    );
  });

  it('T2-LIM-03: enforces max 4 attachments per post', async () => {
    // 4 attachments succeeds
    const fourAttachments = [
      { kind: 'image' as const, mediaUrl: '/banners/1.png' },
      { kind: 'image' as const, mediaUrl: '/banners/2.png' },
      { kind: 'image' as const, mediaUrl: '/banners/3.png' },
      { kind: 'image' as const, mediaUrl: '/banners/4.png' },
    ];
    const post = await harness.createPost({
      content: 'Sharing 4 project screenshots',
      attachments: fourAttachments,
    });
    expect(post.attachments.length).toBe(4);

    // 5 attachments fails
    const fiveAttachments = [
      ...fourAttachments,
      { kind: 'image' as const, mediaUrl: '/banners/5.png' },
    ];
    await expect(
      harness.createPost({
        content: 'Sharing 5 screenshots',
        attachments: fiveAttachments,
      })
    ).rejects.toThrow(/Maximum of 4 attachments allowed/);
  });

  it('T2-LIM-04: enforces 1,000-character boundary and non-empty constraint on comments', async () => {
    const post = (await harness.getPosts('campus')).items[0];

    // Empty comment should fail
    await expect(harness.addComment(post.id, '  ')).rejects.toThrow(/Comment content cannot be empty/);

    // Exactly 1000 characters succeeds
    const validComment1000 = 'C'.repeat(1000);
    const comment = await harness.addComment(post.id, validComment1000);
    expect(comment.content.length).toBe(1000);

    // 1001 characters fails
    const invalidComment1001 = 'C'.repeat(1001);
    await expect(harness.addComment(post.id, invalidComment1001)).rejects.toThrow(
      /Comment exceeds 1,000 character maximum limit/
    );
  });

  it('T2-LIM-05: enforces 4,000-character boundary on messaging chat content', async () => {
    // Connect friendship to enable direct messaging
    const req = await harness.sendFriendRequest('user_rahul_02');
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    await harness.respondFriendRequest(req.id, 'accept');

    const conv = await harness.getOrCreateDirectConversation('user_priya_01');

    // Exactly 4000 characters succeeds
    const validMsg4000 = 'M'.repeat(4000);
    const msg = await harness.sendMessage({
      conversationId: conv.id,
      content: validMsg4000,
    });
    expect(msg.content?.length).toBe(4000);

    // 4001 characters fails
    const invalidMsg4001 = 'M'.repeat(4001);
    await expect(
      harness.sendMessage({
        conversationId: conv.id,
        content: invalidMsg4001,
      })
    ).rejects.toThrow(/Message content exceeds 4,000 character maximum limit/);
  });
});
