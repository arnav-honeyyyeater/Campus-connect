import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 4: Real-World Scenario — Club President Announcement & Audition Coordination Journey', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('SC-04: Ananya Patel (23MBA004) publishes Cultural Guild auditions notice, sets up 5-member coordinator group chat, and broadcasts logistics', async () => {
    // 1. Ananya logs in
    await harness.login({ regNumber: '23MBA004', password: 'password_004' });
    expect(harness.getCurrentProfile()?.displayName).toBe('Ananya Patel');

    // 2. Fetch Cultural Guild details
    const club = await harness.getClubBySlug('cultural-guild');
    expect(club).toBeDefined();
    expect(club?.ownerId).toBe('user_ananya_04');

    // 3. Post Official Club Audition Announcement
    const auditionPost = await harness.createPost({
      content: '🎭 AUDITIONS ALERT: Christ Lavasa Cultural Guild is auditioning for Drama, Music & Dance teams for the Annual Inter-Collegiate Fest! Venue: Central Auditorium, 4 PM onwards.',
      clubId: club!.id,
      attachments: [
        {
          kind: 'image',
          mediaUrl: '/banners/cultural-auditions.png',
        },
      ],
    });
    expect(auditionPost.clubId).toBe(club!.id);

    // 4. Form 5-member Coordinator Group Chat on /messages
    const coordinatorIds = [
      'user_priya_01',
      'user_rahul_02',
      'user_aarav_03',
      'user_volunteer_05',
    ];

    const groupConv = await harness.createGroup(
      'Cultural Fest Audition Core Team',
      coordinatorIds
    );

    expect(groupConv.title).toBe('Cultural Fest Audition Core Team');
    expect(groupConv.type).toBe('group');
    expect(groupConv.members.length).toBe(5); // Ananya + 4 coordinators

    // 5. Broadcast Logistics Schedule in Group Chat
    const scheduleMsg = await harness.sendMessage({
      conversationId: groupConv.id,
      content: 'Team, here is the slot breakdown: 4:00-5:30 PM Music, 5:30-7:00 PM Dance, 7:00-8:30 PM Theatre. Please bring rating rubrics.',
    });
    expect(scheduleMsg.sender?.displayName).toBe('Ananya Patel');

    // 6. Coordinator (Priya) logs in and verifies incoming group chat message
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    const priyaConvs = await harness.getConversations();
    const festGroup = priyaConvs.find((c) => c.id === groupConv.id)!;
    expect(festGroup).toBeDefined();
    expect(festGroup.lastMessagePreview).toContain('slot breakdown');

    // Priya acknowledges in group chat
    const ackMsg = await harness.sendMessage({
      conversationId: groupConv.id,
      content: 'Rubrics printed and sound check scheduled with AV team.',
    });
    expect(ackMsg.sender?.displayName).toBe('Priya Sharma');

    // Verify chat thread length
    const thread = await harness.getMessages(groupConv.id);
    expect(thread.length).toBe(2);
  });
});
