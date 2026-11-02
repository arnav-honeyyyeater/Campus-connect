import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 3: Cross-Feature Interactions — Club Membership -> Feed -> Event RSVP Pipeline', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T3-FLOW-04: joins a student club, receives club announcements, and RSVPs to associated campus event', async () => {
    // Step 1: Aarav logs in and views Clubs Directory
    await harness.login({ regNumber: '24BDS042', password: 'password_789' });
    const clubs = await harness.getClubs('Tech');
    expect(clubs.length).toBe(1);
    const codingClub = clubs[0];
    expect(codingClub.name).toBe('Lavasa Coding Community');
    expect(codingClub.isJoined).toBe(false);

    // Initial My Clubs feed is empty
    const emptyClubsFeed = await harness.getPosts('clubs');
    expect(emptyClubsFeed.items.length).toBe(0);

    // Step 2: Aarav joins the Coding Community
    const membership = await harness.toggleClubMembership(codingClub.id);
    expect(membership).toBeDefined();
    expect(membership?.clubId).toBe(codingClub.id);

    // Step 3: Club Owner (Priya) publishes a club-scoped announcement post
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    const clubAnnouncement = await harness.createPost({
      content: 'Important Coding Community Announcement: Hackathon team registrations close Friday!',
      clubId: codingClub.id,
    });
    expect(clubAnnouncement.clubId).toBe(codingClub.id);

    // Step 4: Aarav views My Clubs feed, seeing the announcement
    await harness.login({ regNumber: '24BDS042', password: 'password_789' });
    const populatedClubsFeed = await harness.getPosts('clubs');
    expect(populatedClubsFeed.items.some((p) => p.id === clubAnnouncement.id)).toBe(true);

    // Step 5: Aarav browses /events and RSVPs "Going" to the Hackathon
    const events = await harness.getEvents();
    const hackathon = events.find((e) => e.clubId === codingClub.id)!;
    expect(hackathon).toBeDefined();
    const initialGoing = hackathon.rsvpsCount.going;

    const rsvp = await harness.toggleEventRsvp(hackathon.id, 'going');
    expect(rsvp?.status).toBe('going');

    // Verify event is in Aarav's RSVP list
    const myRsvps = await harness.getEvents('rsvps');
    expect(myRsvps.some((e) => e.id === hackathon.id)).toBe(true);

    const updatedHackathon = await harness.getEventById(hackathon.id);
    expect(updatedHackathon?.rsvpsCount.going).toBe(initialGoing + 1);

    // Step 6: Aarav leaves the club
    const leaveMembership = await harness.toggleClubMembership(codingClub.id);
    expect(leaveMembership).toBeNull();

    // My Clubs feed is now empty again
    const clearedClubsFeed = await harness.getPosts('clubs');
    expect(clearedClubsFeed.items.length).toBe(0);
  });
});
