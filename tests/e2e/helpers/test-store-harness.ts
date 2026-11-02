/**
 * Campus Connect - E2E Test Store Harness
 *
 * Implements the authoritative IMockStore interface and provides
 * self-contained, isolated in-memory test instances initialized with
 * authentic Christ University Lavasa fixtures.
 */

export type CampusRole = 'student' | 'moderator' | 'campus_admin';
export type MembershipStatus = 'active' | 'suspended' | 'banned';
export type RecoveryEmailStatus = 'not_added' | 'awaiting_verification' | 'verified';

export interface UserAccount {
  id: string;
  normalizedRegNumber: string;
  passwordHash: string;
  recoveryEmail?: string;
  recoveryEmailVerified: boolean;
  recoveryEmailStatus: RecoveryEmailStatus;
  role: CampusRole;
  status: MembershipStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  course: string;
  yearOfStudy: number;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  reduceMotion: boolean;
  readReceiptsEnabled: boolean;
  notifyOnComments: boolean;
  notifyOnReactions: boolean;
  notifyOnFriendRequests: boolean;
  notifyOnEventUpdates: boolean;
  updatedAt: string;
}

export interface Session {
  user: UserAccount;
  profile: Profile;
  token: string;
  expiresAt: string;
}

export interface SignupInput {
  regNumber: string;
  password: string;
  confirmPassword?: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
}

export interface LoginInput {
  regNumber: string;
  password: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export type RelationshipState =
  | 'self'
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

export type PostReactionType = 'like' | 'love' | 'laugh' | 'fire' | 'clap';
export type AttachmentKind = 'image' | 'custom_sticker' | 'giphy';

export interface PostAttachment {
  id: string;
  postId: string;
  kind: AttachmentKind;
  mediaUrl?: string;
  creationId?: string;
  giphyId?: string;
  giphyKind?: 'gif' | 'sticker';
  displayOrder: number;
}

export interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
  displayOrder: number;
  voteCount: number;
}

export interface Poll {
  id: string;
  postId: string;
  question: string;
  closesAt: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  isClosed: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: Profile;
  content: string;
  parentCommentId?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author?: Profile;
  campusId: string;
  clubId?: string;
  club?: Club;
  content: string;
  isPinned: boolean;
  attachments: PostAttachment[];
  poll?: Poll;
  reactions: Record<PostReactionType, number>;
  userReaction?: PostReactionType;
  commentsCount: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  content: string;
  clubId?: string;
  attachments?: Array<{
    kind: AttachmentKind;
    mediaUrl?: string;
    creationId?: string;
    giphyId?: string;
    giphyKind?: 'gif' | 'sticker';
  }>;
  poll?: {
    question: string;
    options: string[];
    closesAt?: string;
  };
}

export type ClubRole = 'member' | 'organizer' | 'owner';

export interface Club {
  id: string;
  campusId: string;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  category: string;
  ownerId: string;
  owner?: Profile;
  memberCount: number;
  isJoined?: boolean;
  userRole?: ClubRole;
  createdAt: string;
}

export interface ClubMembership {
  clubId: string;
  userId: string;
  role: ClubRole;
  joinedAt: string;
}

export type RsvpStatus = 'going' | 'interested';

export interface CampusEvent {
  id: string;
  campusId: string;
  clubId?: string;
  club?: Club;
  creatorId: string;
  creator?: Profile;
  title: string;
  description: string;
  coverImageUrl: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  isCancelled: boolean;
  rsvpsCount: {
    going: number;
    interested: number;
  };
  userRsvp?: RsvpStatus;
  createdAt: string;
}

export interface EventRsvp {
  eventId: string;
  userId: string;
  status: RsvpStatus;
  createdAt: string;
}

export type ConversationType = 'direct' | 'group';

export interface MessageReaction {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: Profile;
  content?: string;
  attachmentKind?: AttachmentKind;
  mediaUrl?: string;
  creationId?: string;
  giphyId?: string;
  createdAt: string;
  isDeleted: boolean;
  reactions: MessageReaction[];
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  role: 'member' | 'admin';
  status: 'pending' | 'accepted' | 'left' | 'removed';
  lastReadAt: string;
  joinedAt: string;
  profile?: Profile;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  creatorId: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  members: ConversationMember[];
  otherParticipant?: Profile;
}

export interface SendMessageInput {
  conversationId: string;
  content?: string;
  attachmentKind?: AttachmentKind;
  mediaUrl?: string;
  creationId?: string;
  giphyId?: string;
}

export type CreationKind = 'meme' | 'sticker';

export interface CanvasLayer {
  id: string;
  type: 'text' | 'image' | 'sticker' | 'shape' | 'polygon';
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  points?: number[];
  locked?: boolean;
}

export interface CreationDraftData {
  version: number;
  mode: 'meme' | 'sticker';
  aspectRatio: string;
  layers: CanvasLayer[];
}

export interface Creation {
  id: string;
  creatorId: string;
  creator?: Profile;
  kind: CreationKind;
  title: string;
  draftData: CreationDraftData;
  renderedImageUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StickerPack {
  id: string;
  creatorId: string;
  creator?: Profile;
  title: string;
  coverCreationId?: string;
  coverImageUrl?: string;
  stickers: Creation[];
  isPublished: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCreationInput {
  kind: CreationKind;
  title: string;
  draftData: CreationDraftData;
  renderedImageUrl?: string;
  isPublished?: boolean;
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accept'
  | 'comment'
  | 'reaction'
  | 'group_invite'
  | 'message'
  | 'event_update'
  | 'moderation';

export interface Notification {
  id: string;
  recipientId: string;
  actorId?: string;
  actor?: Profile;
  type: NotificationType;
  destinationUrl: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export type SearchFilter = 'all' | 'people' | 'clubs' | 'events' | 'posts' | 'tags';

export interface SearchResults {
  people: Profile[];
  clubs: Club[];
  events: CampusEvent[];
  posts: Post[];
  tags: string[];
}

export type ReportCategory =
  | 'harassment'
  | 'impersonation'
  | 'sexual_content'
  | 'hate'
  | 'spam'
  | 'copyright'
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  category: ReportCategory;
  notes?: string;
  createdAt: string;
}

/**
 * Normalizes student registration number:
 * 1. Trims leading/trailing whitespace
 * 2. Converts to uppercase
 * 3. Enforces regex ^[A-Za-z0-9-]{4,32}$
 */
export function normalizeRegNumber(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,32}$/.test(trimmed)) {
    throw new Error('Invalid registration number format. Must be 4-32 alphanumeric or hyphen characters.');
  }
  return trimmed;
}

/**
 * TestStoreHarness: Isolated in-memory store instance with Christ University Lavasa fixtures.
 */
export class TestStoreHarness {
  private users: Map<string, UserAccount> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private settings: Map<string, AccountSettings> = new Map();
  private currentSession: Session | null = null;
  private friendships: Map<string, Friendship> = new Map();
  private blocks: Set<string> = new Set(); // "blockerId:blockedId"
  private posts: Map<string, Post> = new Map();
  private comments: Map<string, Comment> = new Map();
  private userReactions: Map<string, PostReactionType> = new Map(); // "userId:postId"
  private pollVotes: Map<string, string> = new Map(); // "userId:pollId" -> optionId
  private bookmarks: Set<string> = new Set(); // "userId:postId"
  private clubs: Map<string, Club> = new Map();
  private clubMemberships: Map<string, ClubMembership> = new Map(); // "clubId:userId"
  private events: Map<string, CampusEvent> = new Map();
  private eventRsvps: Map<string, EventRsvp> = new Map(); // "eventId:userId"
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private creations: Map<string, Creation> = new Map();
  private stickerPacks: Map<string, StickerPack> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private reports: Map<string, Report> = new Map();

  constructor() {
    this.resetToDefaultSeeds();
  }

  public resetToDefaultSeeds(): void {
    this.users.clear();
    this.profiles.clear();
    this.settings.clear();
    this.friendships.clear();
    this.blocks.clear();
    this.posts.clear();
    this.comments.clear();
    this.userReactions.clear();
    this.pollVotes.clear();
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
    this.currentSession = null;

    // Seed 1: Priya Sharma (BCA 2nd Year)
    const priyaId = 'user_priya_01';
    this.users.set(priyaId, {
      id: priyaId,
      normalizedRegNumber: '23BCA015',
      passwordHash: 'hashed_password_123',
      recoveryEmail: 'priya.sharma@lavasa.christuniversity.in',
      recoveryEmailVerified: true,
      recoveryEmailStatus: 'verified',
      role: 'student',
      status: 'active',
      createdAt: '2026-08-01T10:00:00Z',
    });
    this.profiles.set(priyaId, {
      id: priyaId,
      handle: 'priya_s',
      displayName: 'Priya Sharma',
      avatarUrl: '/avatars/priya.png',
      bio: 'BCA 2nd Year | Web Dev & Open Source | Central Block Enthusiast',
      course: 'BCA',
      yearOfStudy: 2,
      interests: ['Web Development', 'Design', 'Hackathons'],
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    });
    this.settings.set(priyaId, {
      userId: priyaId,
      theme: 'light',
      reduceMotion: false,
      readReceiptsEnabled: true,
      notifyOnComments: true,
      notifyOnReactions: true,
      notifyOnFriendRequests: true,
      notifyOnEventUpdates: true,
      updatedAt: '2026-08-01T10:00:00Z',
    });

    // Seed 2: Rahul Verma (BBA 3rd Year)
    const rahulId = 'user_rahul_02';
    this.users.set(rahulId, {
      id: rahulId,
      normalizedRegNumber: '23BBA088',
      passwordHash: 'hashed_password_456',
      recoveryEmail: 'rahul.verma@lavasa.christuniversity.in',
      recoveryEmailVerified: true,
      recoveryEmailStatus: 'verified',
      role: 'student',
      status: 'active',
      createdAt: '2026-08-01T10:00:00Z',
    });
    this.profiles.set(rahulId, {
      id: rahulId,
      handle: 'rahul_v',
      displayName: 'Rahul Verma',
      avatarUrl: '/avatars/rahul.png',
      bio: 'BBA 3rd Year | President, Management Circle | Football team',
      course: 'BBA',
      yearOfStudy: 3,
      interests: ['Finance', 'Marketing', 'Football'],
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    });

    // Seed 3: Aarav Mehta (BSc Data Science 1st Year)
    const aaravId = 'user_aarav_03';
    this.users.set(aaravId, {
      id: aaravId,
      normalizedRegNumber: '24BDS042',
      passwordHash: 'hashed_password_789',
      recoveryEmail: undefined,
      recoveryEmailVerified: false,
      recoveryEmailStatus: 'not_added',
      role: 'student',
      status: 'active',
      createdAt: '2026-09-01T10:00:00Z',
    });
    this.profiles.set(aaravId, {
      id: aaravId,
      handle: 'aarav_m',
      displayName: 'Aarav Mehta',
      avatarUrl: '/avatars/aarav.png',
      bio: "BSc Data Science '28 | Code & Coffee ☕",
      course: 'BSc Data Science',
      yearOfStudy: 1,
      interests: ['Python', 'Data Science', 'Basketball'],
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    });

    // Seed 4: Ananya Patel (MBA 2nd Year - Cultural Guild President)
    const ananyaId = 'user_ananya_04';
    this.users.set(ananyaId, {
      id: ananyaId,
      normalizedRegNumber: '23MBA004',
      passwordHash: 'hashed_password_004',
      recoveryEmail: 'ananya.patel@lavasa.christuniversity.in',
      recoveryEmailVerified: true,
      recoveryEmailStatus: 'verified',
      role: 'student',
      status: 'active',
      createdAt: '2026-08-01T10:00:00Z',
    });
    this.profiles.set(ananyaId, {
      id: ananyaId,
      handle: 'ananya_p',
      displayName: 'Ananya Patel',
      avatarUrl: '/avatars/ananya.png',
      bio: 'MBA | President, Christ Lavasa Cultural Guild | Theatre & Music',
      course: 'MBA',
      yearOfStudy: 2,
      interests: ['Cultural', 'Music', 'Theatre'],
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    });

    // Seed Club: Lavasa Coding Community
    const codingClubId = 'club_coding_01';
    this.clubs.set(codingClubId, {
      id: codingClubId,
      campusId: 'christ_lavasa',
      name: 'Lavasa Coding Community',
      slug: 'lavasa-coding-community',
      description: 'The official tech and programming society of Christ University Lavasa.',
      coverImageUrl: '/banners/coding-club.png',
      category: 'Tech',
      ownerId: priyaId,
      memberCount: 42,
      isJoined: false,
      createdAt: '2026-08-05T10:00:00Z',
    });

    // Seed Club: Cultural Guild
    const culturalClubId = 'club_cultural_02';
    this.clubs.set(culturalClubId, {
      id: culturalClubId,
      campusId: 'christ_lavasa',
      name: 'Christ Lavasa Cultural Guild',
      slug: 'cultural-guild',
      description: 'Celebrating arts, theatre, and music across Christ University Lavasa.',
      coverImageUrl: '/banners/cultural-guild.png',
      category: 'Arts',
      ownerId: ananyaId,
      memberCount: 65,
      isJoined: false,
      createdAt: '2026-08-05T10:00:00Z',
    });

    // Seed Event: Lavasa AI & Web3 Hackathon 2026
    const hackathonId = 'event_hackathon_01';
    this.events.set(hackathonId, {
      id: hackathonId,
      campusId: 'christ_lavasa',
      clubId: codingClubId,
      creatorId: priyaId,
      title: 'Lavasa AI & Web3 Hackathon 2026',
      description: '36-hour annual hackathon bringing students together to build generative AI solutions.',
      coverImageUrl: '/banners/hackathon.png',
      startsAt: '2026-11-15T09:00:00Z',
      endsAt: '2026-11-16T21:00:00Z',
      venue: 'Central Block Amphitheatre',
      isCancelled: false,
      rsvpsCount: {
        going: 28,
        interested: 45,
      },
      createdAt: '2026-09-01T10:00:00Z',
    });

    // Seed Post: Welcome Announcement
    const post1Id = 'post_welcome_01';
    this.posts.set(post1Id, {
      id: post1Id,
      authorId: priyaId,
      author: this.profiles.get(priyaId),
      campusId: 'christ_lavasa',
      content: 'Welcome all new students to Christ University Lavasa! Remember to check Central Block cafeteria for the semester lunch passes.',
      isPinned: true,
      attachments: [],
      reactions: { like: 12, love: 18, laugh: 2, fire: 5, clap: 7 },
      commentsCount: 2,
      isBookmarked: false,
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-01T08:00:00Z',
    });

    // Comments on Welcome Announcement
    this.comments.set('comment_01', {
      id: 'comment_01',
      postId: post1Id,
      authorId: rahulId,
      author: this.profiles.get(rahulId),
      content: 'Great reminder! The pass desk is open until 4 PM.',
      createdAt: '2026-09-01T08:30:00Z',
    });
    this.comments.set('comment_02', {
      id: 'comment_02',
      postId: post1Id,
      authorId: aaravId,
      author: this.profiles.get(aaravId),
      content: 'Thanks for the info!',
      createdAt: '2026-09-01T08:45:00Z',
    });

    // Default session: Start with Priya logged in
    this.currentSession = {
      user: this.users.get(priyaId)!,
      profile: this.profiles.get(priyaId)!,
      token: 'mock_jwt_token_priya',
      expiresAt: '2026-12-31T23:59:59Z',
    };
  }

  // Session & Auth
  public getCurrentUser(): UserAccount | null {
    return this.currentSession ? this.currentSession.user : null;
  }

  public getCurrentProfile(): Profile | null {
    return this.currentSession ? this.currentSession.profile : null;
  }

  public getSession(): Session | null {
    return this.currentSession;
  }

  public setSession(user: UserAccount, profile: Profile): Session {
    this.currentSession = {
      user,
      profile,
      token: `token_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
    return this.currentSession;
  }

  public async signup(input: SignupInput): Promise<Session> {
    const normalized = normalizeRegNumber(input.regNumber);
    if (!input.ageConfirmed) throw new Error('Must confirm age of at least 16.');
    if (!input.termsAccepted) throw new Error('Must accept terms of service.');
    if (!input.password || input.password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (input.confirmPassword && input.password !== input.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    // Check duplicate
    for (const u of this.users.values()) {
      if (u.normalizedRegNumber === normalized) {
        throw new Error('An account with this registration number already exists.');
      }
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user: UserAccount = {
      id: userId,
      normalizedRegNumber: normalized,
      passwordHash: `hash_${input.password}`,
      recoveryEmailVerified: false,
      recoveryEmailStatus: 'not_added',
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const profile: Profile = {
      id: userId,
      handle: `student_${normalized.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      displayName: `Student ${normalized}`,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${normalized}`,
      bio: '',
      course: 'Undecided',
      yearOfStudy: 1,
      interests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const settings: AccountSettings = {
      userId,
      theme: 'light',
      reduceMotion: false,
      readReceiptsEnabled: false,
      notifyOnComments: true,
      notifyOnReactions: true,
      notifyOnFriendRequests: true,
      notifyOnEventUpdates: true,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(userId, user);
    this.profiles.set(userId, profile);
    this.settings.set(userId, settings);

    return this.setSession(user, profile);
  }

  public async login(input: LoginInput): Promise<Session> {
    const normalized = normalizeRegNumber(input.regNumber);
    let foundUser: UserAccount | null = null;
    for (const u of this.users.values()) {
      if (u.normalizedRegNumber === normalized) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid registration number or password.');
    }

    if (foundUser.passwordHash !== `hash_${input.password}` && foundUser.passwordHash !== 'hashed_password_123' && foundUser.passwordHash !== 'hashed_password_456' && foundUser.passwordHash !== 'hashed_password_789' && foundUser.passwordHash !== 'hashed_password_004') {
      throw new Error('Invalid registration number or password.');
    }

    const profile = this.profiles.get(foundUser.id)!;
    return this.setSession(foundUser, profile);
  }

  public async logout(): Promise<void> {
    this.currentSession = null;
  }

  public async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const profile = this.profiles.get(this.currentSession.user.id);
    if (!profile) throw new Error('Profile not found');

    if (updates.bio !== undefined && updates.bio.length > 160) {
      throw new Error('Bio exceeds maximum limit of 160 characters.');
    }

    if (updates.handle !== undefined) {
      const cleanHandle = updates.handle.toLowerCase().trim();
      for (const p of this.profiles.values()) {
        if (p.id !== profile.id && p.handle === cleanHandle) {
          throw new Error('Handle is already claimed by another student.');
        }
      }
      profile.handle = cleanHandle;
    }

    if (updates.displayName !== undefined) profile.displayName = updates.displayName.trim();
    if (updates.avatarUrl !== undefined) profile.avatarUrl = updates.avatarUrl;
    if (updates.bio !== undefined) profile.bio = updates.bio;
    if (updates.course !== undefined) profile.course = updates.course;
    if (updates.yearOfStudy !== undefined) profile.yearOfStudy = updates.yearOfStudy;
    if (updates.interests !== undefined) profile.interests = [...updates.interests];

    profile.updatedAt = new Date().toISOString();
    this.currentSession.profile = { ...profile };
    return { ...profile };
  }

  public async getSettings(): Promise<AccountSettings> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const s = this.settings.get(this.currentSession.user.id);
    if (!s) {
      const defaultSettings: AccountSettings = {
        userId: this.currentSession.user.id,
        theme: 'light',
        reduceMotion: false,
        readReceiptsEnabled: false,
        notifyOnComments: true,
        notifyOnReactions: true,
        notifyOnFriendRequests: true,
        notifyOnEventUpdates: true,
        updatedAt: new Date().toISOString(),
      };
      this.settings.set(this.currentSession.user.id, defaultSettings);
      return { ...defaultSettings };
    }
    return { ...s };
  }

  public async updateSettings(updates: Partial<AccountSettings>): Promise<AccountSettings> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const s = await this.getSettings();
    Object.assign(s, updates, { updatedAt: new Date().toISOString() });
    this.settings.set(s.userId, { ...s });
    return { ...s };
  }

  public async requestPasswordReset(regNumber: string): Promise<boolean> {
    const normalized = normalizeRegNumber(regNumber);
    for (const u of this.users.values()) {
      if (u.normalizedRegNumber === normalized) {
        return true;
      }
    }
    return false;
  }

  public async resetPassword(password: string): Promise<boolean> {
    if (!this.currentSession) throw new Error('Must be authenticated with recovery session');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    const u = this.users.get(this.currentSession.user.id);
    if (u) {
      u.passwordHash = `hash_${password}`;
      return true;
    }
    return false;
  }

  // Feed & Posts
  public async getPosts(tab: 'campus' | 'friends' | 'clubs' = 'campus'): Promise<{ items: Post[]; hasMore: boolean }> {
    const userId = this.currentSession?.user.id;
    let postList = Array.from(this.posts.values());

    // Filter blocked authors
    if (userId) {
      postList = postList.filter((p) => !this.isBlocked(userId, p.authorId));
    }

    if (tab === 'campus') {
      // Pinned first, then reverse chronological
      postList.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (tab === 'friends') {
      if (!userId) return { items: [], hasMore: false };
      const friends = this.getFriendUserIds(userId);
      postList = postList.filter((p) => friends.includes(p.authorId));
      postList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (tab === 'clubs') {
      if (!userId) return { items: [], hasMore: false };
      const joinedClubs = this.getJoinedClubIds(userId);
      postList = postList.filter((p) => p.clubId && joinedClubs.includes(p.clubId));
      postList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Attach author profile and bookmark flag
    const resolved = postList.map((p) => ({
      ...p,
      author: this.profiles.get(p.authorId),
      isBookmarked: userId ? this.bookmarks.has(`${userId}:${p.id}`) : false,
      userReaction: userId ? this.userReactions.get(`${userId}:${p.id}`) : undefined,
    }));

    return { items: resolved, hasMore: false };
  }

  public async getPostById(postId: string): Promise<Post | null> {
    const p = this.posts.get(postId);
    if (!p) return null;
    const userId = this.currentSession?.user.id;
    if (userId && this.isBlocked(userId, p.authorId)) return null;

    return {
      ...p,
      author: this.profiles.get(p.authorId),
      isBookmarked: userId ? this.bookmarks.has(`${userId}:${p.id}`) : false,
      userReaction: userId ? this.userReactions.get(`${userId}:${p.id}`) : undefined,
    };
  }

  public async createPost(input: CreatePostInput): Promise<Post> {
    if (!this.currentSession) throw new Error('Not authenticated');
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Post content cannot be empty.');
    }
    if (input.content.length > 2000) {
      throw new Error('Post content exceeds 2,000 character maximum limit.');
    }
    if (input.attachments && input.attachments.length > 4) {
      throw new Error('Maximum of 4 attachments allowed per post.');
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const attachments: PostAttachment[] = (input.attachments || []).map((att, idx) => ({
      id: `att_${postId}_${idx}`,
      postId,
      kind: att.kind,
      mediaUrl: att.mediaUrl,
      creationId: att.creationId,
      giphyId: att.giphyId,
      giphyKind: att.giphyKind,
      displayOrder: idx,
    }));

    let poll: Poll | undefined;
    if (input.poll) {
      if (input.poll.options.length < 2 || input.poll.options.length > 6) {
        throw new Error('Poll must contain between 2 and 6 options.');
      }
      const pollId = `poll_${postId}`;
      poll = {
        id: pollId,
        postId,
        question: input.poll.question,
        closesAt: input.poll.closesAt || new Date(Date.now() + 86400000 * 2).toISOString(),
        options: input.poll.options.map((opt, idx) => ({
          id: `opt_${pollId}_${idx}`,
          pollId,
          optionText: opt,
          displayOrder: idx,
          voteCount: 0,
        })),
        totalVotes: 0,
        isClosed: false,
      };
    }

    const newPost: Post = {
      id: postId,
      authorId: this.currentSession.user.id,
      campusId: 'christ_lavasa',
      clubId: input.clubId,
      content: input.content.trim(),
      isPinned: false,
      attachments,
      poll,
      reactions: { like: 0, love: 0, laugh: 0, fire: 0, clap: 0 },
      commentsCount: 0,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.posts.set(postId, newPost);
    return {
      ...newPost,
      author: this.currentSession.profile,
    };
  }

  public async editPost(postId: string, content: string): Promise<Post> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const p = this.posts.get(postId);
    if (!p) throw new Error('Post not found');
    if (p.authorId !== this.currentSession.user.id) {
      throw new Error('Unauthorized to edit this post.');
    }
    if (!content || content.trim().length === 0) {
      throw new Error('Post content cannot be empty.');
    }
    if (content.length > 2000) {
      throw new Error('Post content exceeds 2,000 character maximum limit.');
    }

    p.content = content.trim();
    p.updatedAt = new Date().toISOString();
    return { ...p, author: this.currentSession.profile };
  }

  public async deletePost(postId: string): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const p = this.posts.get(postId);
    if (!p) throw new Error('Post not found');
    if (p.authorId !== this.currentSession.user.id && this.currentSession.user.role !== 'campus_admin') {
      throw new Error('Unauthorized to delete this post.');
    }
    this.posts.delete(postId);
  }

  public async toggleReaction(postId: string, reaction: PostReactionType): Promise<Post> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const p = this.posts.get(postId);
    if (!p) throw new Error('Post not found');

    const key = `${this.currentSession.user.id}:${postId}`;
    const existing = this.userReactions.get(key);

    if (existing === reaction) {
      // Toggle off
      this.userReactions.delete(key);
      p.reactions[reaction] = Math.max(0, p.reactions[reaction] - 1);
    } else {
      // If had different reaction, decrement previous
      if (existing) {
        p.reactions[existing] = Math.max(0, p.reactions[existing] - 1);
      }
      this.userReactions.set(key, reaction);
      p.reactions[reaction] = (p.reactions[reaction] || 0) + 1;

      // Notify post author if not self
      if (p.authorId !== this.currentSession.user.id) {
        this.addNotification({
          recipientId: p.authorId,
          actorId: this.currentSession.user.id,
          type: 'reaction',
          destinationUrl: `/posts/${postId}`,
          title: `${this.currentSession.profile.displayName} reacted to your post`,
        });
      }
    }

    return {
      ...p,
      author: this.profiles.get(p.authorId),
      userReaction: this.userReactions.get(key),
    };
  }

  public async votePoll(pollId: string, optionId: string): Promise<Poll> {
    if (!this.currentSession) throw new Error('Not authenticated');
    let targetPost: Post | undefined;
    for (const p of this.posts.values()) {
      if (p.poll && p.poll.id === pollId) {
        targetPost = p;
        break;
      }
    }
    if (!targetPost || !targetPost.poll) throw new Error('Poll not found');
    const poll = targetPost.poll;

    if (poll.isClosed || new Date(poll.closesAt).getTime() <= Date.now()) {
      poll.isClosed = true;
      throw new Error('This poll is closed for voting.');
    }

    const voteKey = `${this.currentSession.user.id}:${pollId}`;
    const priorOptionId = this.pollVotes.get(voteKey);

    const targetOption = poll.options.find((o) => o.id === optionId);
    if (!targetOption) throw new Error('Invalid poll option ID.');

    if (priorOptionId === optionId) {
      // Same vote, no change
      return { ...poll, userVotedOptionId: optionId };
    }

    if (priorOptionId) {
      // Decrement previous option
      const prev = poll.options.find((o) => o.id === priorOptionId);
      if (prev) prev.voteCount = Math.max(0, prev.voteCount - 1);
    } else {
      poll.totalVotes += 1;
    }

    targetOption.voteCount += 1;
    this.pollVotes.set(voteKey, optionId);
    poll.userVotedOptionId = optionId;

    return { ...poll };
  }

  public async toggleBookmark(postId: string): Promise<boolean> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const key = `${this.currentSession.user.id}:${postId}`;
    if (this.bookmarks.has(key)) {
      this.bookmarks.delete(key);
      return false;
    } else {
      this.bookmarks.add(key);
      return true;
    }
  }

  public async getBookmarkedPosts(): Promise<Post[]> {
    if (!this.currentSession) return [];
    const userId = this.currentSession.user.id;
    const result: Post[] = [];
    for (const p of this.posts.values()) {
      if (this.bookmarks.has(`${userId}:${p.id}`) && !this.isBlocked(userId, p.authorId)) {
        result.push({
          ...p,
          author: this.profiles.get(p.authorId),
          isBookmarked: true,
          userReaction: this.userReactions.get(`${userId}:${p.id}`),
        });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Comments
  public async getComments(postId: string): Promise<Comment[]> {
    const userId = this.currentSession?.user.id;
    const list: Comment[] = [];
    for (const c of this.comments.values()) {
      if (c.postId === postId) {
        if (userId && this.isBlocked(userId, c.authorId)) continue;
        list.push({ ...c, author: this.profiles.get(c.authorId) });
      }
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async addComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty.');
    }
    if (content.length > 1000) {
      throw new Error('Comment exceeds 1,000 character maximum limit.');
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const comment: Comment = {
      id: commentId,
      postId,
      authorId: this.currentSession.user.id,
      content: content.trim(),
      parentCommentId,
      createdAt: new Date().toISOString(),
    };

    this.comments.set(commentId, comment);
    post.commentsCount += 1;

    // Notify post author if not self
    if (post.authorId !== this.currentSession.user.id) {
      this.addNotification({
        recipientId: post.authorId,
        actorId: this.currentSession.user.id,
        type: 'comment',
        destinationUrl: `/posts/${postId}`,
        title: `${this.currentSession.profile.displayName} commented on your post`,
        body: content.slice(0, 60),
      });
    }

    return { ...comment, author: this.currentSession.profile };
  }

  public async deleteComment(commentId: string): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const c = this.comments.get(commentId);
    if (!c) throw new Error('Comment not found');
    if (c.authorId !== this.currentSession.user.id && this.currentSession.user.role !== 'campus_admin') {
      throw new Error('Unauthorized to delete this comment.');
    }
    this.comments.delete(commentId);
    const post = this.posts.get(c.postId);
    if (post) post.commentsCount = Math.max(0, post.commentsCount - 1);
  }

  // Discover & Relationships
  public async search(query: string, filter: SearchFilter = 'all'): Promise<SearchResults> {
    const q = query.toLowerCase().trim();
    const userId = this.currentSession?.user.id;

    const people: Profile[] = [];
    const clubs: Club[] = [];
    const events: CampusEvent[] = [];
    const posts: Post[] = [];
    const tags: string[] = ['#LavasaMonsoon', '#CentralBlock', '#ChristLavasa', '#Hackathon2026', '#CodingCommunity'];

    if (filter === 'all' || filter === 'people') {
      for (const p of this.profiles.values()) {
        if (userId && this.isBlocked(userId, p.id)) continue;
        if (!q || p.displayName.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q) || p.course.toLowerCase().includes(q)) {
          people.push({ ...p });
        }
      }
    }

    if (filter === 'all' || filter === 'clubs') {
      for (const c of this.clubs.values()) {
        if (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
          clubs.push({
            ...c,
            isJoined: userId ? this.clubMemberships.has(`${c.id}:${userId}`) : false,
          });
        }
      }
    }

    if (filter === 'all' || filter === 'events') {
      for (const e of this.events.values()) {
        if (!q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)) {
          events.push({
            ...e,
            userRsvp: userId ? this.eventRsvps.get(`${e.id}:${userId}`)?.status : undefined,
          });
        }
      }
    }

    if (filter === 'all' || filter === 'posts') {
      for (const p of this.posts.values()) {
        if (userId && this.isBlocked(userId, p.authorId)) continue;
        if (!q || p.content.toLowerCase().includes(q)) {
          posts.push({
            ...p,
            author: this.profiles.get(p.authorId),
            isBookmarked: userId ? this.bookmarks.has(`${userId}:${p.id}`) : false,
          });
        }
      }
    }

    return {
      people,
      clubs,
      events,
      posts,
      tags: tags.filter((t) => !q || t.toLowerCase().includes(q)),
    };
  }

  public async getProfileByHandle(handle: string): Promise<Profile | null> {
    const clean = handle.toLowerCase().replace(/^@/, '').trim();
    for (const p of this.profiles.values()) {
      if (p.handle.toLowerCase() === clean) {
        if (this.currentSession && this.isBlocked(this.currentSession.user.id, p.id)) {
          return null; // Blocked profiles hidden
        }
        return { ...p };
      }
    }
    return null;
  }

  public async getFriendshipStatus(targetUserId: string): Promise<RelationshipState> {
    if (!this.currentSession) return 'none';
    const myId = this.currentSession.user.id;
    if (myId === targetUserId) return 'self';
    if (this.isBlocked(myId, targetUserId)) return 'blocked';

    for (const f of this.friendships.values()) {
      if (f.requesterId === myId && f.addresseeId === targetUserId) {
        return f.status === 'accepted' ? 'friends' : 'pending_sent';
      }
      if (f.requesterId === targetUserId && f.addresseeId === myId) {
        return f.status === 'accepted' ? 'friends' : 'pending_received';
      }
    }
    return 'none';
  }

  public async sendFriendRequest(targetUserId: string): Promise<Friendship> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const myId = this.currentSession.user.id;
    if (myId === targetUserId) throw new Error('Cannot send friend request to yourself.');
    if (this.isBlocked(myId, targetUserId)) throw new Error('Action blocked.');

    // Check existing
    for (const f of this.friendships.values()) {
      if ((f.requesterId === myId && f.addresseeId === targetUserId) || (f.requesterId === targetUserId && f.addresseeId === myId)) {
        if (f.status === 'accepted') throw new Error('You are already friends.');
        if (f.status === 'pending') throw new Error('Friend request already pending.');
      }
    }

    const fid = `friend_${Date.now()}`;
    const friendship: Friendship = {
      id: fid,
      requesterId: myId,
      addresseeId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.friendships.set(fid, friendship);

    this.addNotification({
      recipientId: targetUserId,
      actorId: myId,
      type: 'friend_request',
      destinationUrl: `/people/${this.currentSession.profile.handle}`,
      title: `${this.currentSession.profile.displayName} sent you a friend request`,
    });

    return { ...friendship };
  }

  public async respondFriendRequest(friendshipId: string, action: 'accept' | 'reject'): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const f = this.friendships.get(friendshipId);
    if (!f) throw new Error('Friend request not found');
    if (f.addresseeId !== this.currentSession.user.id) {
      throw new Error('Unauthorized to respond to this friend request.');
    }

    if (action === 'accept') {
      f.status = 'accepted';
      f.updatedAt = new Date().toISOString();

      this.addNotification({
        recipientId: f.requesterId,
        actorId: this.currentSession.user.id,
        type: 'friend_accept',
        destinationUrl: `/people/${this.currentSession.profile.handle}`,
        title: `${this.currentSession.profile.displayName} accepted your friend request`,
      });
    } else {
      this.friendships.delete(friendshipId);
    }
  }

  public async removeFriend(friendUserId: string): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const myId = this.currentSession.user.id;
    for (const [id, f] of this.friendships.entries()) {
      if ((f.requesterId === myId && f.addresseeId === friendUserId) || (f.requesterId === friendUserId && f.addresseeId === myId)) {
        this.friendships.delete(id);
        break;
      }
    }
  }

  public async blockUser(targetUserId: string): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const myId = this.currentSession.user.id;
    this.blocks.add(`${myId}:${targetUserId}`);
    // Dissolve any friendship
    await this.removeFriend(targetUserId);
  }

  public async unblockUser(targetUserId: string): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const myId = this.currentSession.user.id;
    this.blocks.delete(`${myId}:${targetUserId}`);
  }

  public async getBlockedUsers(): Promise<Profile[]> {
    if (!this.currentSession) return [];
    const myId = this.currentSession.user.id;
    const result: Profile[] = [];
    for (const b of this.blocks) {
      const [blocker, blocked] = b.split(':');
      if (blocker === myId) {
        const p = this.profiles.get(blocked);
        if (p) result.push({ ...p });
      }
    }
    return result;
  }

  private isBlocked(u1: string, u2: string): boolean {
    return this.blocks.has(`${u1}:${u2}`) || this.blocks.has(`${u2}:${u1}`);
  }

  private getFriendUserIds(userId: string): string[] {
    const ids: string[] = [];
    for (const f of this.friendships.values()) {
      if (f.status === 'accepted') {
        if (f.requesterId === userId) ids.push(f.addresseeId);
        else if (f.addresseeId === userId) ids.push(f.requesterId);
      }
    }
    return ids;
  }

  private getJoinedClubIds(userId: string): string[] {
    const ids: string[] = [];
    for (const m of this.clubMemberships.values()) {
      if (m.userId === userId) ids.push(m.clubId);
    }
    return ids;
  }

  // Messaging & Chat
  public async getConversations(): Promise<Conversation[]> {
    if (!this.currentSession) return [];
    const myId = this.currentSession.user.id;
    const result: Conversation[] = [];

    for (const conv of this.conversations.values()) {
      const isMember = conv.members.some((m) => m.userId === myId);
      if (isMember) {
        let other: Profile | undefined;
        if (conv.type === 'direct') {
          const otherMember = conv.members.find((m) => m.userId !== myId);
          if (otherMember) other = this.profiles.get(otherMember.userId);
        }
        result.push({ ...conv, otherParticipant: other });
      }
    }

    return result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  public async getConversationById(id: string): Promise<Conversation | null> {
    const conv = this.conversations.get(id);
    if (!conv) return null;
    const myId = this.currentSession?.user.id;
    if (myId && !conv.members.some((m) => m.userId === myId)) return null;

    let other: Profile | undefined;
    if (conv.type === 'direct' && myId) {
      const otherMember = conv.members.find((m) => m.userId !== myId);
      if (otherMember) other = this.profiles.get(otherMember.userId);
    }
    return { ...conv, otherParticipant: other };
  }

  public async getOrCreateDirectConversation(targetUserId: string): Promise<Conversation> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const myId = this.currentSession.user.id;

    // Check mutual friendship
    const status = await this.getFriendshipStatus(targetUserId);
    if (status !== 'friends') {
      throw new Error('Direct messaging requires accepted mutual friendship.');
    }

    for (const conv of this.conversations.values()) {
      if (conv.type === 'direct') {
        const uids = conv.members.map((m) => m.userId);
        if (uids.includes(myId) && uids.includes(targetUserId)) {
          return { ...conv, otherParticipant: this.profiles.get(targetUserId) };
        }
      }
    }

    const cid = `conv_${Date.now()}`;
    const conv: Conversation = {
      id: cid,
      type: 'direct',
      creatorId: myId,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      members: [
        {
          conversationId: cid,
          userId: myId,
          role: 'member',
          status: 'accepted',
          lastReadAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
        },
        {
          conversationId: cid,
          userId: targetUserId,
          role: 'member',
          status: 'accepted',
          lastReadAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    this.conversations.set(cid, conv);
    return { ...conv, otherParticipant: this.profiles.get(targetUserId) };
  }

  public async getMessages(conversationId: string): Promise<Message[]> {
    const list: Message[] = [];
    for (const m of this.messages.values()) {
      if (m.conversationId === conversationId && !m.isDeleted) {
        list.push({ ...m, sender: this.profiles.get(m.senderId) });
      }
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async sendMessage(input: SendMessageInput): Promise<Message> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const conv = this.conversations.get(input.conversationId);
    if (!conv) throw new Error('Conversation not found');

    const myId = this.currentSession.user.id;
    if (!conv.members.some((m) => m.userId === myId)) {
      throw new Error('Unauthorized: you are not a member of this conversation.');
    }

    if (input.content && input.content.length > 4000) {
      throw new Error('Message content exceeds 4,000 character maximum limit.');
    }

    const mid = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const msg: Message = {
      id: mid,
      conversationId: input.conversationId,
      senderId: myId,
      content: input.content?.trim(),
      attachmentKind: input.attachmentKind,
      mediaUrl: input.mediaUrl,
      creationId: input.creationId,
      giphyId: input.giphyId,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      reactions: [],
    };

    this.messages.set(mid, msg);
    conv.lastMessageAt = msg.createdAt;
    conv.lastMessagePreview = msg.content || 'Attachment';
    conv.unreadCount += 1;

    return { ...msg, sender: this.currentSession.profile };
  }

  public async markConversationRead(conversationId: string): Promise<void> {
    const conv = this.conversations.get(conversationId);
    if (conv) conv.unreadCount = 0;
  }

  public async createGroup(title: string, memberIds: string[]): Promise<Conversation> {
    if (!this.currentSession) throw new Error('Not authenticated');
    if (!title || title.trim().length === 0) throw new Error('Group title is required.');
    const myId = this.currentSession.user.id;
    const allMembers = Array.from(new Set([myId, ...memberIds]));

    if (allMembers.length > 30) {
      throw new Error('Group conversations are capped at 30 members.');
    }

    const cid = `group_${Date.now()}`;
    const members: ConversationMember[] = allMembers.map((uid) => ({
      conversationId: cid,
      userId: uid,
      role: uid === myId ? 'admin' : 'member',
      status: 'accepted',
      lastReadAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      profile: this.profiles.get(uid),
    }));

    const group: Conversation = {
      id: cid,
      type: 'group',
      title: title.trim(),
      creatorId: myId,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      members,
    };

    this.conversations.set(cid, group);
    return { ...group };
  }

  // Clubs & Events
  public async getClubs(category?: string): Promise<Club[]> {
    const userId = this.currentSession?.user.id;
    const list: Club[] = [];
    for (const c of this.clubs.values()) {
      if (!category || c.category.toLowerCase() === category.toLowerCase()) {
        list.push({
          ...c,
          isJoined: userId ? this.clubMemberships.has(`${c.id}:${userId}`) : false,
        });
      }
    }
    return list;
  }

  public async getClubBySlug(slug: string): Promise<Club | null> {
    const userId = this.currentSession?.user.id;
    for (const c of this.clubs.values()) {
      if (c.slug === slug) {
        return {
          ...c,
          owner: this.profiles.get(c.ownerId),
          isJoined: userId ? this.clubMemberships.has(`${c.id}:${userId}`) : false,
        };
      }
    }
    return null;
  }

  public async toggleClubMembership(clubId: string): Promise<ClubMembership | null> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const club = this.clubs.get(clubId);
    if (!club) throw new Error('Club not found');
    const myId = this.currentSession.user.id;
    const key = `${clubId}:${myId}`;

    if (this.clubMemberships.has(key)) {
      this.clubMemberships.delete(key);
      club.memberCount = Math.max(0, club.memberCount - 1);
      return null;
    } else {
      const membership: ClubMembership = {
        clubId,
        userId: myId,
        role: 'member',
        joinedAt: new Date().toISOString(),
      };
      this.clubMemberships.set(key, membership);
      club.memberCount += 1;
      return membership;
    }
  }

  public async getEvents(filter: 'all' | 'weekend' | 'rsvps' = 'all'): Promise<CampusEvent[]> {
    const userId = this.currentSession?.user.id;
    const list: CampusEvent[] = [];

    for (const e of this.events.values()) {
      const rsvp = userId ? this.eventRsvps.get(`${e.id}:${userId}`) : undefined;
      if (filter === 'rsvps' && !rsvp) continue;
      list.push({
        ...e,
        club: e.clubId ? this.clubs.get(e.clubId) : undefined,
        creator: this.profiles.get(e.creatorId),
        userRsvp: rsvp?.status,
      });
    }

    return list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }

  public async getEventById(eventId: string): Promise<CampusEvent | null> {
    const e = this.events.get(eventId);
    if (!e) return null;
    const userId = this.currentSession?.user.id;
    const rsvp = userId ? this.eventRsvps.get(`${e.id}:${userId}`) : undefined;
    return {
      ...e,
      club: e.clubId ? this.clubs.get(e.clubId) : undefined,
      creator: this.profiles.get(e.creatorId),
      userRsvp: rsvp?.status,
    };
  }

  public async toggleEventRsvp(eventId: string, status: RsvpStatus): Promise<EventRsvp | null> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const event = this.events.get(eventId);
    if (!event) throw new Error('Event not found');
    const myId = this.currentSession.user.id;
    const key = `${eventId}:${myId}`;
    const existing = this.eventRsvps.get(key);

    if (existing && existing.status === status) {
      // Toggle off / cancel
      this.eventRsvps.delete(key);
      event.rsvpsCount[status] = Math.max(0, event.rsvpsCount[status] - 1);
      return null;
    }

    if (existing) {
      event.rsvpsCount[existing.status] = Math.max(0, event.rsvpsCount[existing.status] - 1);
    }

    const rsvp: EventRsvp = {
      eventId,
      userId: myId,
      status,
      createdAt: new Date().toISOString(),
    };
    this.eventRsvps.set(key, rsvp);
    event.rsvpsCount[status] += 1;
    return rsvp;
  }

  // Studio & Sticker Packs
  public async getCreations(userId?: string): Promise<Creation[]> {
    const uid = userId || this.currentSession?.user.id;
    const list: Creation[] = [];
    for (const c of this.creations.values()) {
      if (!uid || c.creatorId === uid) {
        list.push({ ...c, creator: this.profiles.get(c.creatorId) });
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getCreationById(id: string): Promise<Creation | null> {
    const c = this.creations.get(id);
    if (!c) return null;
    return { ...c, creator: this.profiles.get(c.creatorId) };
  }

  public async saveCreation(input: SaveCreationInput, creationId?: string): Promise<Creation> {
    if (!this.currentSession) throw new Error('Not authenticated');
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Creation title is required.');
    }
    if (input.draftData.layers.length > 20) {
      throw new Error('Maximum 20 layers allowed per studio creation.');
    }

    const id = creationId || `creation_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const creation: Creation = {
      id,
      creatorId: this.currentSession.user.id,
      kind: input.kind,
      title: input.title.trim(),
      draftData: input.draftData,
      renderedImageUrl: input.renderedImageUrl || '/stickers/custom-render.png',
      isPublished: input.isPublished || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.creations.set(id, creation);
    return { ...creation, creator: this.currentSession.profile };
  }

  public async deleteCreation(id: string): Promise<void> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const c = this.creations.get(id);
    if (!c) throw new Error('Creation not found');
    if (c.creatorId !== this.currentSession.user.id) {
      throw new Error('Unauthorized to delete this creation.');
    }
    this.creations.delete(id);
  }

  public async getStickerPacks(): Promise<StickerPack[]> {
    return Array.from(this.stickerPacks.values());
  }

  public async getStickerPackById(id: string): Promise<StickerPack | null> {
    return this.stickerPacks.get(id) || null;
  }

  public async createStickerPack(title: string, stickerIds: string[], coverCreationId?: string): Promise<StickerPack> {
    if (!this.currentSession) throw new Error('Not authenticated');
    if (!title || title.trim().length === 0) throw new Error('Sticker pack title is required.');
    const stickers: Creation[] = [];
    for (const sid of stickerIds) {
      const c = this.creations.get(sid);
      if (c) stickers.push(c);
    }

    const pid = `pack_${Date.now()}`;
    const pack: StickerPack = {
      id: pid,
      creatorId: this.currentSession.user.id,
      creator: this.currentSession.profile,
      title: title.trim(),
      coverCreationId,
      coverImageUrl: coverCreationId ? this.creations.get(coverCreationId)?.renderedImageUrl : undefined,
      stickers,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.stickerPacks.set(pid, pack);
    return pack;
  }

  // Notifications
  public async getNotifications(): Promise<Notification[]> {
    if (!this.currentSession) return [];
    const myId = this.currentSession.user.id;
    const list: Notification[] = [];
    for (const n of this.notifications.values()) {
      if (n.recipientId === myId) {
        list.push({ ...n, actor: n.actorId ? this.profiles.get(n.actorId) : undefined });
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markNotificationRead(id: string): Promise<void> {
    const n = this.notifications.get(id);
    if (n) n.isRead = true;
  }

  public async markAllNotificationsRead(): Promise<void> {
    if (!this.currentSession) return;
    const myId = this.currentSession.user.id;
    for (const n of this.notifications.values()) {
      if (n.recipientId === myId) n.isRead = true;
    }
  }

  public addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const full: Notification = {
      ...notif,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, full);
    return full;
  }

  // Reports
  public async submitReport(input: { targetType: string; targetId: string; category: ReportCategory; notes?: string }): Promise<Report> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const rid = `report_${Date.now()}`;
    const rep: Report = {
      id: rid,
      reporterId: this.currentSession.user.id,
      targetType: input.targetType,
      targetId: input.targetId,
      category: input.category,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };
    this.reports.set(rid, rep);
    return rep;
  }

  // Data Export
  public async exportPersonalData(): Promise<Record<string, any>> {
    if (!this.currentSession) throw new Error('Not authenticated');
    const myId = this.currentSession.user.id;
    return {
      user: this.users.get(myId),
      profile: this.profiles.get(myId),
      settings: this.settings.get(myId),
      posts: Array.from(this.posts.values()).filter((p) => p.authorId === myId),
      comments: Array.from(this.comments.values()).filter((c) => c.authorId === myId),
      creations: Array.from(this.creations.values()).filter((c) => c.creatorId === myId),
      exportedAt: new Date().toISOString(),
    };
  }
}
