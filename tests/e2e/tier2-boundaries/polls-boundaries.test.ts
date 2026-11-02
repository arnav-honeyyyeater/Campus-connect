import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 2: Boundary & Corner Cases — Interactive Polls Boundaries', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T2-POLL-01: rejects polls created with fewer than 2 options', async () => {
    // 0 options
    await expect(
      harness.createPost({
        content: 'Invalid poll with no options',
        poll: { question: 'Empty poll?', options: [] },
      })
    ).rejects.toThrow(/between 2 and 6 options/);

    // 1 option
    await expect(
      harness.createPost({
        content: 'Invalid poll with 1 option',
        poll: { question: 'Single option?', options: ['Only One'] },
      })
    ).rejects.toThrow(/between 2 and 6 options/);
  });

  it('T2-POLL-02: rejects polls created with more than 6 options', async () => {
    // 7 options
    await expect(
      harness.createPost({
        content: 'Invalid poll with 7 options',
        poll: {
          question: 'Too many options?',
          options: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4', 'Opt 5', 'Opt 6', 'Opt 7'],
        },
      })
    ).rejects.toThrow(/between 2 and 6 options/);
  });

  it('T2-POLL-03: accepts polls at boundary limits of exactly 2 and exactly 6 options', async () => {
    // Exactly 2 options
    const postMin = await harness.createPost({
      content: 'Binary choice poll',
      poll: { question: 'Yes or No?', options: ['Yes', 'No'] },
    });
    expect(postMin.poll?.options.length).toBe(2);

    // Exactly 6 options
    const postMax = await harness.createPost({
      content: 'Hex choice poll',
      poll: {
        question: 'Rate from 1 to 6:',
        options: ['1 - Poor', '2 - Fair', '3 - Good', '4 - Great', '5 - Excellent', '6 - Outstanding'],
      },
    });
    expect(postMax.poll?.options.length).toBe(6);
  });

  it('T2-POLL-04: rejects voting on an already closed or expired poll', async () => {
    const post = await harness.createPost({
      content: 'Flash poll ending immediately',
      poll: {
        question: 'Immediate poll?',
        options: ['A', 'B'],
        closesAt: new Date(Date.now() - 60000).toISOString(), // Expired 1 minute ago
      },
    });

    const pollId = post.poll!.id;
    const optionId = post.poll!.options[0].id;

    await expect(harness.votePoll(pollId, optionId)).rejects.toThrow(/closed for voting/);
  });

  it('T2-POLL-05: enforces single choice by replacing previous vote without inflating total count', async () => {
    const post = await harness.createPost({
      content: 'Election poll',
      poll: {
        question: 'Select your representative:',
        options: ['Candidate Alpha', 'Candidate Beta', 'Candidate Gamma'],
      },
    });

    const pollId = post.poll!.id;
    const optA = post.poll!.options[0].id;
    const optB = post.poll!.options[1].id;

    // Vote Candidate Alpha
    const pollVote1 = await harness.votePoll(pollId, optA);
    expect(pollVote1.totalVotes).toBe(1);
    expect(pollVote1.options[0].voteCount).toBe(1);
    expect(pollVote1.options[1].voteCount).toBe(0);

    // Change vote to Candidate Beta
    const pollVote2 = await harness.votePoll(pollId, optB);
    expect(pollVote2.totalVotes).toBe(1); // Must still be 1 total vote!
    expect(pollVote2.options[0].voteCount).toBe(0); // Decremented
    expect(pollVote2.options[1].voteCount).toBe(1); // Incremented
    expect(pollVote2.userVotedOptionId).toBe(optB);

    // Vote Candidate Beta again (idempotent, no change)
    const pollVote3 = await harness.votePoll(pollId, optB);
    expect(pollVote3.totalVotes).toBe(1);
    expect(pollVote3.options[1].voteCount).toBe(1);
  });
});
