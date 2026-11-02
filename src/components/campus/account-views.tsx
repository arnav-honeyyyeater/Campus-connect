"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bell, Check, Grid3X3, MessageCircle, Send, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/lib/mock-store/context";
import type { Conversation, Message, Notification, Post, Profile, RelationshipState } from "@/lib/mock-store/types";
import { formatCampusDate, formatRelativeTime } from "@/lib/utils";

type AccountSection = "messages" | "notifications" | "profile" | "settings" | "login" | "signup";
type ErrorHandler = (message: string) => void;

export function AccountViews({ section, id, onError }: { section: AccountSection; id?: string; onError: ErrorHandler }) {
  if (section === "messages") return <MessagesView key={id || "inbox"} id={id} onError={onError} />;
  if (section === "notifications") return <NotificationsView onError={onError} />;
  if (section === "profile") return <ProfileView key={id || "self"} handle={id} onError={onError} />;
  if (section === "settings") return <SettingsView onError={onError} />;
  return <AuthView />;
}

function MessagesView({ id, onError }: { id?: string; onError: ErrorHandler }) {
  const { store, currentUser } = useMockStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await store.getConversations();
        const selected = id ? await store.getConversationById(id) : null;
        const allowed = selected?.members.some(member => member.userId === currentUser?.id && member.status === "accepted");
        const thread = selected && allowed ? await store.getMessages(selected.id) : [];
        if (!active) return;
        setConversations(list);
        setConversation(allowed ? selected : null);
        setMessages(thread);
        setFailed(false);
        if (selected && allowed && selected.unreadCount > 0) await store.markConversationRead(selected.id);
      } catch (error) {
        if (active) {
          setFailed(true);
          onError(error instanceof Error ? error.message : "Messages could not load. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const unsubscribe = store.subscribe(event => {
      if (event.type === "MESSAGES_CHANGE" && !event.payload?.read) void load();
    });
    return () => { active = false; unsubscribe(); };
  }, [store, id, currentUser?.id, onError]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "instant", block: "nearest" });
  }, [messages.length]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!conversation || !content || sending) return;
    setSending(true);
    try {
      const message = await store.sendMessage({ conversationId: conversation.id, content });
      setMessages(previous => previous.some(item => item.id === message.id) ? previous : [...previous, message]);
      setDraft("");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Your message was not sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const title = conversation?.otherParticipant?.displayName || conversation?.title || "Campus group";
  return <>
    <div className="page-heading"><div><p className="eyebrow">YOUR CONVERSATIONS</p><h1>Messages</h1></div><MessageCircle size={25} className="text-violet-600" /></div>
    <div className="surface overflow-hidden">
      {loading ? <div className="empty-state" role="status">Loading your conversations…</div> : failed ? <div className="empty-state"><p>We couldn’t open your messages.</p><Link href="/messages" className="text-link">Back to inbox</Link></div> : id ? conversation ? <>
        <header className="flex items-center gap-3 border-b border-zinc-100 p-4 sm:p-5">
          <Link href="/messages" aria-label="Back to messages" className="rounded-full p-2 hover:bg-zinc-100"><ArrowLeft size={20} /></Link>
          <Avatar name={title} src={conversation.otherParticipant?.avatarUrl} size="md" />
          <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{title}</h2><p className="mt-0.5 text-xs text-zinc-500">{conversation.type === "group" ? `${conversation.members.filter(member => member.status === "accepted").length} members` : "Campus friend"}</p></div>
        </header>
        <div className="flex h-[48vh] min-h-64 flex-col gap-4 overflow-y-auto p-4 sm:p-6" role="log" aria-label={`Conversation with ${title}`}>
          {messages.length === 0 && <p className="empty-state">Say hello to start the conversation.</p>}
          {messages.map(message => <div key={message.id} className={`flex max-w-[86%] flex-col gap-1 ${message.senderId === currentUser?.id ? "self-end items-end" : "self-start items-start"}`}>
            {conversation.type === "group" && message.senderId !== currentUser?.id && <span className="text-[11px] text-zinc-500">{message.sender?.displayName || "Classmate"}</span>}
            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${message.senderId === currentUser?.id ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md bg-zinc-100 text-zinc-800"}`}>
              {message.isDeleted ? <span className="italic">Message deleted</span> : <>{message.content}{message.mediaUrl && <img src={message.mediaUrl} alt="Shared in conversation" width={240} height={240} className="mt-2 max-h-60 rounded-lg object-contain" />}{!message.content && !message.mediaUrl && <span>Shared an attachment</span>}</>}
            </div>
            <time dateTime={message.createdAt} className="text-[10px] text-zinc-500">{new Date(message.createdAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" })}</time>
          </div>)}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex items-end gap-2 border-t border-zinc-100 p-4">
          <label htmlFor="chat-message" className="sr-only">Message</label>
          <textarea id="chat-message" value={draft} onChange={event => setDraft(event.target.value)} disabled={sending} maxLength={4000} rows={2} placeholder="Write a message…" className="min-w-0 flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
          <button type="submit" disabled={!draft.trim() || sending} className="action-button !min-h-12 !px-4" aria-label={sending ? "Sending message" : "Send message"}><Send size={18} /></button>
        </form>
      </> : <div className="empty-state"><h2>Conversation unavailable</h2><p>This conversation may not exist or you may no longer be a member.</p><Link href="/messages" className="text-link">Back to messages</Link></div> : <>
        <div className="border-b border-zinc-100 px-5 py-4"><h2 className="text-sm font-semibold">Your inbox</h2><p className="mt-1 text-xs text-zinc-500">Catch up with your campus friends.</p></div>
        {conversations.length === 0 ? <div className="empty-state"><MessageCircle size={30} className="mx-auto mb-3 text-violet-500" /><h2>Your inbox is quiet</h2><p>Connect with classmates to find your people.</p><Link className="text-link" href="/discover">Discover classmates</Link></div> : conversations.map(item => <Link href={`/messages/${item.id}`} key={item.id} className="flex items-center gap-3 border-b border-zinc-100 p-5 transition-colors last:border-b-0 hover:bg-violet-50/50">
          <Avatar src={item.otherParticipant?.avatarUrl} name={item.otherParticipant?.displayName || item.title || "Group"} size="lg" />
          <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h2 className="truncate text-sm font-semibold">{item.otherParticipant?.displayName || item.title}</h2><span className="shrink-0 text-[10px] text-zinc-500">{formatRelativeTime(item.lastMessageAt)}</span></div><p className="mt-1 truncate text-xs text-zinc-500">{item.lastMessagePreview || "Start the conversation"}</p></div>
          {item.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold text-white" aria-label={`${item.unreadCount} unread messages`}>{item.unreadCount}</span>}
        </Link>)}
      </>}
    </div>
  </>;
}

function NotificationsView({ onError }: { onError: ErrorHandler }) {
  const { store, currentUser } = useMockStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => store.getNotifications().then(items => { if (active) setNotifications(items); }).catch(error => { if (active) onError(error instanceof Error ? error.message : "Activity could not load."); }).finally(() => { if (active) setLoading(false); });
    void load();
    const unsubscribe = store.subscribe(event => { if (event.type === "NOTIFICATIONS_CHANGE") void load(); });
    return () => { active = false; unsubscribe(); };
  }, [store, currentUser?.id, onError]);

  async function markAllRead() {
    setPending(true);
    try { await store.markAllNotificationsRead(); setNotifications(items => items.map(item => ({ ...item, isRead: true }))); }
    catch (error) { onError(error instanceof Error ? error.message : "Couldn’t mark activity as read."); }
    finally { setPending(false); }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">YOUR UPDATES</p><h1>Activity</h1></div><Bell size={24} className="text-violet-600" /></div>
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 p-5"><h2 className="text-sm font-semibold">Your latest updates</h2><button className="text-link text-xs" disabled={pending || !notifications.some(item => !item.isRead)} onClick={markAllRead}>{pending ? "Marking…" : "Mark all as read"}</button></div>
      {loading ? <div role="status" className="empty-state">Loading activity…</div> : notifications.length === 0 ? <div className="empty-state"><Bell size={30} className="mx-auto mb-3 text-violet-500" /><h2>You’re all caught up</h2><p>New reactions, comments, and campus updates will appear here.</p></div> : notifications.map(item => <Link key={item.id} href={item.destinationUrl} onClick={() => { void store.markNotificationRead(item.id).catch(error => onError(error instanceof Error ? error.message : "Couldn’t mark this update as read.")); }} className={`flex items-start gap-3 border-b border-zinc-100 p-5 transition-colors last:border-0 hover:bg-violet-50/70 ${item.isRead ? "" : "bg-violet-50/40"}`}>
        <Avatar src={item.actor?.avatarUrl} name={item.actor?.displayName || "Campus Connect"} size="md" />
        <div className="min-w-0 flex-1"><p className="text-sm font-medium leading-relaxed [overflow-wrap:anywhere]">{item.title}</p>{item.body && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.body}</p>}<time dateTime={item.createdAt} className="mt-2 block text-[11px] text-zinc-500">{formatRelativeTime(item.createdAt)}</time></div>
        {!item.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-600" aria-label="Unread" />}
      </Link>)}
    </div>
  </>;
}

function ProfileView({ handle, onError }: { handle?: string; onError: ErrorHandler }) {
  const { store, currentProfile, currentUser } = useMockStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [relationship, setRelationship] = useState<RelationshipState>("none");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const ownProfile = profile?.id === currentUser?.id;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const person = handle ? await store.getProfileByHandle(handle) : currentProfile;
        let allPosts: Post[] = [];
        if (person) {
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const result = await store.getPosts("campus", page++);
            allPosts = [...allPosts, ...result.items.filter(post => post.authorId === person.id)];
            hasMore = result.hasMore;
          }
          const status = await store.getFriendshipStatus(person.id);
          if (active) setRelationship(status);
        }
        if (active) { setProfile(person); setPosts(allPosts); }
      } catch (error) { if (active) onError(error instanceof Error ? error.message : "This profile could not load."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [store, handle, currentProfile, onError]);

  async function addFriend() {
    if (!profile) return;
    setPending(true);
    try { const friendship = await store.sendFriendRequest(profile.id); setRelationship(friendship.status === "accepted" ? "friends" : "pending_sent"); }
    catch (error) { onError(error instanceof Error ? error.message : "Your friend request could not be sent."); }
    finally { setPending(false); }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">{ownProfile ? "YOUR ACCOUNT" : "STUDENT PROFILE"}</p><h1>{ownProfile ? "Your profile" : "Campus profile"}</h1></div>{ownProfile && <Link href="/settings" className="soft-button text-xs">Edit profile</Link>}</div>
    {loading ? <div role="status" className="surface empty-state">Loading profile…</div> : !profile ? <div className="surface empty-state"><h2>Profile not found</h2><p>Find someone else from your campus.</p><Link className="text-link" href="/discover">Discover classmates</Link></div> : <div className="surface overflow-hidden">
      <div className="px-5 py-6 sm:px-7 sm:py-7"><div className="flex items-center justify-between gap-3"><Avatar src={profile.avatarUrl} name={profile.displayName} size="2xl" />{!ownProfile && <button disabled={pending || !["none", "pending_received"].includes(relationship)} onClick={addFriend} className={["none", "pending_received"].includes(relationship) ? "action-button text-xs" : "soft-button text-xs"}>{relationship === "none" || relationship === "pending_received" ? <><UserPlus size={15} />{pending ? "Saving…" : relationship === "pending_received" ? "Accept request" : "Add friend"}</> : <><Check size={15} />{relationship === "friends" ? "Friends" : relationship === "pending_sent" ? "Request sent" : "Unavailable"}</>}</button>}</div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{profile.displayName}</h2><p className="mt-1 text-sm text-zinc-500">@{profile.handle}</p>
        {profile.bio && <p className="mt-4 max-w-lg whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 [overflow-wrap:anywhere]">{profile.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">{(profile.course || profile.yearOfStudy > 0) && <span className="flex items-center gap-1.5"><Users size={14} />{[profile.course, profile.yearOfStudy > 0 ? `Year ${profile.yearOfStudy}` : ""].filter(Boolean).join(" · ")}</span>}<span>Joined {formatCampusDate(profile.createdAt, false)}</span></div>
        {profile.interests.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{profile.interests.map(interest => <span key={interest} className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700">#{interest}</span>)}</div>}
      </div>
      <div className="flex items-center justify-center gap-2 border-y border-zinc-100 py-4 text-xs font-semibold"><Grid3X3 size={15} />{posts.length} {posts.length === 1 ? "POST" : "POSTS"}</div>
      {posts.length === 0 ? <div className="empty-state"><h2>No posts yet</h2><p>{ownProfile ? "Your campus moments will find a home here." : "Their campus story is just getting started."}</p><Link className="text-link" href="/feed">Explore the feed</Link></div> : <div className="grid grid-cols-2 gap-1 p-1 sm:grid-cols-3">{posts.map(post => <Link key={post.id} href={`/posts/${post.id}`} className="group relative flex aspect-square min-w-0 items-center justify-center overflow-hidden bg-zinc-50 p-4 transition-colors hover:bg-violet-50">
        {post.attachments[0]?.mediaUrl ? <img src={post.attachments[0].mediaUrl} alt={post.content.slice(0, 100)} width={300} height={300} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" /> : <p className="line-clamp-5 text-center text-xs leading-relaxed text-zinc-700 [overflow-wrap:anywhere]">{post.content}</p>}
        <span className="sr-only">Open post</span>
      </Link>)}</div>}
    </div>}
  </>;
}

function SettingsView({ onError }: { onError: ErrorHandler }) {
  const { store, currentProfile } = useMockStore();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(currentProfile?.displayName || "");
  const [bio, setBio] = useState(currentProfile?.bio || "");
  const [course, setCourse] = useState(currentProfile?.course || "");
  const [year, setYear] = useState(currentProfile?.yearOfStudy || 0);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDisplayName(currentProfile?.displayName || "");
    setBio(currentProfile?.bio || "");
    setCourse(currentProfile?.course || "");
    setYear(currentProfile?.yearOfStudy || 0);
  }, [currentProfile]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) { setError("Please add your display name."); return; }
    setPending(true); setSaved(false); setError("");
    try {
      await store.updateProfile({ displayName: displayName.trim(), bio: bio.trim(), course: course.trim(), yearOfStudy: year });
      setSaved(true);
    } catch (error) { setError(error instanceof Error ? error.message : "Your changes could not be saved."); }
    finally { setPending(false); }
  }

  async function logout() {
    setPending(true);
    try { await store.logout(); router.push("/login"); }
    catch (error) { onError(error instanceof Error ? error.message : "We couldn’t sign you out."); setPending(false); }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Edit profile</h1></div><Link href="/profile" className="text-link text-xs">View profile</Link></div>
    {!currentProfile ? <div className="surface empty-state"><p>Sign in to edit your campus profile.</p><Link href="/login" className="text-link">Sign in</Link></div> : <div className="surface p-5 sm:p-7">
      <div className="mb-7 flex items-center gap-4"><Avatar src={currentProfile.avatarUrl} name={currentProfile.displayName} size="xl" /><div><h2 className="font-semibold">@{currentProfile.handle}</h2><p className="mt-1 text-xs text-zinc-500">Help your classmates get to know you.</p></div></div>
      <form onSubmit={save} className="space-y-5">
        <Input label="Display name" value={displayName} onChange={event => { setDisplayName(event.target.value); setSaved(false); }} required maxLength={60} autoComplete="name" />
        <div><label htmlFor="profile-bio" className="mb-2 block text-xs font-semibold uppercase tracking-wider">Bio</label><textarea id="profile-bio" value={bio} onChange={event => { setBio(event.target.value); setSaved(false); }} maxLength={160} rows={3} className="w-full resize-y rounded-xl border border-zinc-200 p-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" /><p className="mt-1 text-right text-[11px] text-zinc-500">{bio.length}/160</p></div>
        <Input label="Course (optional)" value={course} onChange={event => { setCourse(event.target.value); setSaved(false); }} maxLength={80} />
        <div><label htmlFor="profile-year" className="mb-2 block text-xs font-semibold uppercase tracking-wider">Year of study (optional)</label><select id="profile-year" value={year} onChange={event => { setYear(Number(event.target.value)); setSaved(false); }} className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm"><option value={0}>Select your year</option>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>Year {value}</option>)}</select></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={pending} className="action-button">{pending ? "Saving…" : "Save changes"}</button>{saved && <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-700"><Check size={16} />Profile updated</p>}</div>
      </form>
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-100 pt-6"><p className="max-w-xs text-xs leading-relaxed text-zinc-500">Manage how you appear on Campus Connect.</p><button onClick={logout} disabled={pending} className="shrink-0 text-sm font-medium text-red-600 hover:underline">Sign out</button></div>
    </div>}
  </>;
}

function AuthView() {
  const { store } = useMockStore();
  const router = useRouter();
  const [regNumber, setRegNumber] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!regNumber.trim()) { setError("Enter your registration number to continue."); return; }
    setPending(true);
    try {
      await store.signInWithRegistration(regNumber.trim());
      router.push("/feed");
    } catch (error) { setError(error instanceof Error ? error.message : "We couldn’t sign you in. Please try again."); }
    finally { setPending(false); }
  }

  return <div className="auth-panel">
    <h1>Your campus, connected.</h1><p className="mb-8 mt-4 text-sm leading-relaxed text-zinc-500">Enter your registration number to continue.</p>
    <form onSubmit={submit} className="space-y-5">
      <Input label="Registration number" value={regNumber} onChange={event => setRegNumber(event.target.value)} autoComplete="username" placeholder="Enter your registration number" required />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending || !regNumber.trim()} className="action-button w-full">{pending ? "Opening your campus…" : "Continue"}<ArrowRight size={16} /></button>
    </form>
    <p className="mt-6 text-xs leading-relaxed text-zinc-500">Registration-only access is temporary.</p>
  </div>;
}
