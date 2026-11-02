import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Settings, Notifications & Saved Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-SET-01: privately bookmarks posts and retrieves them in the saved collection (/saved)', async () => {
    // Feature 19 & 42: Private Post Bookmarking & Saved Collection
    const post = (await harness.getPosts('campus')).items[0];

    const isBookmarked = await harness.toggleBookmark(post.id);
    expect(isBookmarked).toBe(true);

    const savedPosts = await harness.getBookmarkedPosts();
    expect(savedPosts.length).toBe(1);
    expect(savedPosts[0].id).toBe(post.id);
    expect(savedPosts[0].isBookmarked).toBe(true);

    // Unbookmark
    const toggledOff = await harness.toggleBookmark(post.id);
    expect(toggledOff).toBe(false);

    const emptySaved = await harness.getBookmarkedPosts();
    expect(emptySaved.length).toBe(0);
  });

  it('T1-SET-02: receives in-app notifications and marks individual notification as read (/notifications)', async () => {
    // Feature 41: Activity Notifications
    const notif = harness.addNotification({
      recipientId: 'user_priya_01',
      actorId: 'user_rahul_02',
      type: 'reaction',
      destinationUrl: '/posts/post_welcome_01',
      title: 'Rahul Verma liked your post',
    });

    const list = await harness.getNotifications();
    expect(list.some((n) => n.id === notif.id && !n.isRead)).toBe(true);

    await harness.markNotificationRead(notif.id);
    const updatedList = await harness.getNotifications();
    const readItem = updatedList.find((n) => n.id === notif.id);
    expect(readItem?.isRead).toBe(true);
  });

  it('T1-SET-03: marks all notifications as read in bulk', async () => {
    // Bulk read notifications
    harness.addNotification({
      recipientId: 'user_priya_01',
      type: 'friend_request',
      destinationUrl: '/people/aarav_m',
      title: 'Aarav Mehta sent you a friend request',
    });
    harness.addNotification({
      recipientId: 'user_priya_01',
      type: 'event_update',
      destinationUrl: '/events/event_hackathon_01',
      title: 'Hackathon schedule updated',
    });

    await harness.markAllNotificationsRead();
    const notifications = await harness.getNotifications();
    expect(notifications.every((n) => n.isRead)).toBe(true);
  });

  it('T1-SET-04: configures account preferences in settings (theme, reduced motion, notification toggles)', async () => {
    // Feature 43: Student Account Settings
    const initialSettings = await harness.getSettings();
    expect(initialSettings.theme).toBe('light');

    const updated = await harness.updateSettings({
      theme: 'dark',
      reduceMotion: true,
      readReceiptsEnabled: false,
      notifyOnEventUpdates: false,
    });

    expect(updated.theme).toBe('dark');
    expect(updated.reduceMotion).toBe(true);
    expect(updated.readReceiptsEnabled).toBe(false);
    expect(updated.notifyOnEventUpdates).toBe(false);
  });

  it('T1-SET-05: exports student personal account data archive and submits safety report', async () => {
    // Personal Data Export and Safety Moderation
    const exportData = await harness.exportPersonalData();
    expect(exportData.user).toBeDefined();
    expect(exportData.profile.displayName).toBe('Priya Sharma');
    expect(exportData.exportedAt).toBeTruthy();

    const report = await harness.submitReport({
      targetType: 'post',
      targetId: 'post_welcome_01',
      category: 'spam',
      notes: 'Testing safety reporting pipeline',
    });

    expect(report.id).toBeDefined();
    expect(report.category).toBe('spam');
    expect(report.reporterId).toBe('user_priya_01');
  });
});
