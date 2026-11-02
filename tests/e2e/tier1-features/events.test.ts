import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Campus Events Calendar & RSVP Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-EVT-01: retrieves chronological list of campus events (/events)', async () => {
    // Feature 32: Campus Events Calendar
    const events = await harness.getEvents();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].title).toBe('Lavasa AI & Web3 Hackathon 2026');
    expect(events[0].venue).toBe('Central Block Amphitheatre');
    expect(events[0].rsvpsCount.going).toBeGreaterThanOrEqual(28);
  });

  it('T1-EVT-02: views event detail page with complete scheduling information (/events/[id])', async () => {
    // Feature 33: Event Detail Page
    const event = await harness.getEventById('event_hackathon_01');

    expect(event).toBeDefined();
    expect(event?.title).toBe('Lavasa AI & Web3 Hackathon 2026');
    expect(event?.startsAt).toBe('2026-11-15T09:00:00Z');
    expect(event?.endsAt).toBe('2026-11-16T21:00:00Z');
    expect(event?.venue).toBe('Central Block Amphitheatre');
    expect(event?.creator?.displayName).toBe('Priya Sharma');
  });

  it('T1-EVT-03: RSVPs "Going" to an event and increments going tally', async () => {
    // RSVP toggle: Going
    const event = await harness.getEventById('event_hackathon_01');
    const initialGoing = event!.rsvpsCount.going;

    const rsvp = await harness.toggleEventRsvp('event_hackathon_01', 'going');
    expect(rsvp).toBeDefined();
    expect(rsvp?.status).toBe('going');

    const updatedEvent = await harness.getEventById('event_hackathon_01');
    expect(updatedEvent?.rsvpsCount.going).toBe(initialGoing + 1);
    expect(updatedEvent?.userRsvp).toBe('going');
  });

  it('T1-EVT-04: switches RSVP from "Going" to "Interested" updating counts accordingly', async () => {
    // Switching RSVP state
    await harness.toggleEventRsvp('event_hackathon_01', 'going');
    const eventAfterGoing = await harness.getEventById('event_hackathon_01');
    const goingCount = eventAfterGoing!.rsvpsCount.going;
    const interestedCount = eventAfterGoing!.rsvpsCount.interested;

    // Switch to Interested
    await harness.toggleEventRsvp('event_hackathon_01', 'interested');
    const updated = await harness.getEventById('event_hackathon_01');

    expect(updated?.userRsvp).toBe('interested');
    expect(updated?.rsvpsCount.going).toBe(goingCount - 1);
    expect(updated?.rsvpsCount.interested).toBe(interestedCount + 1);
  });

  it('T1-EVT-05: cancels an existing RSVP on repeat click and filters by user RSVPs', async () => {
    // Cancelling RSVP
    await harness.toggleEventRsvp('event_hackathon_01', 'going');
    const cancelResult = await harness.toggleEventRsvp('event_hackathon_01', 'going');
    expect(cancelResult).toBeNull();

    const updated = await harness.getEventById('event_hackathon_01');
    expect(updated?.userRsvp).toBeUndefined();

    // Re-RSVP and verify filter: 'rsvps'
    await harness.toggleEventRsvp('event_hackathon_01', 'going');
    const myRsvps = await harness.getEvents('rsvps');
    expect(myRsvps.some((e) => e.id === 'event_hackathon_01')).toBe(true);
  });
});
