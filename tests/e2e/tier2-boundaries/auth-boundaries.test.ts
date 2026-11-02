import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness, normalizeRegNumber } from '../helpers/test-store-harness';

describe('Tier 2: Boundary & Corner Cases — Authentication Boundaries', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T2-AUTH-01: rejects registration numbers shorter than 4 characters', () => {
    expect(() => normalizeRegNumber('24B')).toThrow(/Invalid registration number format/);
    expect(() => normalizeRegNumber('   1 ')).toThrow(/Invalid registration number format/);
  });

  it('T2-AUTH-02: rejects registration numbers longer than 32 characters', () => {
    const overlyLong = '24BDS' + '0'.repeat(30); // 35 chars
    expect(() => normalizeRegNumber(overlyLong)).toThrow(/Invalid registration number format/);
  });

  it('T2-AUTH-03: rejects registration numbers with invalid punctuation, spaces, or special characters', () => {
    expect(() => normalizeRegNumber('24BDS@042')).toThrow(/Invalid registration number format/);
    expect(() => normalizeRegNumber('24 BDS 042')).toThrow(/Invalid registration number format/);
    expect(() => normalizeRegNumber('24BDS.042')).toThrow(/Invalid registration number format/);
    expect(() => normalizeRegNumber('24BDS#042')).toThrow(/Invalid registration number format/);
  });

  it('T2-AUTH-04: rejects duplicate registration number signup attempts', async () => {
    // 23BCA015 is already registered to Priya Sharma
    await expect(
      harness.signup({
        regNumber: '23BCA015',
        password: 'anotherpassword',
        ageConfirmed: true,
        termsAccepted: true,
      })
    ).rejects.toThrow(/already exists/);

    // Case and whitespace variants of the same reg number must also collide
    await expect(
      harness.signup({
        regNumber: '  23bca015  ',
        password: 'anotherpassword',
        ageConfirmed: true,
        termsAccepted: true,
      })
    ).rejects.toThrow(/already exists/);
  });

  it('T2-AUTH-05: rejects signup when password confirmation mismatches or age is unconfirmed', async () => {
    await expect(
      harness.signup({
        regNumber: '24BDS888',
        password: 'mypassword',
        confirmPassword: 'differentpassword',
        ageConfirmed: true,
        termsAccepted: true,
      })
    ).rejects.toThrow(/Passwords do not match/);

    await expect(
      harness.signup({
        regNumber: '24BDS889',
        password: 'mypassword',
        confirmPassword: 'mypassword',
        ageConfirmed: false,
        termsAccepted: true,
      })
    ).rejects.toThrow(/age of at least 16/);

    await expect(
      harness.signup({
        regNumber: '24BDS890',
        password: 'mypassword',
        confirmPassword: 'mypassword',
        ageConfirmed: true,
        termsAccepted: false,
      })
    ).rejects.toThrow(/terms of service/);
  });
});
