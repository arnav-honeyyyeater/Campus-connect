import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 4: Real-World Scenario — Student Privacy & Complete Account Lifecycle Journey', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('SC-05: Rohan Deshmukh (24BBA051) signs up, customizes privacy settings, reports offending comment, blocks user, exports personal data, and logs out', async () => {
    // 1. Signup with fresh registration number
    const session = await harness.signup({
      regNumber: '24BBA051',
      password: 'rohan_strong_pass',
      confirmPassword: 'rohan_strong_pass',
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(session.user.normalizedRegNumber).toBe('24BBA051');

    await harness.updateProfile({
      displayName: 'Rohan Deshmukh',
      handle: 'rohan_d',
      bio: 'BBA 1st Year | Marketing Analytics | Quiet library reader',
      course: 'BBA',
      yearOfStudy: 1,
      interests: ['Marketing', 'Analytics'],
    });

    // 2. Personalize Settings on /settings (Dark theme, Reduced Motion, Read Receipts off)
    const settings = await harness.updateSettings({
      theme: 'dark',
      reduceMotion: true,
      readReceiptsEnabled: false,
      notifyOnReactions: false,
    });

    expect(settings.theme).toBe('dark');
    expect(settings.reduceMotion).toBe(true);
    expect(settings.readReceiptsEnabled).toBe(false);
    expect(settings.notifyOnReactions).toBe(false);

    // 3. View Campus Feed and discover a spam comment on the Welcome Post
    const { items: feedPosts } = await harness.getPosts('campus');
    const welcomePost = feedPosts[0];
    const comments = await harness.getComments(welcomePost.id);
    expect(comments.length).toBeGreaterThan(0);
    const targetComment = comments[0];

    // 4. Submit Safety Moderation Report for spam
    const report = await harness.submitReport({
      targetType: 'comment',
      targetId: targetComment.id,
      category: 'spam',
      notes: 'Unsolicited promotional link posted on campus announcement',
    });

    expect(report.id).toBeDefined();
    expect(report.category).toBe('spam');
    expect(report.reporterId).toBe(session.user.id);

    // 5. Block the Author of the offending comment
    await harness.blockUser(targetComment.authorId);
    const blockedList = await harness.getBlockedUsers();
    expect(blockedList.some((p) => p.id === targetComment.authorId)).toBe(true);

    // Verify comment is now hidden from Rohan's view
    const filteredComments = await harness.getComments(welcomePost.id);
    expect(filteredComments.some((c) => c.authorId === targetComment.authorId)).toBe(false);

    // 6. Export Personal Account Data Archive JSON
    const exportedData = await harness.exportPersonalData();
    expect(exportedData.user?.normalizedRegNumber).toBe('24BBA051');
    expect(exportedData.profile?.displayName).toBe('Rohan Deshmukh');
    expect(exportedData.settings?.theme).toBe('dark');
    expect(exportedData.exportedAt).toBeTruthy();

    // 7. Perform Clean Logout
    await harness.logout();
    expect(harness.getCurrentUser()).toBeNull();
    expect(harness.getSession()).toBeNull();
  });
});
