import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Discover & Campus Search Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-DISC-01: executes unified search returning students, clubs, events, and posts', async () => {
    // Feature 22: Unified Campus Search (/discover)
    const results = await harness.search('Lavasa', 'all');

    expect(results).toBeDefined();
    expect(results.clubs.length).toBeGreaterThan(0);
    expect(results.clubs.some((c) => c.name.includes('Lavasa'))).toBe(true);
    expect(results.events.length).toBeGreaterThan(0);
    expect(results.events.some((e) => e.title.includes('Lavasa'))).toBe(true);
    expect(results.posts.length).toBeGreaterThan(0);
  });

  it('T1-DISC-02: filters search results by people only', async () => {
    // Filter chip: people
    const results = await harness.search('Sharma', 'people');

    expect(results.people.length).toBeGreaterThan(0);
    expect(results.people[0].displayName).toBe('Priya Sharma');
    expect(results.clubs.length).toBe(0);
    expect(results.events.length).toBe(0);
  });

  it('T1-DISC-03: filters search results by clubs category', async () => {
    // Filter chip: clubs
    const results = await harness.search('Coding', 'clubs');

    expect(results.clubs.length).toBe(1);
    expect(results.clubs[0].name).toBe('Lavasa Coding Community');
    expect(results.clubs[0].category).toBe('Tech');
    expect(results.people.length).toBe(0);
  });

  it('T1-DISC-04: filters search results by events category', async () => {
    // Filter chip: events
    const results = await harness.search('Hackathon', 'events');

    expect(results.events.length).toBe(1);
    expect(results.events[0].title).toBe('Lavasa AI & Web3 Hackathon 2026');
    expect(results.events[0].venue).toBe('Central Block Amphitheatre');
  });

  it('T1-DISC-05: retrieves trending campus hashtags and topics', async () => {
    // Feature 23: Trending Campus Topics
    const results = await harness.search('', 'all');

    expect(results.tags).toBeDefined();
    expect(results.tags).toContain('#LavasaMonsoon');
    expect(results.tags).toContain('#CentralBlock');
    expect(results.tags).toContain('#ChristLavasa');
  });
});
