import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 4: Real-World Scenario — Campus Meme Competition & Sticker Pack Journey', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('SC-03: Kabir Singh (22BDS007) creates meme in studio, packages custom sticker pack, publishes to campus feed, and engages community', async () => {
    // 1. Kabir signs up / logs in
    const session = await harness.signup({
      regNumber: '22BDS007',
      password: 'kabir_meme_king',
      confirmPassword: 'kabir_meme_king',
      ageConfirmed: true,
      termsAccepted: true,
    });
    await harness.updateProfile({
      displayName: 'Kabir Singh',
      handle: 'kabir_s',
      bio: "BSc Data Science '26 | Chief Meme Officer @ Christ Lavasa",
      course: 'BSc Data Science',
      yearOfStudy: 4,
      interests: ['Memes', 'Graphic Design', 'Data Science'],
    });

    // 2. Open /studio and create meme draft
    const memeCreation = await harness.saveCreation({
      kind: 'meme',
      title: 'Lavasa Monsoon Weather vs 8:30 AM Lecture',
      draftData: {
        version: 1,
        mode: 'meme',
        aspectRatio: '1:1',
        layers: [
          {
            id: 'layer_bg_rain',
            type: 'image',
            content: '/banners/lavasa-rain-stairs.png',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
          },
          {
            id: 'text_caption_top',
            type: 'text',
            content: 'The stairs to Central Block during heavy monsoon:',
            x: 50,
            y: 50,
            width: 980,
            height: 80,
            rotation: 0,
            fontSize: 48,
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeWidth: 4,
          },
          {
            id: 'sticker_waterfall',
            type: 'sticker',
            content: '/stickers/niagara-waterfall.png',
            x: 300,
            y: 400,
            width: 450,
            height: 450,
            rotation: 0,
          },
        ],
      },
      renderedImageUrl: '/creations/meme-monsoon-stairs.png',
      isPublished: true,
    });

    expect(memeCreation.draftData.layers.length).toBe(3);
    expect(memeCreation.draftData.layers[1].type).toBe('text');

    // 3. Create a Custom Sticker in /studio with polygon cutout
    const umbrellaSticker = await harness.saveCreation({
      kind: 'sticker',
      title: 'Broken Umbrella Sticker',
      draftData: {
        version: 1,
        mode: 'sticker',
        aspectRatio: '1:1',
        layers: [
          {
            id: 'poly_umbrella',
            type: 'polygon',
            x: 0,
            y: 0,
            width: 400,
            height: 400,
            rotation: 0,
            points: [50, 150, 200, 50, 350, 150, 200, 280],
            stroke: '#D9F36B',
          },
        ],
      },
      renderedImageUrl: '/stickers/broken-umbrella.png',
      isPublished: true,
    });

    // 4. Bundle into "Lavasa Survival Pack"
    const pack = await harness.createStickerPack(
      'Lavasa Survival Pack',
      [umbrellaSticker.id],
      umbrellaSticker.id
    );
    expect(pack.title).toBe('Lavasa Survival Pack');
    expect(pack.stickers.length).toBe(1);

    // 5. Publish Meme Post to Campus Feed
    const feedPost = await harness.createPost({
      content: 'Entry for the Campus Fest Meme Competition 🌧️☕ Who else slipped near the cafeteria today?',
      attachments: [
        {
          kind: 'image',
          mediaUrl: memeCreation.renderedImageUrl,
          creationId: memeCreation.id,
        },
      ],
    });

    expect(feedPost.attachments.length).toBe(1);
    expect(feedPost.attachments[0].mediaUrl).toBe('/creations/meme-monsoon-stairs.png');

    // 6. Peers react with Fire 🔥 and Laugh 😆
    await harness.login({ regNumber: '23BCA015', password: 'password_123' });
    const priyaReact = await harness.toggleReaction(feedPost.id, 'fire');
    expect(priyaReact.reactions.fire).toBe(1);

    const priyaComment = await harness.addComment(feedPost.id, 'Accurate! I need water-resistant shoes for 8:30 AM classes.');
    expect(priyaComment.author?.displayName).toBe('Priya Sharma');

    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const rahulReact = await harness.toggleReaction(feedPost.id, 'laugh');
    expect(rahulReact.reactions.laugh).toBe(1);

    // 7. Verify post metadata reflects community engagement
    const finalPost = await harness.getPostById(feedPost.id);
    expect(finalPost?.reactions.fire).toBe(1);
    expect(finalPost?.reactions.laugh).toBe(1);
    expect(finalPost?.commentsCount).toBe(1);
  });
});
