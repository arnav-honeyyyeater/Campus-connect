import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 4: Real-World Scenario — Freshman Student Onboarding Journey', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('SC-01: Aarav Mehta (24BDS049) Day 1 registration, onboarding, discovering coding club, and campus feed engagement', async () => {
    // 1. Day 1 Signup at Christ University Lavasa
    const session = await harness.signup({
      regNumber: '  24bds049  ',
      password: 'aarav_secure_pass',
      confirmPassword: 'aarav_secure_pass',
      ageConfirmed: true,
      termsAccepted: true,
    });

    expect(session.user.normalizedRegNumber).toBe('24BDS049');
    expect(session.user.role).toBe('student');

    // 2. Profile Personalization on /onboarding
    const profile = await harness.updateProfile({
      displayName: 'Aarav Mehta',
      handle: 'aarav_m28',
      bio: "BSc Data Science '28 | Code & Coffee ☕",
      course: 'BSc Data Science',
      yearOfStudy: 1,
      interests: ['Python', 'Data Science', 'Basketball'],
    });

    expect(profile.handle).toBe('aarav_m28');
    expect(profile.course).toBe('BSc Data Science');
    expect(profile.yearOfStudy).toBe(1);

    // 3. Search and Discover Campus Clubs on /discover
    const search = await harness.search('Coding', 'clubs');
    expect(search.clubs.length).toBe(1);
    const codingClub = search.clubs[0];
    expect(codingClub.name).toBe('Lavasa Coding Community');

    // 4. Join the Coding Community
    const membership = await harness.toggleClubMembership(codingClub.id);
    expect(membership).toBeDefined();
    expect(membership?.clubId).toBe(codingClub.id);

    // 5. Browse Campus Feed on /feed
    const { items: feedPosts } = await harness.getPosts('campus');
    expect(feedPosts.length).toBeGreaterThan(0);

    // Pinned welcome announcement from Student Council / Priya
    const welcomePost = feedPosts.find((p) => p.isPinned)!;
    expect(welcomePost).toBeDefined();
    expect(welcomePost.content).toContain('Welcome all new students to Christ University Lavasa');

    // 6. React with Love ❤️ to the Welcome Post
    const initialLoveCount = welcomePost.reactions.love;
    const reactedPost = await harness.toggleReaction(welcomePost.id, 'love');
    expect(reactedPost.reactions.love).toBe(initialLoveCount + 1);
    expect(reactedPost.userReaction).toBe('love');

    // 7. Add Comment introducing himself
    const introComment = await harness.addComment(
      welcomePost.id,
      'Hi everyone! Excited to join the BSc Data Science batch.'
    );
    expect(introComment.author?.displayName).toBe('Aarav Mehta');

    // Verify comment appears in thread
    const comments = await harness.getComments(welcomePost.id);
    expect(comments.some((c) => c.id === introComment.id)).toBe(true);
  });
});
