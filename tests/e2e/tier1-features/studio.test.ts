import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 1: Feature Coverage — Meme & Sticker Studio Suite', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T1-STUDIO-01: initializes studio creation with chosen aspect ratio and mode (/studio/[id])', async () => {
    // Feature 35: Studio Canvas Editor
    const creation = await harness.saveCreation({
      kind: 'meme',
      title: 'Lavasa Rain vs 8:30 AM Lecture',
      draftData: {
        version: 1,
        mode: 'meme',
        aspectRatio: '1:1',
        layers: [
          {
            id: 'layer_bg_1',
            type: 'image',
            content: '/banners/lavasa-rain.png',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
          },
        ],
      },
    });

    expect(creation).toBeDefined();
    expect(creation.kind).toBe('meme');
    expect(creation.draftData.aspectRatio).toBe('1:1');
    expect(creation.draftData.layers.length).toBe(1);
    expect(creation.creator?.displayName).toBe('Priya Sharma');
  });

  it('T1-STUDIO-02: manipulates and styles text layers with custom typography and stroke', async () => {
    // Feature 36: Canvas Text & Styling Tool
    const creation = await harness.saveCreation({
      kind: 'meme',
      title: 'Exam Season Meme',
      draftData: {
        version: 1,
        mode: 'meme',
        aspectRatio: '4:5',
        layers: [
          {
            id: 'text_top_1',
            type: 'text',
            content: 'When the professor says attendance is mandatory',
            x: 50,
            y: 50,
            width: 700,
            height: 100,
            rotation: 0,
            fontSize: 42,
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeWidth: 3,
          },
        ],
      },
    });

    expect(creation.draftData.layers[0].type).toBe('text');
    expect(creation.draftData.layers[0].fontSize).toBe(42);
    expect(creation.draftData.layers[0].fill).toBe('#FFFFFF');
    expect(creation.draftData.layers[0].stroke).toBe('#000000');
  });

  it('T1-STUDIO-03: adds stickers and decorative shapes as canvas layers', async () => {
    // Feature 37: Canvas Stickers & Shapes
    const creation = await harness.saveCreation({
      kind: 'sticker',
      title: 'Christ University Mascot Sticker',
      draftData: {
        version: 1,
        mode: 'sticker',
        aspectRatio: '1:1',
        layers: [
          {
            id: 'shape_bg',
            type: 'shape',
            x: 50,
            y: 50,
            width: 400,
            height: 400,
            rotation: 0,
            fill: '#D9F36B',
          },
          {
            id: 'sticker_logo',
            type: 'sticker',
            content: '/stickers/mascot.png',
            x: 100,
            y: 100,
            width: 300,
            height: 300,
            rotation: 0,
          },
        ],
      },
    });

    expect(creation.draftData.layers.length).toBe(2);
    expect(creation.draftData.layers[0].type).toBe('shape');
    expect(creation.draftData.layers[1].type).toBe('sticker');
  });

  it('T1-STUDIO-04: creates polygon cutout tool layer with custom vertex coordinates', async () => {
    // Feature 38: Polygon Cutout Tool
    const polygonLayer = {
      id: 'cutout_poly_1',
      type: 'polygon' as const,
      x: 0,
      y: 0,
      width: 500,
      height: 500,
      rotation: 0,
      points: [100, 50, 400, 80, 450, 350, 80, 380], // [x1, y1, x2, y2, ...]
      stroke: '#D9F36B',
      strokeWidth: 2,
    };

    const creation = await harness.saveCreation({
      kind: 'sticker',
      title: 'Polygon Cutout Sticker',
      draftData: {
        version: 1,
        mode: 'sticker',
        aspectRatio: '1:1',
        layers: [polygonLayer],
      },
    });

    expect(creation.draftData.layers[0].type).toBe('polygon');
    expect(creation.draftData.layers[0].points?.length).toBe(8);
  });

  it('T1-STUDIO-05: organizes creations into a published sticker pack (/packs/[id])', async () => {
    // Feature 40: Sticker Pack Canvas
    const sticker1 = await harness.saveCreation({
      kind: 'sticker',
      title: 'Central Block Umbrella',
      draftData: { version: 1, mode: 'sticker', aspectRatio: '1:1', layers: [] },
      renderedImageUrl: '/stickers/umbrella.png',
    });

    const sticker2 = await harness.saveCreation({
      kind: 'sticker',
      title: 'Lavasa Coffee Cup',
      draftData: { version: 1, mode: 'sticker', aspectRatio: '1:1', layers: [] },
      renderedImageUrl: '/stickers/coffee.png',
    });

    const pack = await harness.createStickerPack('Lavasa Campus Essentials', [sticker1.id, sticker2.id], sticker1.id);

    expect(pack).toBeDefined();
    expect(pack.title).toBe('Lavasa Campus Essentials');
    expect(pack.stickers.length).toBe(2);
    expect(pack.isPublished).toBe(true);
    expect(pack.coverImageUrl).toBe('/stickers/umbrella.png');

    const fetchedPack = await harness.getStickerPackById(pack.id);
    expect(fetchedPack?.id).toBe(pack.id);
  });
});
