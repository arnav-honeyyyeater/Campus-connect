import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Campus Clubs Directory & Details Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-CLUB-01: retrieves all campus clubs directory categorized by domain', async () => {
    // Feature 30: Campus Clubs Directory (/clubs)
    const allClubs = await harness.getClubs();
    expect(allClubs.length).toBeGreaterThanOrEqual(2);

    const techClubs = await harness.getClubs('Tech');
    expect(techClubs.length).toBe(1);
    expect(techClubs[0].name).toBe('Lavasa Coding Community');

    const artsClubs = await harness.getClubs('Arts');
    expect(artsClubs.length).toBe(1);
    expect(artsClubs[0].name).toBe('Christ Lavasa Cultural Guild');
  });

  it('T1-CLUB-02: views club detail page by slug (/clubs/[slug]) with full metadata', async () => {
    // Feature 31: Club Detail Page
    const club = await harness.getClubBySlug('lavasa-coding-community');

    expect(club).toBeDefined();
    expect(club?.name).toBe('Lavasa Coding Community');
    expect(club?.category).toBe('Tech');
    expect(club?.description).toContain('official tech and programming society');
    expect(club?.owner?.displayName).toBe('Priya Sharma');
    expect(club?.memberCount).toBe(42);
  });

  it('T1-CLUB-03: joins a club and increments member count', async () => {
    // Join club membership toggle
    const club = await harness.getClubBySlug('cultural-guild');
    const initialCount = club!.memberCount;

    const membership = await harness.toggleClubMembership(club!.id);
    expect(membership).toBeDefined();
    expect(membership?.clubId).toBe(club!.id);

    const updatedClub = await harness.getClubBySlug('cultural-guild');
    expect(updatedClub?.memberCount).toBe(initialCount + 1);
    expect(updatedClub?.isJoined).toBe(true);
  });

  it('T1-CLUB-04: leaves a joined club and decrements member count', async () => {
    // Leave club membership toggle
    const club = await harness.getClubBySlug('cultural-guild');
    await harness.toggleClubMembership(club!.id); // Join first
    const joinedClub = await harness.getClubBySlug('cultural-guild');
    const countAfterJoin = joinedClub!.memberCount;

    // Leave club
    const leftMembership = await harness.toggleClubMembership(club!.id);
    expect(leftMembership).toBeNull();

    const clubAfterLeave = await harness.getClubBySlug('cultural-guild');
    expect(clubAfterLeave?.memberCount).toBe(countAfterJoin - 1);
    expect(clubAfterLeave?.isJoined).toBe(false);
  });

  it('T1-CLUB-05: creates a post scoped to a club and filters it under My Clubs feed', async () => {
    // Feature 15: My Clubs Feed Tab
    const club = await harness.getClubBySlug('lavasa-coding-community');
    await harness.toggleClubMembership(club!.id); // Join coding club

    const clubPost = await harness.createPost({
      content: 'Official announcement: Hackathon workshops start this Wednesday at 4 PM in Lab 2.',
      clubId: club!.id,
    });

    expect(clubPost.clubId).toBe(club!.id);

    const clubsFeed = await harness.getPosts('clubs');
    expect(clubsFeed.items.some((p) => p.id === clubPost.id)).toBe(true);
  });
});
