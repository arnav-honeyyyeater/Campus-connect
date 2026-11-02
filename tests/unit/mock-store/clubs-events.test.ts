import { describe, it, expect, beforeEach } from "vitest";
import { MockStore } from "@/lib/mock-store/store";

describe("MockStore - Clubs & Events", () => {
  let store: MockStore;

  beforeEach(() => {
    store = MockStore.getInstance();
    store.resetToDefaultSeeds();
  });

  it("getClubs returns all clubs with category filtering", async () => {
    const clubs = await store.getClubs();
    expect(clubs.length).toBeGreaterThan(0);

    const techClubs = await store.getClubs("Tech & Coding");
    expect(techClubs.every((c) => c.category === "Tech & Coding")).toBe(true);
  });

  it("toggleClubMembership updates member count and membership status", async () => {
    const club = await store.getClubBySlug("literary-society");
    expect(club).not.toBeNull();
    const initialCount = club!.memberCount;
    expect(club!.isJoined).toBe(false);

    // Join
    const joined = await store.toggleClubMembership(club!.id);
    expect(joined).not.toBeNull();
    const joinedClub = await store.getClubBySlug("literary-society");
    expect(joinedClub!.memberCount).toBe(initialCount + 1);
    expect(joinedClub!.isJoined).toBe(true);

    // Leave
    const left = await store.toggleClubMembership(club!.id);
    expect(left).toBeNull();
    const leftClub = await store.getClubBySlug("literary-society");
    expect(leftClub!.memberCount).toBe(initialCount);
    expect(leftClub!.isJoined).toBe(false);
  });

  it("createClub enforces slug uniqueness", async () => {
    await expect(
      store.createClub({
        name: "Duplicate Club",
        slug: "coding-club", // already exists in seed
        description: "Test description",
        category: "Tech & Coding",
      })
    ).rejects.toThrow("already exists");
  });

  it("toggleEventRsvp increments and decrements RSVP counts", async () => {
    const event = await store.getEventById("evt_acoustic_night");
    expect(event).not.toBeNull();
    expect(event!.userRsvp).toBe("interested");
    const initialGoing = event!.rsvpsCount.going;

    // Change to going
    const goingRsvp = await store.toggleEventRsvp("evt_acoustic_night", "going");
    expect(goingRsvp?.status).toBe("going");

    const updatedEvent = await store.getEventById("evt_acoustic_night");
    expect(updatedEvent?.userRsvp).toBe("going");
    expect(updatedEvent?.rsvpsCount.going).toBe(initialGoing + 1);
  });
});
