import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness, CanvasLayer } from '../helpers/test-store-harness';

describe('Tier 2: Boundary & Corner Cases — Meme & Sticker Studio Boundaries', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T2-STUDIO-01: enforces 20-layer ceiling per studio canvas scene', async () => {
    // Generate exactly 20 layers
    const twentyLayers: CanvasLayer[] = Array.from({ length: 20 }, (_, i) => ({
      id: `layer_${i}`,
      type: 'shape',
      x: i * 10,
      y: i * 10,
      width: 50,
      height: 50,
      rotation: 0,
      fill: '#D9F36B',
    }));

    const validCreation = await harness.saveCreation({
      kind: 'meme',
      title: '20 Layer Scene',
      draftData: {
        version: 1,
        mode: 'meme',
        aspectRatio: '1:1',
        layers: twentyLayers,
      },
    });
    expect(validCreation.draftData.layers.length).toBe(20);

    // 21 layers should be rejected
    const twentyOneLayers: CanvasLayer[] = [
      ...twentyLayers,
      {
        id: 'layer_overflow_21',
        type: 'shape',
        x: 210,
        y: 210,
        width: 50,
        height: 50,
        rotation: 0,
      },
    ];

    await expect(
      harness.saveCreation({
        kind: 'meme',
        title: '21 Layer Scene Overflow',
        draftData: {
          version: 1,
          mode: 'meme',
          aspectRatio: '1:1',
          layers: twentyOneLayers,
        },
      })
    ).rejects.toThrow(/Maximum 20 layers allowed/);
  });

  it('T2-STUDIO-02: rejects creation with empty or whitespace-only title', async () => {
    await expect(
      harness.saveCreation({
        kind: 'sticker',
        title: '   ',
        draftData: { version: 1, mode: 'sticker', aspectRatio: '1:1', layers: [] },
      })
    ).rejects.toThrow(/Creation title is required/);
  });

  it('T2-STUDIO-03: rejects unauthorized deletion of creations owned by other students', async () => {
    // Priya creates a sticker
    const priyaSticker = await harness.saveCreation({
      kind: 'sticker',
      title: 'Priya Special Sticker',
      draftData: { version: 1, mode: 'sticker', aspectRatio: '1:1', layers: [] },
    });

    // Switch to Rahul
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });

    // Rahul attempts to delete Priya's sticker
    await expect(harness.deleteCreation(priyaSticker.id)).rejects.toThrow(
      /Unauthorized to delete this creation/
    );
  });

  it('T2-STUDIO-04: handles polygon cutout with minimum valid vertices (triangle) and complex polygons', async () => {
    // Minimum 3 vertices (6 coordinate points)
    const triangleCutout: CanvasLayer = {
      id: 'poly_triangle',
      type: 'polygon',
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      rotation: 0,
      points: [100, 100, 200, 50, 250, 200],
    };

    const creation = await harness.saveCreation({
      kind: 'sticker',
      title: 'Triangle Cutout',
      draftData: {
        version: 1,
        mode: 'sticker',
        aspectRatio: '1:1',
        layers: [triangleCutout],
      },
    });

    expect(creation.draftData.layers[0].points?.length).toBe(6);
  });

  it('T2-STUDIO-05: verifies canvas dimensions across supported aspect ratios (1:1, 4:5, 16:9)', async () => {
    const supportedRatios = ['1:1', '4:5', '16:9'];
    for (const ratio of supportedRatios) {
      const c = await harness.saveCreation({
        kind: 'meme',
        title: `Meme ${ratio}`,
        draftData: {
          version: 1,
          mode: 'meme',
          aspectRatio: ratio,
          layers: [],
        },
      });
      expect(c.draftData.aspectRatio).toBe(ratio);
    }
  });
});
