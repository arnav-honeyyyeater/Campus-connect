// ============================================================================
// File: src/lib/mock-store/types.ts
// Campus Connect - Master Type Definitions & Store Interface
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Campus, Identity & Authentication Types
// ----------------------------------------------------------------------------

export type CampusRole = 'student' | 'moderator' | 'campus_admin';
export type MembershipStatus = 'active' | 'suspended' | 'banned';
export type RecoveryEmailStatus = 'not_added' | 'awaiting_verification' | 'verified';

export interface Campus {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  normalizedRegNumber: string;
  passwordHash: string; // Plaintext or simulated hash in client mock
  recoveryEmail?: string;
  recoveryEmailVerified: boolean;
  recoveryEmailStatus: RecoveryEmailStatus;
  role: CampusRole;
  status: MembershipStatus;
  createdAt: string;
}

export interface Profile {
  id: string; // Foreign key to UserAccount.id
  handle: string; // Unique lowercase alphanumeric with underscores
  displayName: string;
  avatarUrl: string;
  bio: string; // Max 160 characters
  course: string;
  yearOfStudy: number; // 1 to 5
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

export interface OnboardingInput {
  displayName?: string;
  handle?: string;
  avatarUrl?: string;
  bio?: string;
  course?: string;
  yearOfStudy?: number;
  interests?: string[];
}

// ----------------------------------------------------------------------------
// 2. Social Relationships & Moderation
// ----------------------------------------------------------------------------

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export type RelationshipState =
  | 'self'
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

export type ReportCategory =
  | 'harassment'
  | 'impersonation'
  | 'sexual_content'
  | 'hate'
  | 'spam'
  | 'copyright'
  | 'other';

export type ReportTargetType = 'profile' | 'post' | 'comment' | 'message' | 'pack';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  category: ReportCategory;
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 3. Feed, Posts, Polls, Reactions, Comments & Bookmarks
// ----------------------------------------------------------------------------

export type AttachmentKind = 'image' | 'custom_sticker' | 'giphy';
export type PostReactionType = 'like' | 'love' | 'laugh' | 'fire' | 'clap';

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
  content: string; // Max 1,000 characters
  parentCommentId?: string;
  createdAt: string;
}

export interface PostReaction {
  postId: string;
  userId: string;
  reaction: PostReactionType;
  createdAt: string;
}

export interface Bookmark {
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author?: Profile;
  campusId: string;
  clubId?: string;
  club?: Club;
  content: string; // Max 2,000 characters
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
    options: string[]; // 2 to 6 options
    closesAt?: string;
    durationHours?: number; // e.g. 24, 72, 168
  };
}

// ----------------------------------------------------------------------------
// 4. Clubs & Campus Events
// ----------------------------------------------------------------------------

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
  startsAt: string; // ISO 8601 UTC
  endsAt: string;   // ISO 8601 UTC
  venue: string;
  externalUrl?: string;
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

// ----------------------------------------------------------------------------
// 5. Messaging & Real-Time Chat
// ----------------------------------------------------------------------------

export type ConversationType = 'direct' | 'group';

export interface ConversationMember {
  conversationId: string;
  userId: string;
  role: 'member' | 'admin';
  status: 'pending' | 'accepted' | 'left' | 'removed';
  lastReadAt: string;
  joinedAt: string;
  profile?: Profile;
}

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
  content?: string; // Max 4,000 characters
  attachmentKind?: AttachmentKind;
  mediaUrl?: string;
  creationId?: string;
  giphyId?: string;
  createdAt: string;
  isDeleted: boolean;
  reactions: MessageReaction[];
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
  otherParticipant?: Profile; // For direct chats
}

export interface SendMessageInput {
  conversationId: string;
  content?: string;
  attachmentKind?: AttachmentKind;
  mediaUrl?: string;
  creationId?: string;
  giphyId?: string;
  clientMessageId?: string;
}

// ----------------------------------------------------------------------------
// 6. Meme & Sticker Studio
// ----------------------------------------------------------------------------

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
  points?: number[]; // For polygon coordinates [x1, y1, x2, y2, ...]
  locked?: boolean;
}

export interface CreationDraftData {
  version: number;
  mode: 'meme' | 'sticker';
  aspectRatio: string; // '1:1' | '4:5' | '16:9' | 'custom'
  layers: CanvasLayer[]; // Max 20 layers
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

// ----------------------------------------------------------------------------
// 7. In-App Notifications
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// 8. Search & Discovery
// ----------------------------------------------------------------------------

export type SearchFilter = 'all' | 'people' | 'clubs' | 'events' | 'posts' | 'tags';

export interface SearchResults {
  people: Profile[];
  clubs: Club[];
  events: CampusEvent[];
  posts: Post[];
  tags: string[];
}

// ----------------------------------------------------------------------------
// 9. Reactive Store Event Bus Definitions
// ----------------------------------------------------------------------------

export type StoreEventType =
  | 'AUTH_STATE_CHANGE'
  | 'POSTS_CHANGE'
  | 'COMMENTS_CHANGE'
  | 'MESSAGES_CHANGE'
  | 'NOTIFICATIONS_CHANGE'
  | 'FRIENDS_CHANGE'
  | 'CLUBS_CHANGE'
  | 'EVENTS_CHANGE'
  | 'CREATIONS_CHANGE';

export interface StoreEvent {
  type: StoreEventType;
  payload?: any;
  timestamp: number;
}

export type StoreEventListener = (event: StoreEvent) => void;

// ----------------------------------------------------------------------------
// 10. Master IMockStore Interface Contract
// ----------------------------------------------------------------------------

export interface IMockStore {
  // Session & Auth
  getCurrentUser(): UserAccount | null;
  getCurrentProfile(): Profile | null;
  getSession(): Session | null;
  signInWithRegistration(regNumber: string): Promise<Session>;
  login(input: LoginInput): Promise<Session>;
  signup(input: SignupInput): Promise<Session>;
  logout(): Promise<void>;
  updateProfile(updates: Partial<Profile>): Promise<Profile>;
  getSettings(): Promise<AccountSettings>;
  updateSettings(updates: Partial<AccountSettings>): Promise<AccountSettings>;
  requestPasswordReset(regNumber: string): Promise<boolean>;
  resetPassword(password: string): Promise<boolean>;

  // Feed & Posts
  getPosts(tab?: 'campus' | 'friends' | 'clubs', page?: number): Promise<{ items: Post[]; hasMore: boolean }>;
  getPostById(postId: string): Promise<Post | null>;
  createPost(input: CreatePostInput): Promise<Post>;
  editPost(postId: string, content: string): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  toggleReaction(postId: string, reaction: PostReactionType): Promise<Post>;
  votePoll(pollId: string, optionId: string): Promise<Poll>;
  toggleBookmark(postId: string): Promise<boolean>;
  getBookmarkedPosts(): Promise<Post[]>;

  // Comments
  getComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, content: string, parentCommentId?: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;

  // Relationships & Discovery
  search(query: string, filter?: SearchFilter): Promise<SearchResults>;
  getProfileByHandle(handle: string): Promise<Profile | null>;
  getFriendshipStatus(targetUserId: string): Promise<RelationshipState>;
  sendFriendRequest(targetUserId: string): Promise<Friendship>;
  respondFriendRequest(friendshipId: string, action: 'accept' | 'reject'): Promise<void>;
  removeFriend(friendUserId: string): Promise<void>;
  blockUser(targetUserId: string): Promise<void>;
  unblockUser(targetUserId: string): Promise<void>;
  getBlockedUsers(): Promise<Profile[]>;

  // Messaging & Chat
  getConversations(filter?: 'all' | 'direct' | 'groups'): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | null>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  markConversationRead(conversationId: string): Promise<void>;
  createGroup(title: string, memberIds: string[]): Promise<Conversation>;
  deleteMessage(messageId: string): Promise<void>;

  // Clubs & Events
  getClubs(category?: string): Promise<Club[]>;
  getClubBySlug(slug: string): Promise<Club | null>;
  createClub(input: { name: string; slug: string; description: string; category: string; coverImageUrl?: string }): Promise<Club>;
  toggleClubMembership(clubId: string): Promise<ClubMembership | null>;
  getEvents(filter?: 'all' | 'weekend' | 'rsvps'): Promise<CampusEvent[]>;
  getEventById(eventId: string): Promise<CampusEvent | null>;
  toggleEventRsvp(eventId: string, status: RsvpStatus): Promise<EventRsvp | null>;

  // Meme & Sticker Studio
  getCreations(userId?: string): Promise<Creation[]>;
  getCreationById(id: string): Promise<Creation | null>;
  saveCreation(input: SaveCreationInput, creationId?: string): Promise<Creation>;
  deleteCreation(id: string): Promise<void>;
  getStickerPacks(): Promise<StickerPack[]>;
  getStickerPackById(id: string): Promise<StickerPack | null>;
  createStickerPack(title: string, stickerIds: string[], coverCreationId?: string): Promise<StickerPack>;
  toggleSaveStickerPack(packId: string): Promise<boolean>;

  // In-App Notifications & Reports
  getNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  submitReport(input: { targetType: ReportTargetType; targetId: string; category: ReportCategory; notes?: string }): Promise<Report>;

  // Lifecycle, Subscriptions & Reset
  subscribe(listener: StoreEventListener): () => void;
  resetToDefaultSeeds(): void;
  exportPersonalData(): Promise<Record<string, any>>;
}
