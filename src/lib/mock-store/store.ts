// ============================================================================
// File: src/lib/mock-store/store.ts
// Campus Connect - Unified Reactive Mock Store Implementation
// ============================================================================

import {
  IMockStore,
  Session,
  UserAccount,
  Profile,
  AccountSettings,
  SignupInput,
  LoginInput,
  Post,
  CreatePostInput,
  PostReactionType,
  Poll,
  Comment,
  Club,
  ClubMembership,
  CampusEvent,
  EventRsvp,
  RsvpStatus,
  Conversation,
  Message,
  SendMessageInput,
  Creation,
  SaveCreationInput,
  StickerPack,
  Notification,
  Report,
  ReportCategory,
  ReportTargetType,
  SearchFilter,
  SearchResults,
  Friendship,
  RelationshipState,
  StoreEventListener,
  StoreEventType,
} from './types';

import {
  SEED_CAMPUS,
  SEED_USERS,
  SEED_PROFILES,
  SEED_SETTINGS,
  SEED_FRIENDSHIPS,
  SEED_CLUBS,
  SEED_CLUB_MEMBERSHIPS,
  SEED_EVENTS,
  SEED_EVENT_RSVPS,
  SEED_POSTS,
  SEED_COMMENTS,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_CREATIONS,
  SEED_STICKER_PACKS,
  SEED_NOTIFICATIONS,
  SEED_TRENDING_TAGS,
} from './fixtures';

const STORAGE_PREFIX = 'cc_mock_';
const KEYS = {
  INITIALIZED: `${STORAGE_PREFIX}initialized`,
  SESSION: `${STORAGE_PREFIX}session`,
  USERS: `${STORAGE_PREFIX}users`,
  PROFILES: `${STORAGE_PREFIX}profiles`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  FRIENDSHIPS: `${STORAGE_PREFIX}friendships`,
  BLOCKS: `${STORAGE_PREFIX}blocks`,
  POSTS: `${STORAGE_PREFIX}posts`,
  COMMENTS: `${STORAGE_PREFIX}comments`,
  REACTIONS: `${STORAGE_PREFIX}reactions`,
  BOOKMARKS: `${STORAGE_PREFIX}bookmarks`,
  POLLS: `${STORAGE_PREFIX}polls`,
  CLUBS: `${STORAGE_PREFIX}clubs`,
  CLUB_MEMBERSHIPS: `${STORAGE_PREFIX}club_memberships`,
  EVENTS: `${STORAGE_PREFIX}events`,
  EVENT_RSVPS: `${STORAGE_PREFIX}event_rsvps`,
  CONVERSATIONS: `${STORAGE_PREFIX}conversations`,
  MESSAGES: `${STORAGE_PREFIX}messages`,
  CREATIONS: `${STORAGE_PREFIX}creations`,
  STICKER_PACKS: `${STORAGE_PREFIX}sticker_packs`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  REPORTS: `${STORAGE_PREFIX}reports`,
};

function normalizeRegNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!/^[A-Za-z0-9-]{4,32}$/.test(trimmed)) {
    throw new Error('Registration number must be 4 to 32 alphanumeric characters.');
  }
  return trimmed.toUpperCase();
}

function simulateDelay(minMs = 30, maxMs = 60): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export class MockStore implements IMockStore {
  private static instance: MockStore | null = null;
  private listeners: Set<StoreEventListener> = new Set();

  // In-Memory collections
  private users: Map<string, UserAccount> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private settings: Map<string, AccountSettings> = new Map();
  private friendships: Map<string, Friendship> = new Map();
  private blocks: Set<string> = new Set(); // Key format: `${blockerId}:${blockedId}`
  private posts: Map<string, Post> = new Map();
  private comments: Map<string, Comment> = new Map();
  private bookmarks: Set<string> = new Set(); // Key format: `${userId}:${postId}`
  private clubs: Map<string, Club> = new Map();
  private clubMemberships: Map<string, ClubMembership> = new Map(); // Key: `${clubId}:${userId}`
  private events: Map<string, CampusEvent> = new Map();
  private eventRsvps: Map<string, EventRsvp> = new Map(); // Key: `${eventId}:${userId}`
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private creations: Map<string, Creation> = new Map();
  private stickerPacks: Map<string, StickerPack> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private reports: Map<string, Report> = new Map();

  private currentSession: Session | null = null;

  public static getInstance(): MockStore {
    if (!MockStore.instance) {
      MockStore.instance = new MockStore();
    }
    return MockStore.instance;
  }

  public static createApplicationStore(): MockStore {
    return new MockStore(true);
  }

  private constructor(private readonly application = false) {
    this.initStore();
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private getItem<T>(key: string): T | null {
    if (!this.isClient()) return null;
    try {
      const data = window.localStorage.getItem(this.application ? key.replace(STORAGE_PREFIX, 'cc_app_') : key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  private setItem<T>(key: string, value: T): boolean {
    if (!this.isClient()) return true;
    try {
      window.localStorage.setItem(this.application ? key.replace(STORAGE_PREFIX, 'cc_app_') : key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Failed to persist key ${key} to localStorage`, e);
      return false;
    }
  }

  private initStore(): void {
    if (this.application) {
      this.loadFromLocalStorage();
      return;
    }
    const initialized = this.getItem<boolean>(KEYS.INITIALIZED);

    if (!initialized) {
      this.resetToDefaultSeeds();
    } else {
      this.loadFromLocalStorage();
    }
  }

  public resetToDefaultSeeds(): void {
    if (this.application) throw new Error('Sample data is unavailable in the application.');
    this.users.clear();
    this.profiles.clear();
    this.settings.clear();
    this.friendships.clear();
    this.blocks.clear();
    this.posts.clear();
    this.comments.clear();
    this.bookmarks.clear();
    this.clubs.clear();
    this.clubMemberships.clear();
    this.events.clear();
    this.eventRsvps.clear();
    this.conversations.clear();
    this.messages.clear();
    this.creations.clear();
    this.stickerPacks.clear();
    this.notifications.clear();
    this.reports.clear();

    SEED_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    SEED_PROFILES.forEach((p) => this.profiles.set(p.id, { ...p }));
    SEED_SETTINGS.forEach((s) => this.settings.set(s.userId, { ...s }));
    SEED_FRIENDSHIPS.forEach((f) => this.friendships.set(f.id, { ...f }));
    SEED_CLUBS.forEach((c) => this.clubs.set(c.id, { ...c }));
    SEED_CLUB_MEMBERSHIPS.forEach((m) => this.clubMemberships.set(`${m.clubId}:${m.userId}`, { ...m }));
    SEED_EVENTS.forEach((e) => this.events.set(e.id, { ...e }));
    SEED_EVENT_RSVPS.forEach((r) => this.eventRsvps.set(`${r.eventId}:${r.userId}`, { ...r }));
    SEED_POSTS.forEach((p) => this.posts.set(p.id, { ...p }));
    SEED_COMMENTS.forEach((c) => this.comments.set(c.id, { ...c }));
    SEED_CONVERSATIONS.forEach((c) => this.conversations.set(c.id, { ...c }));
    SEED_MESSAGES.forEach((m) => this.messages.set(m.id, { ...m }));
    SEED_CREATIONS.forEach((c) => this.creations.set(c.id, { ...c }));
    SEED_STICKER_PACKS.forEach((sp) => this.stickerPacks.set(sp.id, { ...sp }));
    SEED_NOTIFICATIONS.forEach((n) => this.notifications.set(n.id, { ...n }));

    // Default seed bookmarks for Arnav
    this.bookmarks.add('usr_arnav_s:post_admin_announcement');
    this.bookmarks.add('usr_arnav_s:post_stair_meme');
    this.bookmarks.add('usr_arnav_s:post_hackathon_teaser');

    // Default session is seed student Arnav Sharma
    const arnav = this.users.get('usr_arnav_s')!;
    const arnavProfile = this.profiles.get('usr_arnav_s')!;
    this.currentSession = {
      user: arnav,
      profile: arnavProfile,
      token: 'mock_session_token_arnav_2441001',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };

    this.persistAll();
    this.setItem(KEYS.INITIALIZED, true);
    this.emit('AUTH_STATE_CHANGE');
  }

  private loadFromLocalStorage(): void {
    const users = this.getItem<UserAccount[]>(KEYS.USERS) || (this.application ? [] : SEED_USERS);
    const profiles = this.getItem<Profile[]>(KEYS.PROFILES) || (this.application ? [] : SEED_PROFILES);
    const settings = this.getItem<AccountSettings[]>(KEYS.SETTINGS) || (this.application ? [] : SEED_SETTINGS);
    const friendships = this.getItem<Friendship[]>(KEYS.FRIENDSHIPS) || (this.application ? [] : SEED_FRIENDSHIPS);
    const blocks = this.getItem<string[]>(KEYS.BLOCKS) || [];
    const posts = this.getItem<Post[]>(KEYS.POSTS) || (this.application ? [] : SEED_POSTS);
    const comments = this.getItem<Comment[]>(KEYS.COMMENTS) || (this.application ? [] : SEED_COMMENTS);
    const bookmarks = this.getItem<string[]>(KEYS.BOOKMARKS) || [];
    const clubs = this.getItem<Club[]>(KEYS.CLUBS) || (this.application ? [] : SEED_CLUBS);
    const clubMemberships = this.getItem<ClubMembership[]>(KEYS.CLUB_MEMBERSHIPS) || (this.application ? [] : SEED_CLUB_MEMBERSHIPS);
    const events = this.getItem<CampusEvent[]>(KEYS.EVENTS) || (this.application ? [] : SEED_EVENTS);
    const eventRsvps = this.getItem<EventRsvp[]>(KEYS.EVENT_RSVPS) || (this.application ? [] : SEED_EVENT_RSVPS);
    const conversations = this.getItem<Conversation[]>(KEYS.CONVERSATIONS) || (this.application ? [] : SEED_CONVERSATIONS);
    const messages = this.getItem<Message[]>(KEYS.MESSAGES) || (this.application ? [] : SEED_MESSAGES);
    const creations = this.getItem<Creation[]>(KEYS.CREATIONS) || (this.application ? [] : SEED_CREATIONS);
    const stickerPacks = this.getItem<StickerPack[]>(KEYS.STICKER_PACKS) || (this.application ? [] : SEED_STICKER_PACKS);
    const notifications = this.getItem<Notification[]>(KEYS.NOTIFICATIONS) || (this.application ? [] : SEED_NOTIFICATIONS);
    const session = this.getItem<Session>(KEYS.SESSION);

    users.forEach((u) => this.users.set(u.id, u));
    profiles.forEach((p) => this.profiles.set(p.id, p));
    settings.forEach((s) => this.settings.set(s.userId, s));
    friendships.forEach((f) => this.friendships.set(f.id, f));
    blocks.forEach((b) => this.blocks.add(b));
    posts.forEach((p) => this.posts.set(p.id, p));
    comments.forEach((c) => this.comments.set(c.id, c));
    bookmarks.forEach((b) => this.bookmarks.add(b));
    clubs.forEach((c) => this.clubs.set(c.id, c));
    clubMemberships.forEach((m) => this.clubMemberships.set(`${m.clubId}:${m.userId}`, m));
    events.forEach((e) => this.events.set(e.id, e));
    eventRsvps.forEach((r) => this.eventRsvps.set(`${r.eventId}:${r.userId}`, r));
    conversations.forEach((c) => this.conversations.set(c.id, c));
    messages.forEach((m) => this.messages.set(m.id, m));
    creations.forEach((c) => this.creations.set(c.id, c));
    stickerPacks.forEach((sp) => this.stickerPacks.set(sp.id, sp));
    notifications.forEach((n) => this.notifications.set(n.id, n));

    this.currentSession = session;
  }

  private persistAll(): void {
    this.setItem(KEYS.SESSION, this.currentSession);
    this.setItem(KEYS.USERS, Array.from(this.users.values()));
    this.setItem(KEYS.PROFILES, Array.from(this.profiles.values()));
    this.setItem(KEYS.SETTINGS, Array.from(this.settings.values()));
    this.setItem(KEYS.FRIENDSHIPS, Array.from(this.friendships.values()));
    this.setItem(KEYS.BLOCKS, Array.from(this.blocks.values()));
    this.setItem(KEYS.POSTS, Array.from(this.posts.values()));
    this.setItem(KEYS.COMMENTS, Array.from(this.comments.values()));
    this.setItem(KEYS.BOOKMARKS, Array.from(this.bookmarks.values()));
    this.setItem(KEYS.CLUBS, Array.from(this.clubs.values()));
    this.setItem(KEYS.CLUB_MEMBERSHIPS, Array.from(this.clubMemberships.values()));
    this.setItem(KEYS.EVENTS, Array.from(this.events.values()));
    this.setItem(KEYS.EVENT_RSVPS, Array.from(this.eventRsvps.values()));
    this.setItem(KEYS.CONVERSATIONS, Array.from(this.conversations.values()));
    this.setItem(KEYS.MESSAGES, Array.from(this.messages.values()));
    this.setItem(KEYS.CREATIONS, Array.from(this.creations.values()));
    this.setItem(KEYS.STICKER_PACKS, Array.from(this.stickerPacks.values()));
    this.setItem(KEYS.NOTIFICATIONS, Array.from(this.notifications.values()));
    this.setItem(KEYS.REPORTS, Array.from(this.reports.values()));
  }

  // Pub-Sub Event Bus
  public subscribe(listener: StoreEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(type: StoreEventType, payload?: any): void {
    const event = { type, payload, timestamp: Date.now() };
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in store event listener:', err);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Authentication & Session
  // --------------------------------------------------------------------------
  public getCurrentUser(): UserAccount | null {
    return this.currentSession ? this.currentSession.user : null;
  }

  public getCurrentProfile(): Profile | null {
    return this.currentSession ? this.currentSession.profile : null;
  }

  public getSession(): Session | null {
    return this.currentSession;
  }

  public async signInWithRegistration(regNumber: string): Promise<Session> {
    const normalized = regNumber.trim().toUpperCase();
    if (!normalized) throw new Error('Enter your registration number.');
    const now = new Date().toISOString();
    const existing = Array.from(this.users.values()).find(user => user.normalizedRegNumber === normalized);
    const id = existing?.id || `usr_${crypto.randomUUID()}`;
    const user: UserAccount = existing || {
      id, normalizedRegNumber: normalized, passwordHash: '', recoveryEmailVerified: false,
      recoveryEmailStatus: 'not_added', role: 'student', status: 'active', createdAt: now,
    };
    const profile: Profile = this.profiles.get(id) || {
      id, handle: `student_${id.slice(-8)}`, displayName: normalized, avatarUrl: '', bio: '',
      course: '', yearOfStudy: 0, interests: [], createdAt: now, updatedAt: now,
    };
    const settings: AccountSettings = this.settings.get(id) || {
      userId: id, theme: 'dark', reduceMotion: false, readReceiptsEnabled: false,
      notifyOnComments: true, notifyOnReactions: true, notifyOnFriendRequests: true,
      notifyOnEventUpdates: true, updatedAt: now,
    };
    // shortcut: registration numbers identify local profiles, add backend verification before shared deployment.
    const session: Session = { user, profile, token: `local_${crypto.randomUUID()}`, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString() };
    const nextUsers = new Map(this.users).set(id, user);
    const nextProfiles = new Map(this.profiles).set(id, profile);
    const nextSettings = new Map(this.settings).set(id, settings);
    if (!this.setItem(KEYS.USERS, Array.from(nextUsers.values())) ||
        !this.setItem(KEYS.PROFILES, Array.from(nextProfiles.values())) ||
        !this.setItem(KEYS.SETTINGS, Array.from(nextSettings.values())) ||
        !this.setItem(KEYS.SESSION, session)) {
      throw new Error('Your registration could not be saved in this browser. Free up browser storage and try again.');
    }
    this.users = nextUsers;
    this.profiles = nextProfiles;
    this.settings = nextSettings;
    this.currentSession = session;
    this.emit('AUTH_STATE_CHANGE', session);
    return session;
  }

  public async login(input: LoginInput): Promise<Session> {
    if (this.application) return this.signInWithRegistration(input.regNumber);
    await simulateDelay();
    const normalized = normalizeRegNumber(input.regNumber);
    const user = Array.from(this.users.values()).find(
      (u) => u.normalizedRegNumber === normalized && u.passwordHash === input.password
    );

    if (!user) {
      throw new Error('Invalid registration number or password.');
    }

    if (user.status !== 'active') {
      throw new Error('Your account has been suspended. Please contact campus admin.');
    }

    const profile = this.profiles.get(user.id);
    if (!profile) {
      throw new Error('Profile not found.');
    }

    this.currentSession = {
      user,
      profile,
      token: `mock_session_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };

    this.setItem(KEYS.SESSION, this.currentSession);
    this.emit('AUTH_STATE_CHANGE', this.currentSession);
    return this.currentSession;
  }

  public async signup(input: SignupInput): Promise<Session> {
    if (this.application) return this.signInWithRegistration(input.regNumber);
    await simulateDelay();
    if (!input.ageConfirmed) {
      throw new Error('You must confirm you are at least 16 years old.');
    }
    if (!input.termsAccepted) {
      throw new Error('You must accept the Campus Connect terms and privacy notice.');
    }
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (input.confirmPassword && input.password !== input.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const normalized = normalizeRegNumber(input.regNumber);
    const existing = Array.from(this.users.values()).find((u) => u.normalizedRegNumber === normalized);
    if (existing) {
      throw new Error('An account with this registration number already exists. Please log in.');
    }

    const newUserId = `usr_${normalized.toLowerCase()}`;
    const newUser: UserAccount = {
      id: newUserId,
      normalizedRegNumber: normalized,
      passwordHash: input.password,
      recoveryEmailStatus: 'not_added',
      recoveryEmailVerified: false,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const newProfile: Profile = {
      id: newUserId,
      handle: `student_${normalized.toLowerCase()}`,
      displayName: `Student ${normalized}`,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'New student on Campus Connect!',
      course: 'General Studies',
      yearOfStudy: 1,
      interests: ['campus'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSettings: AccountSettings = {
      userId: newUserId,
      theme: 'light',
      reduceMotion: false,
      readReceiptsEnabled: false,
      notifyOnComments: true,
      notifyOnReactions: true,
      notifyOnFriendRequests: true,
      notifyOnEventUpdates: true,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(newUserId, newUser);
    this.profiles.set(newUserId, newProfile);
    this.settings.set(newUserId, newSettings);

    this.currentSession = {
      user: newUser,
      profile: newProfile,
      token: `mock_session_${newUserId}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };

    this.persistAll();
    this.emit('AUTH_STATE_CHANGE', this.currentSession);
    return this.currentSession;
  }

  public async logout(): Promise<void> {
    await simulateDelay();
    this.currentSession = null;
    this.setItem(KEYS.SESSION, null);
    this.emit('AUTH_STATE_CHANGE', null);
  }

  public async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const profile = this.profiles.get(user.id);
    if (!profile) throw new Error('Profile not found.');

    if (updates.bio && updates.bio.length > 160) {
      throw new Error('Bio cannot exceed 160 characters.');
    }

    if (updates.handle && updates.handle !== profile.handle) {
      const handleLower = updates.handle.toLowerCase();
      if (!/^[a-z0-9_]{3,24}$/.test(handleLower)) {
        throw new Error('Handle must be 3-24 lowercase alphanumeric characters or underscores.');
      }
      const duplicate = Array.from(this.profiles.values()).find(
        (p) => p.handle === handleLower && p.id !== user.id
      );
      if (duplicate) {
        throw new Error('Handle is already claimed by another student.');
      }
      updates.handle = handleLower;
    }

    const updatedProfile: Profile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(user.id, updatedProfile);
    if (this.currentSession) {
      this.currentSession.profile = updatedProfile;
      this.setItem(KEYS.SESSION, this.currentSession);
    }
    this.setItem(KEYS.PROFILES, Array.from(this.profiles.values()));
    this.emit('AUTH_STATE_CHANGE', this.currentSession);
    return updatedProfile;
  }

  public async getSettings(): Promise<AccountSettings> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');
    const s = this.settings.get(user.id);
    if (!s) {
      const defaultSettings: AccountSettings = {
        userId: user.id,
        theme: 'light',
        reduceMotion: false,
        readReceiptsEnabled: false,
        notifyOnComments: true,
        notifyOnReactions: true,
        notifyOnFriendRequests: true,
        notifyOnEventUpdates: true,
        updatedAt: new Date().toISOString(),
      };
      this.settings.set(user.id, defaultSettings);
      this.setItem(KEYS.SETTINGS, Array.from(this.settings.values()));
      return defaultSettings;
    }
    return s;
  }

  public async updateSettings(updates: Partial<AccountSettings>): Promise<AccountSettings> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');
    const current = await this.getSettings();
    const updated: AccountSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(user.id, updated);
    this.setItem(KEYS.SETTINGS, Array.from(this.settings.values()));
    return updated;
  }

  public async requestPasswordReset(regNumber: string): Promise<boolean> {
    await simulateDelay();
    normalizeRegNumber(regNumber);
    // Generic simulated return
    return true;
  }

  public async resetPassword(password: string): Promise<boolean> {
    await simulateDelay();
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    const user = this.getCurrentUser();
    if (user) {
      user.passwordHash = password;
      this.users.set(user.id, user);
      this.setItem(KEYS.USERS, Array.from(this.users.values()));
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // Feed & Posts
  // --------------------------------------------------------------------------
  public async getPosts(
    tab: 'campus' | 'friends' | 'clubs' = 'campus',
    page = 1
  ): Promise<{ items: Post[]; hasMore: boolean }> {
    await simulateDelay();
    const currentUser = this.getCurrentUser();
    let allPosts = Array.from(this.posts.values());

    // Filter out posts from blocked users
    if (currentUser) {
      allPosts = allPosts.filter(
        (p) =>
          !this.blocks.has(`${currentUser.id}:${p.authorId}`) &&
          !this.blocks.has(`${p.authorId}:${currentUser.id}`)
      );
    }

    if (tab === 'friends' && currentUser) {
      // Find mutual friends
      const friendIds = new Set<string>();
      this.friendships.forEach((f) => {
        if (f.status === 'accepted') {
          if (f.requesterId === currentUser.id) friendIds.add(f.addresseeId);
          if (f.addresseeId === currentUser.id) friendIds.add(f.requesterId);
        }
      });
      allPosts = allPosts.filter((p) => friendIds.has(p.authorId));
    } else if (tab === 'clubs' && currentUser) {
      // Find joined clubs
      const joinedClubIds = new Set<string>();
      this.clubMemberships.forEach((m) => {
        if (m.userId === currentUser.id) joinedClubIds.add(m.clubId);
      });
      allPosts = allPosts.filter((p) => p.clubId && joinedClubIds.has(p.clubId));
    }

    // Sort: pinned first, then newest first
    allPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Populate transient fields
    const enriched = allPosts.map((post) => this.enrichPost(post));

    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const items = enriched.slice(start, start + pageSize);
    const hasMore = start + pageSize < enriched.length;

    return { items, hasMore };
  }

  private enrichPost(post: Post): Post {
    const currentUser = this.getCurrentUser();
    const author = this.profiles.get(post.authorId);
    const club = post.clubId ? this.clubs.get(post.clubId) : undefined;
    const isBookmarked = currentUser ? this.bookmarks.has(`${currentUser.id}:${post.id}`) : false;

    // Comments count
    const commentsCount = Array.from(this.comments.values()).filter(
      (c) => c.postId === post.id
    ).length;

    return {
      ...post,
      author,
      club,
      isBookmarked,
      commentsCount,
    };
  }

  public async getPostById(postId: string): Promise<Post | null> {
    await simulateDelay();
    const post = this.posts.get(postId);
    if (!post) return null;
    return this.enrichPost(post);
  }

  public async createPost(input: CreatePostInput): Promise<Post> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required to create a post.');

    if (!input.content.trim() && (!input.attachments || input.attachments.length === 0) && !input.poll) {
      throw new Error('A post cannot be completely empty.');
    }
    if (input.content.length > 2000) {
      throw new Error('Post content cannot exceed 2000 characters.');
    }
    if (input.attachments && input.attachments.length > 4) {
      throw new Error('A maximum of 4 attachments is permitted per post.');
    }

    const postId = `post_${Date.now()}`;
    let poll: Poll | undefined = undefined;

    if (input.poll) {
      if (input.poll.options.length < 2 || input.poll.options.length > 6) {
        throw new Error('Polls must have between 2 and 6 options.');
      }
      const pollId = `poll_${Date.now()}`;
      const durationHours = input.poll.durationHours || 24;
      poll = {
        id: pollId,
        postId,
        question: input.poll.question,
        closesAt: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
        totalVotes: 0,
        isClosed: false,
        options: input.poll.options.map((optText, index) => ({
          id: `opt_${pollId}_${index}`,
          pollId,
          optionText: optText,
          displayOrder: index,
          voteCount: 0,
        })),
      };
    }

    const attachments = (input.attachments || []).map((att, index) => ({
      ...att,
      id: `att_${postId}_${index}`,
      postId,
      displayOrder: index,
    }));

    const newPost: Post = {
      id: postId,
      authorId: user.id,
      campusId: SEED_CAMPUS.id,
      clubId: input.clubId,
      content: input.content,
      isPinned: false,
      attachments,
      poll,
      reactions: { like: 0, love: 0, laugh: 0, fire: 0, clap: 0 },
      commentsCount: 0,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextPosts = new Map(this.posts).set(postId, newPost);
    if (!this.setItem(KEYS.POSTS, Array.from(nextPosts.values()))) {
      throw new Error('Your post could not be saved in this browser. Free up browser storage or remove photos, then try again. Your draft is still here.');
    }
    this.posts = nextPosts;
    this.emit('POSTS_CHANGE', newPost);
    return this.enrichPost(newPost);
  }

  public async editPost(postId: string, content: string): Promise<Post> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found.');
    if (post.authorId !== user.id) throw new Error('You can only edit your own posts.');
    if (content.length > 2000) throw new Error('Post content cannot exceed 2000 characters.');

    post.content = content;
    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    this.setItem(KEYS.POSTS, Array.from(this.posts.values()));
    this.emit('POSTS_CHANGE', post);
    return this.enrichPost(post);
  }

  public async deletePost(postId: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found.');
    if (post.authorId !== user.id && user.role !== 'campus_admin') {
      throw new Error('You do not have permission to delete this post.');
    }

    this.posts.delete(postId);
    this.setItem(KEYS.POSTS, Array.from(this.posts.values()));
    this.emit('POSTS_CHANGE', { deletedId: postId });
  }

  public async toggleReaction(postId: string, reaction: PostReactionType): Promise<Post> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found.');

    const currentReaction = post.userReaction;

    if (currentReaction === reaction) {
      // Toggle off
      post.reactions[reaction] = Math.max(0, post.reactions[reaction] - 1);
      delete post.userReaction;
    } else {
      // Decrement prior reaction if exists
      if (currentReaction) {
        post.reactions[currentReaction] = Math.max(0, post.reactions[currentReaction] - 1);
      }
      post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
      post.userReaction = reaction;
    }

    this.posts.set(postId, post);
    this.setItem(KEYS.POSTS, Array.from(this.posts.values()));
    this.emit('POSTS_CHANGE', post);
    return this.enrichPost(post);
  }

  public async votePoll(pollId: string, optionId: string): Promise<Poll> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const post = Array.from(this.posts.values()).find((p) => p.poll && p.poll.id === pollId);
    if (!post || !post.poll) throw new Error('Poll not found.');

    const poll = post.poll;
    if (new Date(poll.closesAt).getTime() <= Date.now()) {
      poll.isClosed = true;
      throw new Error('This poll is closed for voting.');
    }

    const previousOptionId = poll.userVotedOptionId;
    if (previousOptionId === optionId) {
      return poll; // No change
    }

    // Switch or cast vote
    poll.options = poll.options.map((opt) => {
      if (opt.id === previousOptionId) {
        return { ...opt, voteCount: Math.max(0, opt.voteCount - 1) };
      }
      if (opt.id === optionId) {
        return { ...opt, voteCount: opt.voteCount + 1 };
      }
      return opt;
    });

    if (!previousOptionId) {
      poll.totalVotes += 1;
    }
    poll.userVotedOptionId = optionId;

    this.posts.set(post.id, post);
    this.setItem(KEYS.POSTS, Array.from(this.posts.values()));
    this.emit('POSTS_CHANGE', post);
    return poll;
  }

  public async toggleBookmark(postId: string): Promise<boolean> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const key = `${user.id}:${postId}`;
    const wasBookmarked = this.bookmarks.has(key);

    if (wasBookmarked) {
      this.bookmarks.delete(key);
    } else {
      this.bookmarks.add(key);
    }

    this.setItem(KEYS.BOOKMARKS, Array.from(this.bookmarks.values()));
    this.emit('POSTS_CHANGE', { postId, bookmarked: !wasBookmarked });
    return !wasBookmarked;
  }

  public async getBookmarkedPosts(): Promise<Post[]> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return [];

    const bookmarkedIds = new Set<string>();
    this.bookmarks.forEach((entry) => {
      const [uId, pId] = entry.split(':');
      if (uId === user.id) bookmarkedIds.add(pId);
    });

    return Array.from(this.posts.values())
      .filter((p) => bookmarkedIds.has(p.id))
      .map((p) => this.enrichPost(p));
  }

  // --------------------------------------------------------------------------
  // Comments
  // --------------------------------------------------------------------------
  public async getComments(postId: string): Promise<Comment[]> {
    await simulateDelay();
    const postComments = Array.from(this.comments.values()).filter((c) => c.postId === postId);
    postComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return postComments.map((c) => ({
      ...c,
      author: this.profiles.get(c.authorId),
    }));
  }

  public async addComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const trimmed = content.trim();
    if (!trimmed) throw new Error('Comment content cannot be empty.');
    if (trimmed.length > 1000) throw new Error('Comment cannot exceed 1000 characters.');

    const commentId = `cmt_${Date.now()}`;
    const newComment: Comment = {
      id: commentId,
      postId,
      authorId: user.id,
      content: trimmed,
      parentCommentId,
      createdAt: new Date().toISOString(),
    };

    this.comments.set(commentId, newComment);
    this.setItem(KEYS.COMMENTS, Array.from(this.comments.values()));

    // Notify post author if different
    const post = this.posts.get(postId);
    if (post && post.authorId !== user.id) {
      const notifId = `notif_${Date.now()}`;
      const notif: Notification = {
        id: notifId,
        recipientId: post.authorId,
        actorId: user.id,
        actor: this.profiles.get(user.id),
        type: 'comment',
        destinationUrl: `/posts/${postId}`,
        title: `${this.profiles.get(user.id)?.displayName || 'A student'} commented on your post`,
        body: trimmed.slice(0, 80),
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      this.notifications.set(notifId, notif);
      this.setItem(KEYS.NOTIFICATIONS, Array.from(this.notifications.values()));
      this.emit('NOTIFICATIONS_CHANGE', notif);
    }

    this.emit('COMMENTS_CHANGE', newComment);
    return {
      ...newComment,
      author: this.profiles.get(user.id),
    };
  }

  public async deleteComment(commentId: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const comment = this.comments.get(commentId);
    if (!comment) throw new Error('Comment not found.');

    const post = this.posts.get(comment.postId);
    const isPostOwner = post && post.authorId === user.id;
    if (comment.authorId !== user.id && !isPostOwner) {
      throw new Error('You do not have permission to delete this comment.');
    }

    this.comments.delete(commentId);
    this.setItem(KEYS.COMMENTS, Array.from(this.comments.values()));
    this.emit('COMMENTS_CHANGE', { deletedCommentId: commentId });
  }

  // --------------------------------------------------------------------------
  // Discovery & Social Relationships
  // --------------------------------------------------------------------------
  public async search(query: string, filter: SearchFilter = 'all'): Promise<SearchResults> {
    await simulateDelay();
    const q = query.trim().toLowerCase();
    const results: SearchResults = {
      people: [],
      clubs: [],
      events: [],
      posts: [],
      tags: [],
    };

    if (!q) {
      results.tags = this.application ? [] : SEED_TRENDING_TAGS;
      return results;
    }

    if (filter === 'all' || filter === 'people') {
      results.people = Array.from(this.profiles.values()).filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.handle.toLowerCase().includes(q) ||
          p.course.toLowerCase().includes(q) ||
          p.interests.some((i) => i.toLowerCase().includes(q))
      );
    }

    if (filter === 'all' || filter === 'clubs') {
      results.clubs = Array.from(this.clubs.values()).filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (filter === 'all' || filter === 'events') {
      results.events = Array.from(this.events.values()).filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    if (filter === 'all' || filter === 'posts') {
      results.posts = Array.from(this.posts.values())
        .filter((p) => p.content.toLowerCase().includes(q))
        .map((p) => this.enrichPost(p));
    }

    results.tags = this.application ? [] : SEED_TRENDING_TAGS.filter((t) => t.toLowerCase().includes(q));
    return results;
  }

  public async getProfileByHandle(handle: string): Promise<Profile | null> {
    await simulateDelay();
    const profile = Array.from(this.profiles.values()).find(
      (p) => p.handle.toLowerCase() === handle.toLowerCase()
    );
    return profile || null;
  }

  public async getFriendshipStatus(targetUserId: string): Promise<RelationshipState> {
    await simulateDelay();
    const currentUser = this.getCurrentUser();
    if (!currentUser) return 'none';
    if (currentUser.id === targetUserId) return 'self';

    if (this.blocks.has(`${currentUser.id}:${targetUserId}`)) return 'blocked';

    const friendship = Array.from(this.friendships.values()).find(
      (f) =>
        (f.requesterId === currentUser.id && f.addresseeId === targetUserId) ||
        (f.requesterId === targetUserId && f.addresseeId === currentUser.id)
    );

    if (!friendship) return 'none';
    if (friendship.status === 'accepted') return 'friends';
    if (friendship.status === 'pending') {
      return friendship.requesterId === currentUser.id ? 'pending_sent' : 'pending_received';
    }
    return 'none';
  }

  public async sendFriendRequest(targetUserId: string): Promise<Friendship> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');
    if (user.id === targetUserId) throw new Error('You cannot send a friend request to yourself.');

    const existingStatus = await this.getFriendshipStatus(targetUserId);
    if (existingStatus === 'friends') throw new Error('You are already mutual friends.');
    if (existingStatus === 'pending_sent') throw new Error('Friend request already sent.');

    // Crossed request auto-accepts
    const reverseRequest = Array.from(this.friendships.values()).find(
      (f) => f.requesterId === targetUserId && f.addresseeId === user.id && f.status === 'pending'
    );

    if (reverseRequest) {
      reverseRequest.status = 'accepted';
      reverseRequest.updatedAt = new Date().toISOString();
      this.friendships.set(reverseRequest.id, reverseRequest);
      this.setItem(KEYS.FRIENDSHIPS, Array.from(this.friendships.values()));
      this.emit('FRIENDS_CHANGE', reverseRequest);
      return reverseRequest;
    }

    const friendshipId = `fr_${Date.now()}`;
    const newFriendship: Friendship = {
      id: friendshipId,
      requesterId: user.id,
      addresseeId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.friendships.set(friendshipId, newFriendship);
    this.setItem(KEYS.FRIENDSHIPS, Array.from(this.friendships.values()));

    // Notify recipient
    const notifId = `notif_${Date.now()}`;
    const notif: Notification = {
      id: notifId,
      recipientId: targetUserId,
      actorId: user.id,
      actor: this.profiles.get(user.id),
      type: 'friend_request',
      destinationUrl: `/people/${this.profiles.get(user.id)?.handle || user.id}`,
      title: `${this.profiles.get(user.id)?.displayName || 'A student'} sent you a friend request`,
      body: this.profiles.get(user.id)?.bio?.slice(0, 80),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(notifId, notif);
    this.setItem(KEYS.NOTIFICATIONS, Array.from(this.notifications.values()));

    this.emit('FRIENDS_CHANGE', newFriendship);
    this.emit('NOTIFICATIONS_CHANGE', notif);
    return newFriendship;
  }

  public async respondFriendRequest(friendshipId: string, action: 'accept' | 'reject'): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const friendship = this.friendships.get(friendshipId);
    if (!friendship) throw new Error('Friend request not found.');
    if (friendship.addresseeId !== user.id) throw new Error('Unauthorized action.');

    if (action === 'accept') {
      friendship.status = 'accepted';
      friendship.updatedAt = new Date().toISOString();
      this.friendships.set(friendshipId, friendship);

      // Notify requester
      const notifId = `notif_${Date.now()}`;
      const notif: Notification = {
        id: notifId,
        recipientId: friendship.requesterId,
        actorId: user.id,
        actor: this.profiles.get(user.id),
        type: 'friend_accept',
        destinationUrl: `/people/${this.profiles.get(user.id)?.handle || user.id}`,
        title: `${this.profiles.get(user.id)?.displayName || 'A student'} accepted your friend request!`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      this.notifications.set(notifId, notif);
      this.setItem(KEYS.NOTIFICATIONS, Array.from(this.notifications.values()));
      this.emit('NOTIFICATIONS_CHANGE', notif);
    } else {
      this.friendships.delete(friendshipId);
    }

    this.setItem(KEYS.FRIENDSHIPS, Array.from(this.friendships.values()));
    this.emit('FRIENDS_CHANGE', { friendshipId, action });
  }

  public async removeFriend(friendUserId: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const friendship = Array.from(this.friendships.values()).find(
      (f) =>
        f.status === 'accepted' &&
        ((f.requesterId === user.id && f.addresseeId === friendUserId) ||
          (f.requesterId === friendUserId && f.addresseeId === user.id))
    );

    if (friendship) {
      this.friendships.delete(friendship.id);
      this.setItem(KEYS.FRIENDSHIPS, Array.from(this.friendships.values()));
      this.emit('FRIENDS_CHANGE', { removedUserId: friendUserId });
    }
  }

  public async blockUser(targetUserId: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');
    if (user.id === targetUserId) throw new Error('You cannot block yourself.');

    this.blocks.add(`${user.id}:${targetUserId}`);
    this.setItem(KEYS.BLOCKS, Array.from(this.blocks.values()));

    // Dissolve mutual friendship
    await this.removeFriend(targetUserId);

    this.emit('FRIENDS_CHANGE', { blockedUserId: targetUserId });
  }

  public async unblockUser(targetUserId: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    this.blocks.delete(`${user.id}:${targetUserId}`);
    this.setItem(KEYS.BLOCKS, Array.from(this.blocks.values()));
    this.emit('FRIENDS_CHANGE', { unblockedUserId: targetUserId });
  }

  public async getBlockedUsers(): Promise<Profile[]> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return [];

    const blockedProfiles: Profile[] = [];
    this.blocks.forEach((entry) => {
      const [blocker, blocked] = entry.split(':');
      if (blocker === user.id) {
        const p = this.profiles.get(blocked);
        if (p) blockedProfiles.push(p);
      }
    });
    return blockedProfiles;
  }

  // --------------------------------------------------------------------------
  // Messaging & Real-Time Chat
  // --------------------------------------------------------------------------
  public async getConversations(filter: 'all' | 'direct' | 'groups' = 'all'): Promise<Conversation[]> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return [];

    let list = Array.from(this.conversations.values()).filter((conv) =>
      conv.members.some((m) => m.userId === user.id && m.status === 'accepted')
    );

    if (filter === 'direct') list = list.filter((c) => c.type === 'direct');
    if (filter === 'groups') list = list.filter((c) => c.type === 'group');

    // Enrich direct chats with other participant profile
    list = list.map((conv) => {
      if (conv.type === 'direct') {
        const otherMember = conv.members.find((m) => m.userId !== user.id);
        const otherProfile = otherMember ? this.profiles.get(otherMember.userId) : undefined;
        return { ...conv, otherParticipant: otherProfile };
      }
      return conv;
    });

    list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return list;
  }

  public async getConversationById(id: string): Promise<Conversation | null> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return null;

    const conv = this.conversations.get(id);
    if (!conv) return null;

    if (!conv.members.some((m) => m.userId === user.id)) {
      throw new Error('You do not have access to this conversation.');
    }

    if (conv.type === 'direct') {
      const otherMember = conv.members.find((m) => m.userId !== user.id);
      return {
        ...conv,
        otherParticipant: otherMember ? this.profiles.get(otherMember.userId) : undefined,
      };
    }
    return conv;
  }

  public async getMessages(conversationId: string): Promise<Message[]> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return [];

    const msgs = Array.from(this.messages.values()).filter(
      (m) => m.conversationId === conversationId
    );
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return msgs.map((m) => ({
      ...m,
      sender: this.profiles.get(m.senderId),
    }));
  }

  public async sendMessage(input: SendMessageInput): Promise<Message> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const conv = this.conversations.get(input.conversationId);
    if (!conv) throw new Error('Conversation not found.');

    const messageId = input.clientMessageId || `msg_${Date.now()}`;
    const newMessage: Message = {
      id: messageId,
      conversationId: input.conversationId,
      senderId: user.id,
      content: input.content,
      attachmentKind: input.attachmentKind,
      mediaUrl: input.mediaUrl,
      creationId: input.creationId,
      giphyId: input.giphyId,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      reactions: [],
    };

    this.messages.set(messageId, newMessage);

    // Update conversation snippet
    conv.lastMessageAt = newMessage.createdAt;
    conv.lastMessagePreview = newMessage.content || `[${newMessage.attachmentKind || 'Attachment'}]`;
    this.conversations.set(conv.id, conv);

    this.setItem(KEYS.MESSAGES, Array.from(this.messages.values()));
    this.setItem(KEYS.CONVERSATIONS, Array.from(this.conversations.values()));
    this.emit('MESSAGES_CHANGE', newMessage);

    // Simulated Interactive Bot Response
    this.scheduleSimulatedPeerReply(conv, user.id);

    return {
      ...newMessage,
      sender: this.profiles.get(user.id),
    };
  }

  private scheduleSimulatedPeerReply(conversation: Conversation, currentUserId: string): void {
    if (this.application || conversation.type !== 'direct') return;
    const otherMember = conversation.members.find((m) => m.userId !== currentUserId);
    if (!otherMember) return;

    // Simulate reply from seed friends (Priya or Rahul)
    if (otherMember.userId === 'usr_priya_k' || otherMember.userId === 'usr_rahul_v') {
      setTimeout(() => {
        const replyResponses = [
          'Haha absolutely! See you at Central Block auditorium.',
          'Got it! Let me review this after my 2:00 PM lecture.',
          'That meme is pure Lavasa accuracy 😂',
          'Let’s catch up over chai near the gazebo.',
        ];
        const randomReply = replyResponses[Math.floor(Math.random() * replyResponses.length)];
        const replyMsgId = `msg_sim_${Date.now()}`;
        const replyMsg: Message = {
          id: replyMsgId,
          conversationId: conversation.id,
          senderId: otherMember.userId,
          content: randomReply,
          createdAt: new Date().toISOString(),
          isDeleted: false,
          reactions: [],
        };

        this.messages.set(replyMsgId, replyMsg);
        conversation.lastMessageAt = replyMsg.createdAt;
        conversation.lastMessagePreview = randomReply;
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        this.conversations.set(conversation.id, conversation);

        this.setItem(KEYS.MESSAGES, Array.from(this.messages.values()));
        this.setItem(KEYS.CONVERSATIONS, Array.from(this.conversations.values()));
        this.emit('MESSAGES_CHANGE', replyMsg);
      }, 1500);
    }
  }

  public async markConversationRead(conversationId: string): Promise<void> {
    await simulateDelay();
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.unreadCount = 0;
      this.conversations.set(conversationId, conv);
      this.setItem(KEYS.CONVERSATIONS, Array.from(this.conversations.values()));
      this.emit('MESSAGES_CHANGE', { conversationId, read: true });
    }
  }

  public async createGroup(title: string, memberIds: string[]): Promise<Conversation> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    if (memberIds.length > 30) {
      throw new Error('Group chat capacity is limited to 30 members.');
    }

    const convId = `conv_grp_${Date.now()}`;
    const allMembers = Array.from(new Set([user.id, ...memberIds])).map((mId) => ({
      conversationId: convId,
      userId: mId,
      role: (mId === user.id ? 'admin' : 'member') as 'admin' | 'member',
      status: 'accepted' as const,
      lastReadAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    }));

    const newGroup: Conversation = {
      id: convId,
      type: 'group',
      title: title.trim() || 'New Campus Group',
      creatorId: user.id,
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: 'Group created',
      unreadCount: 0,
      members: allMembers,
    };

    this.conversations.set(convId, newGroup);
    this.setItem(KEYS.CONVERSATIONS, Array.from(this.conversations.values()));
    this.emit('MESSAGES_CHANGE', newGroup);
    return newGroup;
  }

  public async deleteMessage(messageId: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const msg = this.messages.get(messageId);
    if (!msg) throw new Error('Message not found.');
    if (msg.senderId !== user.id) throw new Error('You can only delete your own messages.');

    msg.isDeleted = true;
    msg.content = 'This message was deleted';
    delete msg.attachmentKind;
    delete msg.mediaUrl;

    this.messages.set(messageId, msg);
    this.setItem(KEYS.MESSAGES, Array.from(this.messages.values()));
    this.emit('MESSAGES_CHANGE', msg);
  }

  // --------------------------------------------------------------------------
  // Clubs & Events
  // --------------------------------------------------------------------------
  public async getClubs(category?: string): Promise<Club[]> {
    await simulateDelay();
    const currentUser = this.getCurrentUser();
    let clubList = Array.from(this.clubs.values());

    if (category && category !== 'All') {
      clubList = clubList.filter((c) => c.category === category);
    }

    return clubList.map((c) => {
      const isJoined = currentUser
        ? this.clubMemberships.has(`${c.id}:${currentUser.id}`)
        : false;
      const membership = currentUser
        ? this.clubMemberships.get(`${c.id}:${currentUser.id}`)
        : undefined;
      return {
        ...c,
        owner: this.profiles.get(c.ownerId),
        isJoined,
        userRole: membership?.role,
      };
    });
  }

  public async getClubBySlug(slug: string): Promise<Club | null> {
    await simulateDelay();
    const currentUser = this.getCurrentUser();
    const club = Array.from(this.clubs.values()).find((c) => c.slug === slug);
    if (!club) return null;

    const isJoined = currentUser
      ? this.clubMemberships.has(`${club.id}:${currentUser.id}`)
      : false;
    const membership = currentUser
      ? this.clubMemberships.get(`${club.id}:${currentUser.id}`)
      : undefined;

    return {
      ...club,
      owner: this.profiles.get(club.ownerId),
      isJoined,
      userRole: membership?.role,
    };
  }

  public async createClub(input: {
    name: string;
    slug: string;
    description: string;
    category: string;
    coverImageUrl?: string;
  }): Promise<Club> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const slug = input.slug.toLowerCase().trim();
    if (Array.from(this.clubs.values()).some((c) => c.slug === slug)) {
      throw new Error('A club with this slug already exists.');
    }

    const clubId = `club_${Date.now()}`;
    const newClub: Club = {
      id: clubId,
      campusId: SEED_CAMPUS.id,
      name: input.name,
      slug,
      description: input.description,
      category: input.category,
      coverImageUrl: input.coverImageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      ownerId: user.id,
      memberCount: 1,
      isJoined: true,
      userRole: 'owner',
      createdAt: new Date().toISOString(),
    };

    const ownerMembership: ClubMembership = {
      clubId,
      userId: user.id,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    };

    this.clubs.set(clubId, newClub);
    this.clubMemberships.set(`${clubId}:${user.id}`, ownerMembership);

    this.setItem(KEYS.CLUBS, Array.from(this.clubs.values()));
    this.setItem(KEYS.CLUB_MEMBERSHIPS, Array.from(this.clubMemberships.values()));
    this.emit('CLUBS_CHANGE', newClub);
    return newClub;
  }

  public async toggleClubMembership(clubId: string): Promise<ClubMembership | null> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const club = this.clubs.get(clubId);
    if (!club) throw new Error('Club not found.');

    const key = `${clubId}:${user.id}`;
    const existing = this.clubMemberships.get(key);

    if (existing) {
      this.clubMemberships.delete(key);
      club.memberCount = Math.max(0, club.memberCount - 1);
      this.clubs.set(clubId, club);
      this.setItem(KEYS.CLUBS, Array.from(this.clubs.values()));
      this.setItem(KEYS.CLUB_MEMBERSHIPS, Array.from(this.clubMemberships.values()));
      this.emit('CLUBS_CHANGE', { clubId, joined: false });
      return null;
    } else {
      const membership: ClubMembership = {
        clubId,
        userId: user.id,
        role: 'member',
        joinedAt: new Date().toISOString(),
      };
      this.clubMemberships.set(key, membership);
      club.memberCount += 1;
      this.clubs.set(clubId, club);
      this.setItem(KEYS.CLUBS, Array.from(this.clubs.values()));
      this.setItem(KEYS.CLUB_MEMBERSHIPS, Array.from(this.clubMemberships.values()));
      this.emit('CLUBS_CHANGE', { clubId, joined: true });
      return membership;
    }
  }

  public async getEvents(filter: 'all' | 'weekend' | 'rsvps' = 'all'): Promise<CampusEvent[]> {
    await simulateDelay();
    const user = this.getCurrentUser();
    let eventList = Array.from(this.events.values());

    if (filter === 'rsvps' && user) {
      const rsvpEventIds = new Set<string>();
      this.eventRsvps.forEach((r) => {
        if (r.userId === user.id) rsvpEventIds.add(r.eventId);
      });
      eventList = eventList.filter((e) => rsvpEventIds.has(e.id));
    }

    return eventList.map((e) => {
      const userRsvp = user ? this.eventRsvps.get(`${e.id}:${user.id}`)?.status : undefined;
      return {
        ...e,
        club: e.clubId ? this.clubs.get(e.clubId) : undefined,
        creator: this.profiles.get(e.creatorId),
        userRsvp,
      };
    });
  }

  public async getEventById(eventId: string): Promise<CampusEvent | null> {
    await simulateDelay();
    const user = this.getCurrentUser();
    const event = this.events.get(eventId);
    if (!event) return null;

    const userRsvp = user ? this.eventRsvps.get(`${event.id}:${user.id}`)?.status : undefined;
    return {
      ...event,
      club: event.clubId ? this.clubs.get(event.clubId) : undefined,
      creator: this.profiles.get(event.creatorId),
      userRsvp,
    };
  }

  public async toggleEventRsvp(eventId: string, status: RsvpStatus): Promise<EventRsvp | null> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const event = this.events.get(eventId);
    if (!event) throw new Error('Event not found.');

    const key = `${eventId}:${user.id}`;
    const existing = this.eventRsvps.get(key);

    if (existing && existing.status === status) {
      // Cancel RSVP
      this.eventRsvps.delete(key);
      event.rsvpsCount[status] = Math.max(0, event.rsvpsCount[status] - 1);
      this.events.set(eventId, event);
      this.setItem(KEYS.EVENTS, Array.from(this.events.values()));
      this.setItem(KEYS.EVENT_RSVPS, Array.from(this.eventRsvps.values()));
      this.emit('EVENTS_CHANGE', { eventId, status: null });
      return null;
    } else {
      if (existing) {
        event.rsvpsCount[existing.status] = Math.max(0, event.rsvpsCount[existing.status] - 1);
      }
      const newRsvp: EventRsvp = {
        eventId,
        userId: user.id,
        status,
        createdAt: new Date().toISOString(),
      };
      this.eventRsvps.set(key, newRsvp);
      event.rsvpsCount[status] = (event.rsvpsCount[status] || 0) + 1;
      this.events.set(eventId, event);
      this.setItem(KEYS.EVENTS, Array.from(this.events.values()));
      this.setItem(KEYS.EVENT_RSVPS, Array.from(this.eventRsvps.values()));
      this.emit('EVENTS_CHANGE', { eventId, status });
      return newRsvp;
    }
  }

  // --------------------------------------------------------------------------
  // Meme & Sticker Studio
  // --------------------------------------------------------------------------
  public async getCreations(userId?: string): Promise<Creation[]> {
    await simulateDelay();
    const targetUserId = userId || this.getCurrentUser()?.id;
    if (!targetUserId) return [];

    return Array.from(this.creations.values())
      .filter((c) => c.creatorId === targetUserId)
      .map((c) => ({ ...c, creator: this.profiles.get(c.creatorId) }));
  }

  public async getCreationById(id: string): Promise<Creation | null> {
    await simulateDelay();
    const creation = this.creations.get(id);
    if (!creation) return null;
    return { ...creation, creator: this.profiles.get(creation.creatorId) };
  }

  public async saveCreation(input: SaveCreationInput, creationId?: string): Promise<Creation> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    if (input.draftData.layers.length > 20) {
      throw new Error('Canvas cannot exceed 20 layers.');
    }

    const id = creationId || `cr_${Date.now()}`;
    const existing = this.creations.get(id);

    const saved: Creation = {
      id,
      creatorId: user.id,
      kind: input.kind,
      title: input.title.trim() || 'Untitled Creation',
      draftData: input.draftData,
      renderedImageUrl:
        input.renderedImageUrl ||
        existing?.renderedImageUrl ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=512',
      isPublished: input.isPublished ?? existing?.isPublished ?? false,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.creations.set(id, saved);
    this.setItem(KEYS.CREATIONS, Array.from(this.creations.values()));
    this.emit('CREATIONS_CHANGE', saved);
    return { ...saved, creator: this.profiles.get(user.id) };
  }

  public async deleteCreation(id: string): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const creation = this.creations.get(id);
    if (!creation) throw new Error('Creation not found.');
    if (creation.creatorId !== user.id) throw new Error('Permission denied.');

    this.creations.delete(id);
    this.setItem(KEYS.CREATIONS, Array.from(this.creations.values()));
    this.emit('CREATIONS_CHANGE', { deletedCreationId: id });
  }

  public async getStickerPacks(): Promise<StickerPack[]> {
    await simulateDelay();
    return Array.from(this.stickerPacks.values()).map((sp) => ({
      ...sp,
      creator: this.profiles.get(sp.creatorId),
    }));
  }

  public async getStickerPackById(id: string): Promise<StickerPack | null> {
    await simulateDelay();
    const pack = this.stickerPacks.get(id);
    if (!pack) return null;
    return { ...pack, creator: this.profiles.get(pack.creatorId) };
  }

  public async createStickerPack(
    title: string,
    stickerIds: string[],
    coverCreationId?: string
  ): Promise<StickerPack> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    if (stickerIds.length === 0 || stickerIds.length > 30) {
      throw new Error('A sticker pack must contain between 1 and 30 stickers.');
    }

    const packId = `pack_${Date.now()}`;
    const selectedStickers = stickerIds
      .map((id) => this.creations.get(id))
      .filter((c): c is Creation => !!c);

    const newPack: StickerPack = {
      id: packId,
      creatorId: user.id,
      title: title.trim() || 'New Sticker Pack',
      coverCreationId: coverCreationId || stickerIds[0],
      coverImageUrl: selectedStickers[0]?.renderedImageUrl,
      stickers: selectedStickers,
      isPublished: true,
      isSaved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.stickerPacks.set(packId, newPack);
    this.setItem(KEYS.STICKER_PACKS, Array.from(this.stickerPacks.values()));
    this.emit('CREATIONS_CHANGE', newPack);
    return { ...newPack, creator: this.profiles.get(user.id) };
  }

  public async toggleSaveStickerPack(packId: string): Promise<boolean> {
    await simulateDelay();
    const pack = this.stickerPacks.get(packId);
    if (!pack) throw new Error('Sticker pack not found.');

    pack.isSaved = !pack.isSaved;
    this.stickerPacks.set(packId, pack);
    this.setItem(KEYS.STICKER_PACKS, Array.from(this.stickerPacks.values()));
    this.emit('CREATIONS_CHANGE', pack);
    return !!pack.isSaved;
  }

  // --------------------------------------------------------------------------
  // Notifications & Moderation
  // --------------------------------------------------------------------------
  public async getNotifications(): Promise<Notification[]> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return [];

    const notifs = Array.from(this.notifications.values()).filter(
      (n) => n.recipientId === user.id
    );
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return notifs.map((n) => ({
      ...n,
      actor: n.actorId ? this.profiles.get(n.actorId) : undefined,
    }));
  }

  public async markNotificationRead(id: string): Promise<void> {
    await simulateDelay();
    const notif = this.notifications.get(id);
    if (notif) {
      notif.isRead = true;
      this.notifications.set(id, notif);
      this.setItem(KEYS.NOTIFICATIONS, Array.from(this.notifications.values()));
      this.emit('NOTIFICATIONS_CHANGE', notif);
    }
  }

  public async markAllNotificationsRead(): Promise<void> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) return;

    this.notifications.forEach((n) => {
      if (n.recipientId === user.id) n.isRead = true;
    });

    this.setItem(KEYS.NOTIFICATIONS, Array.from(this.notifications.values()));
    this.emit('NOTIFICATIONS_CHANGE', { allRead: true });
  }

  public async submitReport(input: {
    targetType: ReportTargetType;
    targetId: string;
    category: ReportCategory;
    notes?: string;
  }): Promise<Report> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const reportId = `rep_${Date.now()}`;
    const newReport: Report = {
      id: reportId,
      reporterId: user.id,
      targetType: input.targetType,
      targetId: input.targetId,
      category: input.category,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    this.reports.set(reportId, newReport);
    this.setItem(KEYS.REPORTS, Array.from(this.reports.values()));
    return newReport;
  }

  public async exportPersonalData(): Promise<Record<string, any>> {
    await simulateDelay();
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const profile = this.profiles.get(user.id);
    const settings = this.settings.get(user.id);
    const userPosts = Array.from(this.posts.values()).filter((p) => p.authorId === user.id);
    const userCreations = Array.from(this.creations.values()).filter((c) => c.creatorId === user.id);

    return {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, regNumber: user.normalizedRegNumber, role: user.role },
      profile,
      settings,
      posts: userPosts,
      creations: userCreations,
    };
  }
}

// Global Singleton Export
export const mockStore = MockStore.createApplicationStore();
