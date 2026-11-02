"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Bookmark, Check, ChevronRight, Heart, ImagePlus, MessageCircle, MoreHorizontal, Pin, Plus, Send, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMockStore } from "@/lib/mock-store/context";
import type { Club, Comment, Post } from "@/lib/mock-store/types";
import { formatRelativeTime } from "@/lib/utils";

type Notice = (message: string) => void;
type FeedTab = "campus" | "friends" | "clubs";

export function FeedView({ mode, postId, clubs, onCompose, onNotice }: {
  mode: "feed" | "saved" | "posts";
  postId?: string;
  clubs: Club[];
  onCompose: () => void;
  onNotice: Notice;
}) {
  const { store, currentProfile, currentUser } = useMockStore();
  const [tab, setTab] = useState<FeedTab>("campus");
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        let items: Post[] = [];
        let more = false;
        if (mode === "saved") items = await store.getBookmarkedPosts();
        else if (mode === "posts") { const post = postId ? await store.getPostById(postId) : null; items = post ? [post] : []; }
        else {
          for (let index = 1; index <= page; index++) {
            const result = await store.getPosts(tab, index);
            items.push(...result.items);
            more = result.hasMore;
          }
        }
        if (active) { setPosts(items); setHasMore(more); setFailed(false); }
      } catch (error) {
        if (active) { setFailed(true); onNotice(error instanceof Error ? error.message : "Your feed could not load. Please try again."); }
      } finally { if (active) setLoading(false); }
    };
    void load();
    const unsubscribe = store.subscribe(event => {
      if (["POSTS_CHANGE", "COMMENTS_CHANGE", "CLUBS_CHANGE", "FRIENDS_CHANGE"].includes(event.type)) void load();
    });
    return () => { active = false; unsubscribe(); };
  }, [store, currentUser?.id, mode, postId, tab, page, retry, onNotice]);

  const pinned = mode === "feed" ? posts.find(post => post.isPinned) : undefined;
  const visiblePosts = posts.filter(post => mode !== "feed" || !post.isPinned).sort((a, b) => {
    if (mode !== "feed" || tab !== "campus") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    const aNew = Date.now() - Date.parse(a.createdAt) < 5 * 60 * 1000;
    const bNew = Date.now() - Date.parse(b.createdAt) < 5 * 60 * 1000;
    if (aNew !== bNew) return aNew ? -1 : 1;
    const aPhoto = a.attachments.some(attachment => attachment.mediaUrl);
    const bPhoto = b.attachments.some(attachment => attachment.mediaUrl);
    return aPhoto === bPhoto ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : aPhoto ? -1 : 1;
  });

  return <>
    {mode === "feed" ? <>
      <div className="feed-heading"><div><p className="eyebrow">CHRIST UNIVERSITY · LAVASA</p><h1>Home</h1></div></div>
      {clubs.length > 0 && <div className="campus-circles" aria-label="Your campus clubs">{clubs.map(club => <Link href={`/clubs/${club.slug}`} className="campus-circle" key={club.id}><span className="circle-image">{club.coverImageUrl ? <img src={club.coverImageUrl} alt="" width={64} height={64} /> : <span className="circle-initials">{club.name.slice(0, 2).toUpperCase()}</span>}</span><span className="circle-label">{club.name}</span></Link>)}</div>}
      <div className="feed-tabs" role="group" aria-label="Feed filter">{([{ value: "campus", label: "For you" }, { value: "friends", label: "Friends" }, { value: "clubs", label: "My clubs" }] as const).map(item => <button className={`feed-tab ${tab === item.value ? "active" : ""}`} aria-pressed={tab === item.value} onClick={() => { setPage(1); setTab(item.value); }} key={item.value}>{item.label}</button>)}</div>
      <div className="feed-composer"><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName || "Guest"} size="md" /><button className="min-w-0 flex-1 text-left text-sm text-zinc-500" onClick={onCompose}>Share something with your campus…</button><button className="icon-button text-violet-600" onClick={onCompose} aria-label="Add a photo to a new post"><ImagePlus size={21} /></button></div>
      {pinned && <Link href={`/posts/${pinned.id}`} className="pinned-notice"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Pin size={16} /></span><span className="min-w-0 flex-1"><small className="block text-[9px] font-bold uppercase tracking-wider text-violet-700">Campus notice</small><strong className="mt-0.5 block truncate text-xs font-medium">{pinned.content.split("\n")[0].replace(/^📌\s*CAMPUS NOTICE:\s*/, "")}</strong></span><ChevronRight size={16} className="shrink-0 text-zinc-400" /></Link>}
    </> : <div className="page-heading"><div><p className="eyebrow">{mode === "saved" ? "KEEP THE GOOD STUFF CLOSE" : "PART OF YOUR CAMPUS STORY"}</p><h1>{mode === "saved" ? "Saved for later" : "Campus moment"}</h1></div><Link className="text-link text-xs" href="/feed">Back to feed</Link></div>}

    {loading && posts.length === 0 ? <div className="surface empty-state" role="status">Finding your campus moments…</div> : failed ? <div className="surface empty-state"><h2>Couldn’t load your feed</h2><p>Try again to catch up with your campus.</p><button className="soft-button" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : visiblePosts.length === 0 ? <div className="surface empty-state"><MessageCircle size={32} className="mx-auto mb-3 text-violet-500" /><h2>{mode === "saved" ? "No saved posts yet" : mode === "posts" ? "This post isn’t here" : tab === "friends" ? "No posts from friends yet" : tab === "clubs" ? "No club posts yet" : "Your feed starts here"}</h2><p>{mode === "saved" ? "Tap the bookmark on any post to find it here later." : mode === "posts" ? "It may have been removed. There’s more to discover in your feed." : tab === "friends" ? "Connect with classmates to see what they’re sharing." : tab === "clubs" ? "Join a community to bring their updates into your feed." : "Posts from your campus will appear here. Share the first update."}</p>{mode === "feed" && tab === "campus" ? <button className="action-button" onClick={onCompose}>Create a post</button> : <Link className="text-link" href={mode === "posts" || mode === "saved" ? "/feed" : tab === "clubs" ? "/clubs" : "/discover"}>{mode === "posts" || mode === "saved" ? "Explore the feed" : tab === "clubs" ? "Explore clubs" : "Discover classmates"}</Link>}</div> : <div className="post-list">{visiblePosts.map((post, index) => <PostCard key={post.id} initialPost={post} expanded={mode === "posts"} eager={index === 0} onNotice={onNotice} />)}</div>}
    {hasMore && !failed && <div className="feed-end"><button className="soft-button" disabled={loading} onClick={() => setPage(value => value + 1)}>{loading ? "Loading…" : "See more campus moments"}</button></div>}
    {!hasMore && visiblePosts.length > 0 && <div className="feed-end"><span className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 text-violet-500"><Check size={17} /></span><strong className="text-xs font-medium">You’re all caught up.</strong><p className="mt-1 text-[11px] text-zinc-500">You’ve seen all the posts in this feed.</p></div>}
  </>;
}

function PostCard({ initialPost, expanded, eager, onNotice }: { initialPost: Post; expanded: boolean; eager: boolean; onNotice: Notice }) {
  const { store, currentProfile, currentUser } = useMockStore();
  const [post, setPost] = useState(initialPost);
  const [pending, setPending] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(expanded);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [commentsFailed, setCommentsFailed] = useState(false);
  const [commentRetry, setCommentRetry] = useState(0);

  useEffect(() => { setPost(initialPost); }, [initialPost]);
  useEffect(() => {
    if (!commentsOpen) return;
    let active = true;
    setCommentsLoading(true);
    const load = () => store.getComments(post.id).then(items => { if (active) { setComments(items); setCommentsFailed(false); } }).catch(error => { if (active) { setCommentsFailed(true); onNotice(error instanceof Error ? error.message : "Comments could not load."); } }).finally(() => { if (active) setCommentsLoading(false); });
    void load();
    const unsubscribe = store.subscribe(event => { if (event.type === "COMMENTS_CHANGE") void load(); });
    return () => { active = false; unsubscribe(); };
  }, [commentsOpen, post.id, store, commentRetry, onNotice]);

  async function react() {
    if (pending) return;
    setPending(true);
    try { setPost(await store.toggleReaction(post.id, "love")); }
    catch (error) { onNotice(error instanceof Error ? error.message : "Your reaction could not be saved."); }
    finally { setPending(false); }
  }
  async function save() {
    if (pending) return;
    setPending(true);
    try {
      const isBookmarked = await store.toggleBookmark(post.id);
      setPost(previous => ({ ...previous, isBookmarked }));
      onNotice(isBookmarked ? "Saved. Find this moment in your Saved collection." : "Removed from your Saved collection.");
    } catch (error) { onNotice(error instanceof Error ? error.message : "This post could not be saved."); }
    finally { setPending(false); }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      onNotice("Post link copied.");
    } catch { onNotice("Couldn’t copy the link. Open the post and copy its address instead."); }
  }
  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim() || commentSending) return;
    setCommentSending(true);
    try {
      const created = await store.addComment(post.id, comment.trim());
      setComments(previous => previous.some(item => item.id === created.id) ? previous : [...previous, created]);
      setPost(previous => ({ ...previous, commentsCount: previous.commentsCount + 1 }));
      setComment("");
    } catch (error) { onNotice(error instanceof Error ? error.message : "Your comment wasn’t posted. Please try again."); }
    finally { setCommentSending(false); }
  }
  async function vote(optionId: string) {
    if (!post.poll || pending) return;
    setPending(true);
    try { const poll = await store.votePoll(post.poll.id, optionId); setPost(previous => ({ ...previous, poll })); }
    catch (error) { onNotice(error instanceof Error ? error.message : "Your vote could not be saved."); }
    finally { setPending(false); }
  }
  const liked = post.userReaction === "love";
  const reactions = Object.values(post.reactions).reduce((total, value) => total + value, 0);
  const pollClosed = !!post.poll && (post.poll.isClosed || Date.parse(post.poll.closesAt) <= Date.now());
  const profileUrl = post.author ? `/people/${post.author.handle}` : "/discover";
  const photos = post.attachments.filter(attachment => attachment.mediaUrl);

  return <article className="post-card" aria-label={`Post by ${post.author?.displayName || "a classmate"}`}>
    <header className="post-header"><Link href={profileUrl}><Avatar src={post.author?.avatarUrl} name={post.author?.displayName || "Classmate"} size="md" /></Link><div className="post-author"><Link href={profileUrl}><strong>{post.author?.handle || "campus_student"}</strong>{post.author?.course === "Administration" && <Check size={12} className="rounded-full bg-violet-600 p-0.5 text-white" />}</Link><span>{post.club ? <Link href={`/clubs/${post.club.slug}`}>{post.club.name}</Link> : "Christ University · Lavasa"}</span></div><time dateTime={post.createdAt} className="shrink-0 text-[10px] text-zinc-500">{formatRelativeTime(post.createdAt)}</time><DropdownMenu><DropdownMenuTrigger asChild><button className="icon-button" aria-label={`More options for ${post.author?.handle || "campus"}’s post`}><MoreHorizontal size={20} /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/posts/${post.id}`}>Open post</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => { void share(); }}>Copy post link</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header>
    {photos.length > 0 && <div className={photos.length > 1 ? "grid grid-cols-2 gap-0.5" : ""}>{photos.map((photo, index) => <img key={photo.id} src={photo.mediaUrl} alt={`${post.author?.displayName || "A classmate"}’s campus post${photos.length > 1 ? `, photo ${index + 1}` : ""}`} width={800} height={600} loading={eager && index === 0 ? "eager" : "lazy"} className="post-photo" />)}</div>}
    <div className="post-body">
      <div className="post-actions"><button className={`post-action ${liked ? "liked" : ""}`} aria-label={liked ? "Unlike post" : "Like post"} aria-pressed={liked} disabled={pending || !currentUser} onClick={react}><Heart size={24} strokeWidth={1.7} fill={liked ? "currentColor" : "none"} /></button><button className="post-action" aria-label={commentsOpen ? "Hide comments" : "Show comments"} aria-expanded={commentsOpen} onClick={() => setCommentsOpen(value => !value)}><MessageCircle size={24} strokeWidth={1.7} /></button><button className="post-action" aria-label="Copy post link" onClick={share}><Send size={23} strokeWidth={1.7} /></button><button className={`post-action ml-auto ${post.isBookmarked ? "saved" : ""}`} disabled={pending || !currentUser} aria-label={post.isBookmarked ? "Unsave post" : "Save post"} aria-pressed={post.isBookmarked} onClick={save}><Bookmark size={23} strokeWidth={1.7} fill={post.isBookmarked ? "currentColor" : "none"} /></button></div>
      {reactions > 0 && <p className="mb-2 flex items-center gap-2 text-xs font-semibold"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Heart size={10} fill="currentColor" /></span>{reactions} reactions</p>}
      <p className="post-caption"><Link href={profileUrl} className="mr-1.5 font-semibold">{post.author?.handle || "campus_student"}</Link><span className="whitespace-pre-wrap">{post.content}</span></p>
      {post.poll && <div className="my-4 rounded-xl border border-zinc-200 p-4"><h3 className="mb-3 text-sm font-semibold">{post.poll.question}</h3><div className="poll-options">{post.poll.options.map(option => {
        const percentage = post.poll!.totalVotes ? Math.round(option.voteCount / post.poll!.totalVotes * 100) : 0;
        const selected = post.poll!.userVotedOptionId === option.id;
        return <button key={option.id} disabled={pending || !!post.poll!.userVotedOptionId || pollClosed || !currentUser} onClick={() => { void vote(option.id); }} aria-pressed={selected} className={`poll-option relative my-2 flex w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left text-xs ${selected ? "border-violet-400" : "border-zinc-200"}`}><span className="poll-fill absolute inset-y-0 left-0 bg-violet-100" style={{ width: `${percentage}%` }} /><span className="relative flex-1">{option.optionText}</span>{(pollClosed || post.poll!.userVotedOptionId) && <span className="relative ml-2 font-semibold">{percentage}% {selected && "✓"}</span>}</button>;
      })}</div><p className="mt-3 text-[10px] text-zinc-500">{post.poll.totalVotes} votes · {pollClosed ? "Poll closed" : post.poll.userVotedOptionId ? "Thanks for voting" : "Choose one option"}</p></div>}
      <button className="post-meta text-left" onClick={() => setCommentsOpen(value => !value)} aria-expanded={commentsOpen}>{post.commentsCount > 0 ? `${commentsOpen ? "Hide" : "View all"} ${post.commentsCount} ${post.commentsCount === 1 ? "comment" : "comments"}` : "Start the conversation"}</button>
      {commentsOpen && <div className="comment-list mt-4 border-t border-zinc-100 pt-4">
        {commentsLoading && comments.length === 0 ? <p role="status" className="text-xs text-zinc-500">Loading comments…</p> : commentsFailed ? <button onClick={() => setCommentRetry(value => value + 1)} className="text-link text-xs">Comments couldn’t load. Try again</button> : comments.length === 0 ? <p className="mb-3 text-xs text-zinc-500">Be the first to say something.</p> : comments.map(item => <div key={item.id} className="mb-3 flex items-start gap-2.5"><Avatar src={item.author?.avatarUrl} name={item.author?.displayName || "Classmate"} size="xs" /><div className="min-w-0 flex-1"><p className="text-xs leading-relaxed [overflow-wrap:anywhere]">{item.author ? <Link href={`/people/${item.author.handle}`} className="mr-1.5 font-semibold">{item.author.handle}</Link> : <strong className="mr-1.5">Classmate</strong>}{item.content}</p><time className="mt-1 block text-[10px] text-zinc-400" dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time></div></div>)}
        {currentUser ? <form onSubmit={addComment} className="comment-form mt-4 flex items-center gap-2"><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName || "You"} size="xs" /><label htmlFor={`comment-${post.id}`} className="sr-only">Add a comment</label><input id={`comment-${post.id}`} value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} disabled={commentSending} placeholder="Add to the conversation…" className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs focus:border-violet-500 focus:outline-none" /><button type="submit" disabled={!comment.trim() || commentSending} className="text-link text-xs font-semibold">{commentSending ? "Posting…" : "Post"}</button></form> : <Link href="/login" className="text-link text-xs">Sign in to join the conversation</Link>}
      </div>}
    </div>
  </article>;
}

interface ComposerImage { url: string; name: string; size: number }

export function PostComposer({ open, onClose, onNotice }: { open: boolean; onClose: () => void; onNotice: Notice }) {
  const { store, currentProfile } = useMockStore();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");

  async function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (files.length + images.length > 4) { setError("Choose up to 4 photos for one post."); return; }
    if (files.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) { setError("Choose JPG, PNG, or WebP images."); return; }
    // shortcut: localStorage stores image data, use a media backend before supporting larger uploads.
    if (files.reduce((total, file) => total + file.size, 0) + images.reduce((total, image) => total + image.size, 0) > 1024 * 1024) { setError("Keep your photos under 1 MB combined."); return; }
    setReading(true);
    try {
      const selected = await Promise.all(files.map(file => new Promise<ComposerImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve({ url: reader.result, name: file.name, size: file.size }) : reject(new Error("This image could not be read."));
        reader.onerror = () => reject(new Error("This image could not be read. Please try a different photo."));
        reader.readAsDataURL(file);
      })));
      setImages(previous => [...previous, ...selected]);
    } catch (error) { setError(error instanceof Error ? error.message : "Your photos could not be added."); }
    finally { setReading(false); }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || reading || (!content.trim() && images.length === 0)) return;
    setPending(true); setError("");
    try {
      await store.createPost({ content: content.trim(), attachments: images.map(image => ({ kind: "image", mediaUrl: image.url })) });
      setContent(""); setImages([]); onClose(); onNotice("Post shared.");
    } catch (error) { setError(error instanceof Error ? error.message : "Your post wasn’t shared. Your draft is still here."); }
    finally { setPending(false); }
  }

  return <Modal isOpen={open} onClose={() => { if (!pending && !reading) onClose(); }} title="Create a post" description="Share an update with your campus." className="!w-[calc(100%_-_2rem)] !max-w-lg">
    <form onSubmit={publish} className="space-y-4">
      <div className="flex items-center gap-3"><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName || "You"} size="md" /><div><strong className="block text-sm">{currentProfile?.displayName || "Campus student"}</strong><span className="text-[11px] text-zinc-500">Sharing with your campus</span></div></div>
      <label htmlFor="post-content" className="sr-only">Post text</label><textarea id="post-content" value={content} onChange={event => setContent(event.target.value)} maxLength={2000} rows={5} placeholder="What would you like to share?" disabled={pending} className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
      {images.length > 0 && <div className="grid grid-cols-2 gap-2">{images.map((image, index) => <div key={`${image.name}-${index}`} className="relative overflow-hidden rounded-xl"><img src={image.url} alt={image.name} width={240} height={180} className="aspect-[4/3] w-full object-cover" /><button type="button" disabled={pending || reading} onClick={() => setImages(previous => previous.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${image.name}`} className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-zinc-700 shadow-sm"><X size={14} /></button></div>)}</div>}
      <div className="flex items-center justify-between gap-3"><label className={`soft-button cursor-pointer text-xs ${pending || reading || images.length >= 4 ? "opacity-50" : ""}`}><ImagePlus size={17} />{reading ? "Adding photos…" : "Add photos"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={pending || reading || images.length >= 4} onChange={selectImages} className="sr-only" aria-label="Add photos" /></label><span className="text-[10px] text-zinc-500">{content.length}/2,000</span></div>
      <p className="text-[11px] leading-relaxed text-zinc-500">Up to 4 photos · 1 MB combined</p>
      {error && <p role="alert" className="text-xs leading-relaxed text-red-600">{error}</p>}
      <button type="submit" disabled={pending || reading || (!content.trim() && images.length === 0)} className="action-button w-full">{pending ? "Sharing your moment…" : "Share post"}<Send size={16} /></button>
    </form>
  </Modal>;
}
