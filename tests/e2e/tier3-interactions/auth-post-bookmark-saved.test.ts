import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 3: Cross-Feature Interactions — Auth -> Post -> Bookmark -> Saved Pipeline', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T3-FLOW-01: executes full lifecycle from student signup to onboarding, posting, bookmarking, and viewing in /saved', async () => {
    // Step 1: Immediate Signup
    const session = await harness.signup({
      regNumber: '24BDS055',
      password: 'mypassword2026',
      confirmPassword: 'mypassword2026',
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(session.user.normalizedRegNumber).toBe('24BDS055');

    // Step 2: Onboarding Personalization
    const updatedProfile = await harness.updateProfile({
      displayName: 'Tanya Sen',
      handle: 'tanya_s',
      bio: "BSc Data Science '28 | AI Ethics & Python",
      course: 'BSc Data Science',
      yearOfStudy: 1,
      interests: ['AI', 'Data Ethics'],
    });
    expect(updatedProfile.handle).toBe('tanya_s');

    // Step 3: Post Creation with Interactive Poll
    const post = await harness.createPost({
      content: 'Hello Christ Lavasa! Organizing an AI Ethics discussion group this weekend.',
      poll: {
        question: 'Which day works best?',
        options: ['Saturday 11 AM', 'Sunday 4 PM'],
      },
    });
    expect(post.id).toBeDefined();
    expect(post.poll?.options.length).toBe(2);

    // Step 4: Cast Vote on the Poll
    const votedPoll = await harness.votePoll(post.poll!.id, post.poll!.options[0].id);
    expect(votedPoll.totalVotes).toBe(1);
    expect(votedPoll.userVotedOptionId).toBe(post.poll!.options[0].id);

    // Step 5: React to Post with Fire 🔥
    const reacted = await harness.toggleReaction(post.id, 'fire');
    expect(reacted.reactions.fire).toBe(1);
    expect(reacted.userReaction).toBe('fire');

    // Step 6: Bookmark Post privately
    const isBookmarked = await harness.toggleBookmark(post.id);
    expect(isBookmarked).toBe(true);

    // Step 7: Verify Post appears in /saved collection
    const savedCollection = await harness.getBookmarkedPosts();
    expect(savedCollection.length).toBe(1);
    expect(savedCollection[0].id).toBe(post.id);
    expect(savedCollection[0].content).toContain('AI Ethics discussion group');
    expect(savedCollection[0].isBookmarked).toBe(true);

    // Step 8: Remove Bookmark and verify /saved is empty
    const unbookmarked = await harness.toggleBookmark(post.id);
    expect(unbookmarked).toBe(false);

    const emptySaved = await harness.getBookmarkedPosts();
    expect(emptySaved.length).toBe(0);
  });
});
