import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockStore } from "@/lib/mock-store/store";

describe("MockStore - Persistence & Data Export", () => {
  let store: MockStore;

  beforeEach(() => {
    store = MockStore.getInstance();
    store.resetToDefaultSeeds();
  });

  it("keeps the account signed out when the store reloads after logout", async () => {
    await store.logout();

    vi.resetModules();
    const { MockStore: ReloadedStore } = await import("@/lib/mock-store/store");
    const reloadedStore = ReloadedStore.getInstance();

    expect(reloadedStore.getSession()).toBeNull();
    expect(reloadedStore.getCurrentUser()).toBeNull();
  });

  it("persists creations to localStorage and retrieves them", async () => {
    const creation = await store.saveCreation({
      kind: "sticker",
      title: "Test Sticker",
      draftData: {
        version: 1,
        mode: "sticker",
        aspectRatio: "1:1",
        layers: [
          {
            id: "l1",
            type: "text",
            content: "Lavasa Vibe",
            x: 10,
            y: 10,
            width: 100,
            height: 30,
            rotation: 0,
          },
        ],
      },
    });

    expect(creation.id).toBeDefined();
    const retrieved = await store.getCreationById(creation.id);
    expect(retrieved?.title).toBe("Test Sticker");
  });

  it("exportPersonalData packages account, profile, posts, and creations", async () => {
    const exported = await store.exportPersonalData();
    expect(exported.account).toBeDefined();
    expect(exported.profile).toBeDefined();
    expect(Array.isArray(exported.posts)).toBe(true);
    expect(Array.isArray(exported.creations)).toBe(true);
  });
});
