import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockStore } from "@/lib/mock-store/store";

describe("MockStore - Feed, Posts, Polls & Bookmarks", () => {
  let store: MockStore;

  beforeEach(() => {
    store = MockStore.getInstance();
    store.resetToDefaultSeeds();
  });

  it("getPosts returns paginated posts with author enrichment and pinned post first", async () => {
    const { items, hasMore } = await store.getPosts("campus", 1);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].isPinned).toBe(true);
    expect(items[0].author).toBeDefined();
    expect(typeof hasMore).toBe("boolean");
  });

  it("createPost creates post and enforces character limit", async () => {
    const post = await store.createPost({
      content: "A genuine test post from Central Block!",
    });

    expect(post.id).toBeDefined();
    expect(post.content).toBe("A genuine test post from Central Block!");
    expect(post.author?.handle).toBe("arnav_s");

    const retrieved = await store.getPostById(post.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(post.id);

    const excessiveContent = "x".repeat(2001);
    await expect(store.createPost({ content: excessiveContent })).rejects.toThrow(
      "Post content cannot exceed 2000 characters."
    );
  });

  it("keeps prior posts and emits no change when a photo post exceeds browser storage", async () => {
    const before = await store.getPosts("campus");
    const persistedBefore = window.localStorage.getItem("cc_mock_posts");
    const changed = vi.fn();
    const unsubscribe = store.subscribe(changed);
    const write = vi.spyOn(window.localStorage, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const input = { content: "A campus photo", attachments: [{ kind: "image" as const, mediaUrl: "data:image/png;base64,cGhvdG8=" }] };

    try {
      await expect(store.createPost(input)).rejects.toThrow("Your post could not be saved in this browser");
      expect(await store.getPosts("campus")).toEqual(before);
      expect(window.localStorage.getItem("cc_mock_posts")).toBe(persistedBefore);
      expect(changed).not.toHaveBeenCalled();

      const retried = await store.createPost(input);
      expect((await store.getPosts("campus")).items.some(post => post.id === retried.id)).toBe(true);
      expect(JSON.parse(window.localStorage.getItem("cc_mock_posts") || "[]")).toEqual(expect.arrayContaining([expect.objectContaining({ id: retried.id })]));
      expect(changed).toHaveBeenCalledTimes(1);
    } finally {
      unsubscribe();
      write.mockRestore();
      warn.mockRestore();
    }
  });

  it("toggleReaction toggles reactions accurately", async () => {
    const { items } = await store.getPosts("campus");
    const testPost = items[1]; // non-pinned post
    const initialLikes = testPost.reactions.like || 0;
    const initialLove = testPost.reactions.love || 0;

    // Add like
    const liked = await store.toggleReaction(testPost.id, "like");
    expect(liked.reactions.like).toBe(initialLikes + 1);
    expect(liked.userReaction).toBe("like");

    // Toggle off like
    const unliked = await store.toggleReaction(testPost.id, "like");
    expect(unliked.reactions.like).toBe(initialLikes);
    expect(unliked.userReaction).toBeUndefined();

    // Switch to love
    const loved = await store.toggleReaction(testPost.id, "love");
    expect(loved.reactions.love).toBe(initialLove + 1);
    expect(loved.userReaction).toBe("love");
  });

  it("votePoll handles voting and vote switching", async () => {
    const postWithPoll = await store.getPostById("post_fog_poll");
    expect(postWithPoll?.poll).toBeDefined();
    const pollId = postWithPoll!.poll!.id;

    // Switch vote to opt_fog
    const updatedPoll = await store.votePoll(pollId, "opt_fog");
    expect(updatedPoll.userVotedOptionId).toBe("opt_fog");

    const fogOption = updatedPoll.options.find((o) => o.id === "opt_fog");
    expect(fogOption?.voteCount).toBe(15); // initial was 14
  });

  it("toggleBookmark saves and retrieves private bookmarked posts", async () => {
    const { items } = await store.getPosts("campus");
    const postId = items[items.length - 1].id;

    const bookmarked = await store.toggleBookmark(postId);
    expect(bookmarked).toBe(true);

    const savedPosts = await store.getBookmarkedPosts();
    expect(savedPosts.some((p) => p.id === postId)).toBe(true);

    const unbookmarked = await store.toggleBookmark(postId);
    expect(unbookmarked).toBe(false);
  });

  it("addComment adds comment and increments post commentsCount", async () => {
    const { items } = await store.getPosts("campus");
    const postId = items[0].id;
    const initialCount = items[0].commentsCount;

    const newComment = await store.addComment(postId, "Great initiative!");
    expect(newComment.content).toBe("Great initiative!");
    expect(newComment.author?.displayName).toBe("Arnav Sharma");

    const comments = await store.getComments(postId);
    expect(comments.some((c) => c.id === newComment.id)).toBe(true);

    const updatedPost = await store.getPostById(postId);
    expect(updatedPost?.commentsCount).toBe(initialCount + 1);
  });
});
