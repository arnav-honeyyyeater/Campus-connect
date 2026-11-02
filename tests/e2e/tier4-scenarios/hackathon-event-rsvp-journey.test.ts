import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 4: Real-World Scenario — Hackathon Event RSVP & Teammate Search Journey', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('SC-02: Priya Sharma (23BCA015) RSVPs to campus hackathon, polls for teammates, connects with Rahul Verma, and coordinates via chat', async () => {
    // 1. Priya logs in
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });

    // 2. Discover Upcoming Hackathon on /events
    const events = await harness.getEvents();
    const hackathon = events.find((e) => e.title.includes('Hackathon'))!;
    expect(hackathon).toBeDefined();
    expect(hackathon.venue).toBe('Central Block Amphitheatre');

    // 3. RSVP "Going"
    const rsvp = await harness.toggleEventRsvp(hackathon.id, 'going');
    expect(rsvp?.status).toBe('going');

    const updatedEvent = await harness.getEventById(hackathon.id);
    expect(updatedEvent?.userRsvp).toBe('going');

    // 4. Publish Teammate Finder Post on /feed with Single-Choice Poll
    const teammatePost = await harness.createPost({
      content: 'Heading to the Lavasa AI & Web3 Hackathon! Looking for teammates to build a campus assistant.',
      poll: {
        question: 'What is your primary skill?',
        options: ['Frontend (React/Next)', 'Machine Learning / LLMs', 'UI/UX Design', 'Backend / APIs'],
      },
    });

    expect(teammatePost.poll).toBeDefined();
    expect(teammatePost.poll?.options.length).toBe(4);

    // 5. Rahul Verma (23BBA088) sees post on /feed and votes "Machine Learning / LLMs"
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const { items: feedPosts } = await harness.getPosts('campus');
    const rahulViewedPost = feedPosts.find((p) => p.id === teammatePost.id)!;
    expect(rahulViewedPost).toBeDefined();

    const mlOptionId = rahulViewedPost.poll!.options[1].id;
    const votedPoll = await harness.votePoll(rahulViewedPost.poll!.id, mlOptionId);
    expect(votedPoll.totalVotes).toBe(1);
    expect(votedPoll.options[1].voteCount).toBe(1);

    // 6. Rahul sends friend request to Priya to collaborate
    const friendReq = await harness.sendFriendRequest('user_priya_01');
    expect(friendReq.status).toBe('pending');

    // 7. Priya logs back in, accepts friend request
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    await harness.respondFriendRequest(friendReq.id, 'accept');
    expect(await harness.getFriendshipStatus('user_rahul_02')).toBe('friends');

    // 8. Priya launches Direct Chat thread on /messages
    const conversation = await harness.getOrCreateDirectConversation('user_rahul_02');
    expect(conversation.type).toBe('direct');

    // Priya sends team coordination message
    const msg = await harness.sendMessage({
      conversationId: conversation.id,
      content: 'Hey Rahul! Saw you voted ML on my hackathon poll. Are you free to team up?',
    });
    expect(msg.content).toContain('voted ML');

    // 9. Rahul replies in thread
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const reply = await harness.sendMessage({
      conversationId: conversation.id,
      content: 'Absolutely! I have experience fine-tuning embeddings. Let us meet at Central Block cafe at 3 PM.',
    });
    expect(reply.content).toContain('embeddings');

    // Verify chat history
    const history = await harness.getMessages(conversation.id);
    expect(history.length).toBe(2);
  });
});
