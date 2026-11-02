import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Feed, Posts, Polls & Comments Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-FEED-01: retrieves campus feed with pinned posts first followed by reverse chronological posts', async () => {
    // Feature 13: Campus Feed Tab (/feed?tab=campus)
    const { items } = await harness.getPosts('campus');
    expect(items.length).toBeGreaterThan(0);
    // Pinned post must come first
    expect(items[0].isPinned).toBe(true);
    expect(items[0].content).toContain('Welcome all new students to Christ University Lavasa');
  });

  it('T1-FEED-02: creates a new post with text and up to 4 image attachments', async () => {
    // Feature 16: Post Composer & Creator Modal
    const newPost = await harness.createPost({
      content: 'Exploring the campus library resources on the 3rd floor. Great quiet study space!',
      attachments: [
        { kind: 'image', mediaUrl: '/banners/library-1.png' },
        { kind: 'image', mediaUrl: '/banners/library-2.png' },
      ],
    });

    expect(newPost).toBeDefined();
    expect(newPost.content).toContain('campus library');
    expect(newPost.attachments.length).toBe(2);
    expect(newPost.author?.displayName).toBe('Priya Sharma');

    const fetched = await harness.getPostById(newPost.id);
    expect(fetched?.id).toBe(newPost.id);
  });

  it('T1-FEED-03: creates and votes on single-choice polls with live tally update', async () => {
    // Feature 17: Interactive Single-Choice Polls
    const postWithPoll = await harness.createPost({
      content: 'Where should we host the AI Study Group meetups?',
      poll: {
        question: 'Preferred study location:',
        options: ['Central Block Library', 'Cafeteria Open Patio', 'Amphitheatre Garden'],
      },
    });

    expect(postWithPoll.poll).toBeDefined();
    expect(postWithPoll.poll?.options.length).toBe(3);
    expect(postWithPoll.poll?.totalVotes).toBe(0);

    const firstOptionId = postWithPoll.poll!.options[0].id;
    const votedPoll = await harness.votePoll(postWithPoll.poll!.id, firstOptionId);

    expect(votedPoll.totalVotes).toBe(1);
    expect(votedPoll.options[0].voteCount).toBe(1);
    expect(votedPoll.userVotedOptionId).toBe(firstOptionId);
  });

  it('T1-FEED-04: toggles reactions using the 5-emoji reaction tray', async () => {
    // Feature 18: 5-Emoji Reaction Tray (like, love, laugh, fire, clap)
    const welcomePost = (await harness.getPosts('campus')).items[0];
    const initialLove = welcomePost.reactions.love;

    // React with love ❤️
    const reactedPost = await harness.toggleReaction(welcomePost.id, 'love');
    expect(reactedPost.reactions.love).toBe(initialLove + 1);
    expect(reactedPost.userReaction).toBe('love');

    // Toggle off love
    const toggledOff = await harness.toggleReaction(welcomePost.id, 'love');
    expect(toggledOff.reactions.love).toBe(initialLove);
    expect(toggledOff.userReaction).toBeUndefined();
  });

  it('T1-FEED-05: adds flat comments to a post and reads comment thread (/posts/[id])', async () => {
    // Feature 20: Post Detail & Comments
    const post = (await harness.getPosts('campus')).items[0];
    const initialCount = post.commentsCount;

    const newComment = await harness.addComment(post.id, 'Are the registration forms available online too?');
    expect(newComment.id).toBeTruthy();
    expect(newComment.content).toBe('Are the registration forms available online too?');
    expect(newComment.author?.displayName).toBe('Priya Sharma');

    const comments = await harness.getComments(post.id);
    expect(comments.length).toBe(initialCount + 1);
    expect(comments.some((c) => c.id === newComment.id)).toBe(true);
  });

  it('T1-FEED-06: allows post author to edit and delete their own post', async () => {
    // Feature 21: Post Edit & Deletion
    const created = await harness.createPost({
      content: 'Original draft notice for project group.',
    });

    const edited = await harness.editPost(created.id, 'Updated notice: Project submission deadline is Friday 5 PM.');
    expect(edited.content).toBe('Updated notice: Project submission deadline is Friday 5 PM.');

    await harness.deletePost(created.id);
    const postAfterDelete = await harness.getPostById(created.id);
    expect(postAfterDelete).toBeNull();
  });
});
