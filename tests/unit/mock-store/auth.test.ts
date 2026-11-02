import { describe, it, expect, beforeEach } from "vitest";
import { MockStore } from "@/lib/mock-store/store";

describe("MockStore - Authentication & Identity", () => {
  let store: MockStore;

  beforeEach(() => {
    store = MockStore.getInstance();
    store.resetToDefaultSeeds();
  });

  it("normalizes registration number during login (trims whitespace, converts to uppercase)", async () => {
    const session = await store.login({
      regNumber: "  2441001  ",
      password: "password123",
    });

    expect(session).toBeDefined();
    expect(session.user.normalizedRegNumber).toBe("2441001");
    expect(session.profile.displayName).toBe("Arnav Sharma");
  });

  it("rejects login with wrong password", async () => {
    await expect(
      store.login({
        regNumber: "2441001",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid registration number or password.");
  });

  it("rejects invalid registration number formats (<4 or non-alphanumeric)", async () => {
    await expect(
      store.login({
        regNumber: "abc",
        password: "password123",
      })
    ).rejects.toThrow("Registration number must be 4 to 32 alphanumeric characters.");
  });

  it("provisions new student on immediate signup without college email", async () => {
    const newReg = "2541099";
    const session = await store.signup({
      regNumber: newReg,
      password: "securepassword123",
      ageConfirmed: true,
      termsAccepted: true,
    });

    expect(session.user.normalizedRegNumber).toBe(newReg);
    expect(session.profile.handle).toBe(`student_${newReg.toLowerCase()}`);
    expect(store.getCurrentUser()?.id).toBe(session.user.id);

    const settings = await store.getSettings();
    expect(settings.theme).toBe("light");
  });

  it("prevents signup when age is not confirmed", async () => {
    await expect(
      store.signup({
        regNumber: "2541098",
        password: "securepassword123",
        ageConfirmed: false,
        termsAccepted: true,
      })
    ).rejects.toThrow("You must confirm you are at least 16 years old.");
  });

  it("prevents signup with password shorter than 8 characters", async () => {
    await expect(
      store.signup({
        regNumber: "2541098",
        password: "short",
        ageConfirmed: true,
        termsAccepted: true,
      })
    ).rejects.toThrow("Password must be at least 8 characters long.");
  });

  it("prevents duplicate registration number signup", async () => {
    await expect(
      store.signup({
        regNumber: "2441001",
        password: "securepassword123",
        ageConfirmed: true,
        termsAccepted: true,
      })
    ).rejects.toThrow("already exists");
  });

  it("updates profile with validation (enforces bio <= 160 chars)", async () => {
    await store.login({ regNumber: "2441001", password: "password123" });

    const updated = await store.updateProfile({
      bio: "Updated bio for testing.",
      displayName: "Arnav S.",
    });

    expect(updated.bio).toBe("Updated bio for testing.");
    expect(updated.displayName).toBe("Arnav S.");

    const tooLongBio = "A".repeat(161);
    await expect(store.updateProfile({ bio: tooLongBio })).rejects.toThrow(
      "Bio cannot exceed 160 characters."
    );
  });

  it("logout clears current session", async () => {
    await store.login({ regNumber: "2441001", password: "password123" });
    expect(store.getSession()).not.toBeNull();

    await store.logout();
    expect(store.getSession()).toBeNull();
    expect(store.getCurrentUser()).toBeNull();
  });
});
