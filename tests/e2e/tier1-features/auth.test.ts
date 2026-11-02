import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness, normalizeRegNumber } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Authentication & Onboarding Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-AUTH-01: normalizes registration numbers by trimming whitespace and uppercase conversion', () => {
    // Feature 8: Registration Number Normalization
    expect(normalizeRegNumber('  24bds042  ')).toBe('24BDS042');
    expect(normalizeRegNumber('23bca015')).toBe('23BCA015');
    expect(normalizeRegNumber('  23-mba-004  ')).toBe('23-MBA-004');
  });

  it('T1-AUTH-02: allows immediate student signup without email confirmation or activation codes', async () => {
    // Feature 9: Immediate Student Signup (/signup)
    const session = await harness.signup({
      regNumber: '  24bds099  ',
      password: 'mypassword123',
      confirmPassword: 'mypassword123',
      ageConfirmed: true,
      termsAccepted: true,
    });

    expect(session).toBeDefined();
    expect(session.user.normalizedRegNumber).toBe('24BDS099');
    expect(session.user.status).toBe('active');
    expect(session.user.role).toBe('student');
    expect(session.user.recoveryEmailVerified).toBe(false);
    expect(session.token).toBeTruthy();
    expect(harness.getCurrentUser()?.normalizedRegNumber).toBe('24BDS099');
  });

  it('T1-AUTH-03: logs in an existing student using registration number and password', async () => {
    // Feature 10: Reg Number Login (/login)
    // Seed user Priya Sharma (23BCA015)
    await harness.logout();
    expect(harness.getCurrentUser()).toBeNull();

    const session = await harness.login({
      regNumber: '23bca015',
      password: 'password_123',
    });

    expect(session).toBeDefined();
    expect(session.user.normalizedRegNumber).toBe('23BCA015');
    expect(session.profile.displayName).toBe('Priya Sharma');
    expect(harness.getCurrentProfile()?.handle).toBe('priya_s');
  });

  it('T1-AUTH-04: completes password recovery request and sets new password', async () => {
    // Feature 11: Password Recovery (/forgot-password, /reset-password)
    const requestSent = await harness.requestPasswordReset('23BCA015');
    expect(requestSent).toBe(true);

    // Active recovery session reset
    const resetSuccess = await harness.resetPassword('new_strong_password_2026');
    expect(resetSuccess).toBe(true);
  });

  it('T1-AUTH-05: personalizes student profile during onboarding (/onboarding)', async () => {
    // Feature 12: Student Onboarding
    const newSession = await harness.signup({
      regNumber: '24BDS101',
      password: 'password101',
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(newSession.profile.course).toBe('Undecided');

    const updatedProfile = await harness.updateProfile({
      displayName: 'Devika Nair',
      handle: 'devika_n',
      bio: 'BSc Data Science 1st Year | Enthusiast in NLP & Robotics',
      course: 'BSc Data Science',
      yearOfStudy: 1,
      interests: ['AI', 'Robotics', 'Debating'],
    });

    expect(updatedProfile.displayName).toBe('Devika Nair');
    expect(updatedProfile.handle).toBe('devika_n');
    expect(updatedProfile.bio).toContain('NLP & Robotics');
    expect(updatedProfile.yearOfStudy).toBe(1);
    expect(updatedProfile.interests).toEqual(['AI', 'Robotics', 'Debating']);
    expect(harness.getCurrentProfile()?.handle).toBe('devika_n');
  });
});
