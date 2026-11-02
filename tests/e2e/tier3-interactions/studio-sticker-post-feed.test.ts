import { describe, it, expect, beforeEach } from 'vitest';
import { TestStoreHarness } from '../helpers/test-store-harness';

describe('Tier 3: Cross-Feature Interactions — Studio -> Sticker Pack -> Feed Attachment Pipeline', () => {
  let harness: TestStoreHarness;

  beforeEach(() => {
    harness = new TestStoreHarness();
  });

  it('T3-FLOW-03: creates custom polygon cutout sticker in studio, packages into pack, and attaches to campus feed post', async () => {
    // Step 1: Priya designs custom sticker in /studio
    const customSticker = await harness.saveCreation({
      kind: 'sticker',
      title: 'Lavasa Rain Umbrella',
      renderedImageUrl: '/stickers/custom-umbrella.png',
      draftData: {
        version: 1,
        mode: 'sticker',
        aspectRatio: '1:1',
        layers: [
          {
            id: 'layer_umbrella_poly',
            type: 'polygon',
            x: 0,
            y: 0,
            width: 400,
            height: 400,
            rotation: 0,
            points: [50, 100, 200, 30, 350, 100, 200, 250],
            fill: '#F26457',
            stroke: '#20241E',
            strokeWidth: 2,
          },
          {
            id: 'layer_text',
            type: 'text',
            content: 'Lavasa Monsoon 🌧️',
            x: 50,
            y: 300,
            width: 300,
            height: 50,
            rotation: 0,
            fontSize: 24,
            fill: '#20241E',
          },
        ],
      },
      isPublished: true,
    });
    expect(customSticker.id).toBeDefined();

    // Step 2: Priya compiles sticker into a published Sticker Pack
    const stickerPack = await harness.createStickerPack(
      'Lavasa Monsoon Survival Kit',
      [customSticker.id],
      customSticker.id
    );
    expect(stickerPack.isPublished).toBe(true);
    expect(stickerPack.stickers.length).toBe(1);

    // Step 3: Priya attaches custom sticker in Post Composer on /feed
    const postWithSticker = await harness.createPost({
      content: 'Heavy rains today! Stay warm everyone. Use my new sticker pack for your stories:',
      attachments: [
        {
          kind: 'custom_sticker',
          creationId: customSticker.id,
          mediaUrl: customSticker.renderedImageUrl,
        },
      ],
    });

    expect(postWithSticker.attachments.length).toBe(1);
    expect(postWithSticker.attachments[0].kind).toBe('custom_sticker');
    expect(postWithSticker.attachments[0].creationId).toBe(customSticker.id);

    // Step 4: Peer student (Rahul) browses Campus Feed and views the attached sticker
    await harness.login({ regNumber: '23BBA088', password: 'password_456' });
    const { items: campusFeed } = await harness.getPosts('campus');

    const renderedPost = campusFeed.find((p) => p.id === postWithSticker.id);
    expect(renderedPost).toBeDefined();
    expect(renderedPost?.attachments[0].creationId).toBe(customSticker.id);
    expect(renderedPost?.attachments[0].mediaUrl).toBe('/stickers/custom-umbrella.png');

    // Rahul reacts with laugh 😆
    const reactedPost = await harness.toggleReaction(renderedPost!.id, 'laugh');
    expect(reactedPost.reactions.laugh).toBe(1);
  });
});
