// ============================================================================
// File: src/lib/mock-store/fixtures.ts
// Campus Connect - Rich Seed Fixtures for Christ University Lavasa
// ============================================================================

import {
  Campus,
  UserAccount,
  Profile,
  AccountSettings,
  Friendship,
  Post,
  Comment,
  Poll,
  Club,
  ClubMembership,
  CampusEvent,
  EventRsvp,
  Conversation,
  Message,
  Creation,
  StickerPack,
  Notification
} from './types';

// ----------------------------------------------------------------------------
// 1. Campus Details
// ----------------------------------------------------------------------------
export const SEED_CAMPUS: Campus = {
  id: 'campus_christ_lavasa',
  name: 'Christ University Lavasa',
  slug: 'christ-lavasa',
  createdAt: '2026-01-01T00:00:00Z',
};

// ----------------------------------------------------------------------------
// 2. Student Accounts & Profiles
// ----------------------------------------------------------------------------
export const SEED_USERS: UserAccount[] = [
  {
    id: 'usr_arnav_s',
    normalizedRegNumber: '2441001',
    passwordHash: 'password123',
    recoveryEmail: 'arnav.sharma@example.com',
    recoveryEmailVerified: true,
    recoveryEmailStatus: 'verified',
    role: 'student',
    status: 'active',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'usr_priya_k',
    normalizedRegNumber: '2441014',
    passwordHash: 'password123',
    recoveryEmailStatus: 'not_added',
    recoveryEmailVerified: false,
    role: 'student',
    status: 'active',
    createdAt: '2026-08-16T11:00:00Z',
  },
  {
    id: 'usr_rahul_v',
    normalizedRegNumber: '2441028',
    passwordHash: 'password123',
    recoveryEmailStatus: 'awaiting_verification',
    recoveryEmail: 'rahul.v@example.com',
    recoveryEmailVerified: false,
    role: 'student',
    status: 'active',
    createdAt: '2026-08-17T09:30:00Z',
  },
  {
    id: 'usr_sneha_m',
    normalizedRegNumber: '2341052',
    passwordHash: 'password123',
    recoveryEmailStatus: 'verified',
    recoveryEmail: 'sneha.menon@example.com',
    recoveryEmailVerified: true,
    role: 'student',
    status: 'active',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'usr_tanmay_r',
    normalizedRegNumber: '2341088',
    passwordHash: 'password123',
    recoveryEmailStatus: 'not_added',
    recoveryEmailVerified: false,
    role: 'student',
    status: 'active',
    createdAt: '2026-08-12T14:20:00Z',
  },
  {
    id: 'usr_ananya_d',
    normalizedRegNumber: '2441095',
    passwordHash: 'password123',
    recoveryEmailStatus: 'not_added',
    recoveryEmailVerified: false,
    role: 'student',
    status: 'active',
    createdAt: '2026-08-18T16:00:00Z',
  },
  {
    id: 'usr_campus_admin',
    normalizedRegNumber: 'ADMIN001',
    passwordHash: 'adminpassword',
    recoveryEmail: 'admin.lavasa@christuniversity.in',
    recoveryEmailVerified: true,
    recoveryEmailStatus: 'verified',
    role: 'campus_admin',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const SEED_PROFILES: Profile[] = [
  {
    id: 'usr_arnav_s',
    handle: 'arnav_s',
    displayName: 'Arnav Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'BSc Data Science 2nd Year. Building fun things, surviving 8:30 AM fog, and hunting for good filter coffee.',
    course: 'BSc Data Science',
    yearOfStudy: 2,
    interests: ['coding', 'ai', 'memes', 'coffee'],
    createdAt: '2026-08-15T10:05:00Z',
    updatedAt: '2026-10-25T14:00:00Z',
  },
  {
    id: 'usr_priya_k',
    handle: 'priya_k',
    displayName: 'Priya Kulkarni',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'BBA 3rd Year. Literary Society lead. Tea enthusiast and campus sunset watcher.',
    course: 'BBA',
    yearOfStudy: 3,
    interests: ['literature', 'dance', 'design', 'poetry'],
    createdAt: '2026-08-16T11:05:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'usr_rahul_v',
    handle: 'rahul_v',
    displayName: 'Rahul Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'BCA 1st Year. Full-stack noob, gamer, and Lavasa stair climber.',
    course: 'BCA',
    yearOfStudy: 1,
    interests: ['gaming', 'coding', 'tech', 'esports'],
    createdAt: '2026-08-17T09:35:00Z',
    updatedAt: '2026-10-22T12:00:00Z',
  },
  {
    id: 'usr_sneha_m',
    handle: 'sneha_m',
    displayName: 'Sneha Menon',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    bio: 'BSc AI & ML 3rd Year. Coding Club Lavasa Lead. GDG campus mentor.',
    course: 'BSc AI & ML',
    yearOfStudy: 3,
    interests: ['ai', 'robotics', 'photography', 'hackathons'],
    createdAt: '2026-08-10T08:05:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'usr_tanmay_r',
    handle: 'tanmay_r',
    displayName: 'Tanmay Rao',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'MBA 2nd Year. Rotaract Club President. Organizing campus initiatives.',
    course: 'MBA',
    yearOfStudy: 2,
    interests: ['leadership', 'community', 'sports', 'football'],
    createdAt: '2026-08-12T14:25:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'usr_ananya_d',
    handle: 'ananya_d',
    displayName: 'Ananya Deshmukh',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    bio: 'B.Com 2nd Year. Melodica Music Club coordinator. Acoustic guitars and rain.',
    course: 'B.Com',
    yearOfStudy: 2,
    interests: ['music', 'singing', 'guitar', 'art'],
    createdAt: '2026-08-18T16:05:00Z',
    updatedAt: '2026-10-24T18:00:00Z',
  },
  {
    id: 'usr_campus_admin',
    handle: 'campus_admin',
    displayName: 'Campus Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150',
    bio: 'Official Announcements and Campus Information Hub for Christ University Lavasa.',
    course: 'Administration',
    yearOfStudy: 5,
    interests: ['announcements', 'campus', 'events'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const SEED_SETTINGS: AccountSettings[] = SEED_USERS.map((u) => ({
  userId: u.id,
  theme: 'light',
  reduceMotion: false,
  readReceiptsEnabled: false,
  notifyOnComments: true,
  notifyOnReactions: true,
  notifyOnFriendRequests: true,
  notifyOnEventUpdates: true,
  updatedAt: '2026-08-20T00:00:00Z',
}));

// ----------------------------------------------------------------------------
// 3. Friendships & Relationships
// ----------------------------------------------------------------------------
export const SEED_FRIENDSHIPS: Friendship[] = [
  {
    id: 'fr_arnav_priya',
    requesterId: 'usr_arnav_s',
    addresseeId: 'usr_priya_k',
    status: 'accepted',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:15:00Z',
  },
  {
    id: 'fr_arnav_rahul',
    requesterId: 'usr_rahul_v',
    addresseeId: 'usr_arnav_s',
    status: 'accepted',
    createdAt: '2026-08-21T14:00:00Z',
    updatedAt: '2026-08-21T14:30:00Z',
  },
  {
    id: 'fr_arnav_sneha',
    requesterId: 'usr_arnav_s',
    addresseeId: 'usr_sneha_m',
    status: 'accepted',
    createdAt: '2026-08-22T09:00:00Z',
    updatedAt: '2026-08-22T09:10:00Z',
  },
  {
    id: 'fr_arnav_tanmay',
    requesterId: 'usr_tanmay_r',
    addresseeId: 'usr_arnav_s',
    status: 'pending',
    createdAt: '2026-10-30T16:00:00Z',
    updatedAt: '2026-10-30T16:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// 4. Clubs & Memberships
// ----------------------------------------------------------------------------
export const SEED_CLUBS: Club[] = [
  {
    id: 'club_coding',
    campusId: 'campus_christ_lavasa',
    name: 'Coding Club Lavasa',
    slug: 'coding-club',
    description: 'The premier community for developers, competitive programmers, and open-source contributors at Christ Lavasa.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    category: 'Tech & Coding',
    ownerId: 'usr_sneha_m',
    memberCount: 128,
    isJoined: true,
    userRole: 'member',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'club_literary',
    campusId: 'campus_christ_lavasa',
    name: 'Lavasa Literary Society',
    slug: 'literary-society',
    description: 'Celebrating poetry, campus debates, storytelling, and creative writing amidst the hills.',
    coverImageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800',
    category: 'Literary',
    ownerId: 'usr_priya_k',
    memberCount: 84,
    isJoined: false,
    createdAt: '2026-08-02T00:00:00Z',
  },
  {
    id: 'club_melodica',
    campusId: 'campus_christ_lavasa',
    name: 'Melodica Music Club',
    slug: 'melodica',
    description: 'Uniting acoustic enthusiasts, vocalists, and instrumentalists for campus jam sessions and open mics.',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    category: 'Arts & Culture',
    ownerId: 'usr_ananya_d',
    memberCount: 96,
    isJoined: false,
    createdAt: '2026-08-03T00:00:00Z',
  },
  {
    id: 'club_rotaract',
    campusId: 'campus_christ_lavasa',
    name: 'Rotaract Club of Lavasa',
    slug: 'rotaract',
    description: 'Youth-led community outreach, social impact drives, and leadership development.',
    coverImageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    category: 'Social & Community',
    ownerId: 'usr_tanmay_r',
    memberCount: 142,
    isJoined: false,
    createdAt: '2026-08-04T00:00:00Z',
  },
];

export const SEED_CLUB_MEMBERSHIPS: ClubMembership[] = [
  { clubId: 'club_coding', userId: 'usr_sneha_m', role: 'owner', joinedAt: '2026-08-01T00:00:00Z' },
  { clubId: 'club_coding', userId: 'usr_arnav_s', role: 'member', joinedAt: '2026-08-20T00:00:00Z' },
  { clubId: 'club_coding', userId: 'usr_rahul_v', role: 'member', joinedAt: '2026-08-22T00:00:00Z' },
  { clubId: 'club_literary', userId: 'usr_priya_k', role: 'owner', joinedAt: '2026-08-02T00:00:00Z' },
  { clubId: 'club_melodica', userId: 'usr_ananya_d', role: 'owner', joinedAt: '2026-08-03T00:00:00Z' },
  { clubId: 'club_rotaract', userId: 'usr_tanmay_r', role: 'owner', joinedAt: '2026-08-04T00:00:00Z' },
];

// ----------------------------------------------------------------------------
// 5. Campus Events
// ----------------------------------------------------------------------------
export const SEED_EVENTS: CampusEvent[] = [
  {
    id: 'evt_hacklavasa',
    campusId: 'campus_christ_lavasa',
    clubId: 'club_coding',
    creatorId: 'usr_sneha_m',
    title: 'HackLavasa 2026: 24-Hour Campus Hackathon',
    description: 'Form a squad of 2-4 and build campus-first applications, AI tools, or hardware hacks. Free refreshments, midnight snacks, and sticker packs for all participants!',
    coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    startsAt: '2026-11-07T03:30:00Z', // 09:00 IST
    endsAt: '2026-11-08T03:30:00Z',
    venue: 'Central Block Auditorium 2 & Innovation Lab',
    externalUrl: 'https://hacklavasa.example.org',
    isCancelled: false,
    rsvpsCount: { going: 46, interested: 82 },
    userRsvp: 'going',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'evt_acoustic_night',
    campusId: 'campus_christ_lavasa',
    clubId: 'club_melodica',
    creatorId: 'usr_ananya_d',
    title: 'Melodica Open-Air Acoustic Night',
    description: 'Unplugged musical performances under the stars at the campus amphitheatre. Acoustic sets, chai, and student jam sessions.',
    coverImageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    startsAt: '2026-11-04T13:00:00Z', // 18:30 IST
    endsAt: '2026-11-04T15:30:00Z',
    venue: 'Lakefront Amphitheatre',
    isCancelled: false,
    rsvpsCount: { going: 78, interested: 114 },
    userRsvp: 'interested',
    createdAt: '2026-10-22T12:00:00Z',
  },
  {
    id: 'evt_chai_meetup',
    campusId: 'campus_christ_lavasa',
    clubId: 'club_literary',
    creatorId: 'usr_priya_k',
    title: 'Literature & Cutting Chai Reading Session',
    description: 'Casual reading circle. Bring your favorite poetry or original prose excerpt. Warm cutting chai provided.',
    coverImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    startsAt: '2026-11-02T10:30:00Z', // 16:00 IST
    endsAt: '2026-11-02T12:30:00Z',
    venue: 'Central Lawn Gazebo',
    isCancelled: false,
    rsvpsCount: { going: 29, interested: 41 },
    createdAt: '2026-10-25T15:00:00Z',
  },
];

export const SEED_EVENT_RSVPS: EventRsvp[] = [
  { eventId: 'evt_hacklavasa', userId: 'usr_arnav_s', status: 'going', createdAt: '2026-10-25T11:00:00Z' },
  { eventId: 'evt_acoustic_night', userId: 'usr_arnav_s', status: 'interested', createdAt: '2026-10-26T09:00:00Z' },
];

// ----------------------------------------------------------------------------
// 6. Posts, Polls, Comments & Reactions
// ----------------------------------------------------------------------------
export const SEED_POLL: Poll = {
  id: 'poll_fog_stress',
  postId: 'post_fog_poll',
  question: 'Is the Central Block 8:30 AM fog getting thicker, or is it just end-sem stress?',
  closesAt: '2026-11-05T18:30:00Z',
  totalVotes: 64,
  userVotedOptionId: 'opt_both',
  isClosed: false,
  options: [
    { id: 'opt_fog', pollId: 'poll_fog_stress', optionText: 'Definitely mountain fog 🌫️', displayOrder: 0, voteCount: 14 },
    { id: 'opt_stress', pollId: 'poll_fog_stress', optionText: 'Pure end-sem sleep deprivation 🥱', displayOrder: 1, voteCount: 18 },
    { id: 'opt_both', pollId: 'poll_fog_stress', optionText: 'Both, heavily compounded 💀', displayOrder: 2, voteCount: 32 },
  ],
};

export const SEED_POSTS: Post[] = [
  {
    id: 'post_admin_announcement',
    authorId: 'usr_campus_admin',
    campusId: 'campus_christ_lavasa',
    content: '📌 CAMPUS NOTICE: Extended Library Hours for End-Semester Preparation.\n\nFrom November 1st, the Central Library will remain open until 11:00 PM on weekdays. Please carry your physical student ID card for entry after 8:00 PM. Night shuttle services between Central Block and lakeside hostels will run every 30 minutes.',
    isPinned: true,
    attachments: [],
    reactions: { like: 42, love: 12, laugh: 0, fire: 8, clap: 19 },
    commentsCount: 6,
    isBookmarked: true,
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'post_fog_poll',
    authorId: 'usr_arnav_s',
    campusId: 'campus_christ_lavasa',
    content: 'Cannot see more than 10 meters ahead from the Central Block stairs today. Vote below: #LavasaWeather #CampusLife',
    isPinned: false,
    attachments: [],
    poll: SEED_POLL,
    reactions: { like: 24, love: 5, laugh: 38, fire: 2, clap: 7 },
    userReaction: 'laugh',
    commentsCount: 8,
    isBookmarked: false,
    createdAt: '2026-10-30T03:15:00Z', // 8:45 AM IST
    updatedAt: '2026-10-30T03:15:00Z',
  },
  {
    id: 'post_stair_meme',
    authorId: 'usr_rahul_v',
    campusId: 'campus_christ_lavasa',
    content: 'POV: You sprinted up the Lavasa Central Block steps with 2 minutes left to make 85% attendance. My legs will never recover. 😂 #LavasaFitness #AttendanceRush',
    isPinned: false,
    attachments: [
      {
        id: 'att_stair_img',
        postId: 'post_stair_meme',
        kind: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800',
        displayOrder: 0,
      },
    ],
    reactions: { like: 31, love: 4, laugh: 52, fire: 14, clap: 9 },
    userReaction: 'fire',
    commentsCount: 11,
    isBookmarked: true,
    createdAt: '2026-10-29T04:00:00Z',
    updatedAt: '2026-10-29T04:00:00Z',
  },
  {
    id: 'post_hackathon_teaser',
    authorId: 'usr_sneha_m',
    campusId: 'campus_christ_lavasa',
    clubId: 'club_coding',
    content: 'Registrations for HackLavasa 2026 are officially OPEN! 🚀 24 hours of hacking, custom sticker packs, and cash prizes for top three campus solutions. Check the Events tab to RSVP or find teammates! #HackLavasa #CodingClub',
    isPinned: false,
    attachments: [
      {
        id: 'att_hack_banner',
        postId: 'post_hackathon_teaser',
        kind: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        displayOrder: 0,
      },
    ],
    reactions: { like: 58, love: 22, laugh: 1, fire: 45, clap: 33 },
    userReaction: 'like',
    commentsCount: 14,
    isBookmarked: true,
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'post_lit_chai',
    authorId: 'usr_priya_k',
    campusId: 'campus_christ_lavasa',
    clubId: 'club_literary',
    content: 'Foggy afternoons and hot cutting chai at the gazebo. Join the Literary Society this Monday at 4:00 PM for our informal reading circle! ☕📖 #LiteratureSociety #LavasaDiaries',
    isPinned: false,
    attachments: [],
    reactions: { like: 26, love: 18, laugh: 0, fire: 3, clap: 12 },
    commentsCount: 4,
    isBookmarked: false,
    createdAt: '2026-10-26T11:00:00Z',
    updatedAt: '2026-10-26T11:00:00Z',
  },
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'cmt_1',
    postId: 'post_admin_announcement',
    authorId: 'usr_arnav_s',
    content: 'Does the 11 PM timing also apply to the digital lab on the 3rd floor?',
    createdAt: '2026-10-28T09:30:00Z',
  },
  {
    id: 'cmt_2',
    postId: 'post_admin_announcement',
    authorId: 'usr_campus_admin',
    content: '@arnav_s Yes, all labs in Central Block will follow extended hours during the revision period.',
    parentCommentId: 'cmt_1',
    createdAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'cmt_3',
    postId: 'post_fog_poll',
    authorId: 'usr_priya_k',
    content: 'Option 3 without hesitation. I couldn’t even find the lakeside bridge this morning!',
    createdAt: '2026-10-30T03:30:00Z',
  },
  {
    id: 'cmt_4',
    postId: 'post_stair_meme',
    authorId: 'usr_arnav_s',
    content: 'The real challenge is when the biometric scanner takes 3 attempts while the clock hits 8:29 AM.',
    createdAt: '2026-10-29T04:20:00Z',
  },
  {
    id: 'cmt_5',
    postId: 'post_hackathon_teaser',
    authorId: 'usr_rahul_v',
    content: 'Looking for 1 frontend dev to team up for HackLavasa! DM me.',
    createdAt: '2026-10-27T10:45:00Z',
  },
];

// ----------------------------------------------------------------------------
// 7. Messaging Conversations & Messages
// ----------------------------------------------------------------------------
export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_arnav_priya',
    type: 'direct',
    creatorId: 'usr_arnav_s',
    lastMessageAt: '2026-10-30T14:25:00Z',
    lastMessagePreview: 'See you at the gazebo reading session!',
    unreadCount: 0,
    members: [
      { conversationId: 'conv_arnav_priya', userId: 'usr_arnav_s', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T14:26:00Z', joinedAt: '2026-08-20T10:15:00Z' },
      { conversationId: 'conv_arnav_priya', userId: 'usr_priya_k', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T14:25:00Z', joinedAt: '2026-08-20T10:15:00Z' },
    ],
  },
  {
    id: 'conv_arnav_rahul',
    type: 'direct',
    creatorId: 'usr_rahul_v',
    lastMessageAt: '2026-10-30T15:10:00Z',
    lastMessagePreview: 'Did you submit the data science assignment?',
    unreadCount: 1,
    members: [
      { conversationId: 'conv_arnav_rahul', userId: 'usr_arnav_s', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T14:00:00Z', joinedAt: '2026-08-21T14:30:00Z' },
      { conversationId: 'conv_arnav_rahul', userId: 'usr_rahul_v', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T15:10:00Z', joinedAt: '2026-08-21T14:30:00Z' },
    ],
  },
  {
    id: 'conv_central_survivors',
    type: 'group',
    title: 'Central Block Survivors ⛰️',
    creatorId: 'usr_arnav_s',
    lastMessageAt: '2026-10-30T12:00:00Z',
    lastMessagePreview: 'Sneha: Hackathon registration link is live!',
    unreadCount: 0,
    members: [
      { conversationId: 'conv_central_survivors', userId: 'usr_arnav_s', role: 'admin', status: 'accepted', lastReadAt: '2026-10-30T12:05:00Z', joinedAt: '2026-09-01T00:00:00Z' },
      { conversationId: 'conv_central_survivors', userId: 'usr_priya_k', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T12:00:00Z', joinedAt: '2026-09-01T00:00:00Z' },
      { conversationId: 'conv_central_survivors', userId: 'usr_rahul_v', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T12:00:00Z', joinedAt: '2026-09-01T00:00:00Z' },
      { conversationId: 'conv_central_survivors', userId: 'usr_sneha_m', role: 'member', status: 'accepted', lastReadAt: '2026-10-30T12:00:00Z', joinedAt: '2026-09-01T00:00:00Z' },
    ],
  },
];

export const SEED_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_arnav_priya',
    senderId: 'usr_priya_k',
    content: 'Hey Arnav! Are you coming for the chai and reading session on Monday?',
    createdAt: '2026-10-30T14:15:00Z',
    isDeleted: false,
    reactions: [],
  },
  {
    id: 'msg_2',
    conversationId: 'conv_arnav_priya',
    senderId: 'usr_arnav_s',
    content: 'Definitely! I have an excerpt ready. See you at the gazebo reading session!',
    createdAt: '2026-10-30T14:25:00Z',
    isDeleted: false,
    reactions: [{ messageId: 'msg_2', userId: 'usr_priya_k', emoji: '❤️' }],
  },
  {
    id: 'msg_3',
    conversationId: 'conv_arnav_rahul',
    senderId: 'usr_rahul_v',
    content: 'Did you submit the data science assignment?',
    createdAt: '2026-10-30T15:10:00Z',
    isDeleted: false,
    reactions: [],
  },
  {
    id: 'msg_4',
    conversationId: 'conv_central_survivors',
    senderId: 'usr_sneha_m',
    content: 'Hackathon registration link is live! Let me know if anyone needs mentors for their ideas.',
    createdAt: '2026-10-30T12:00:00Z',
    isDeleted: false,
    reactions: [{ messageId: 'msg_4', userId: 'usr_arnav_s', emoji: '🔥' }],
  },
];

// ----------------------------------------------------------------------------
// 8. Studio Creations & Sticker Packs
// ----------------------------------------------------------------------------
export const SEED_CREATIONS: Creation[] = [
  {
    id: 'cr_fog_warning',
    creatorId: 'usr_arnav_s',
    kind: 'sticker',
    title: 'Lavasa Fog Warning 🌫️',
    draftData: {
      version: 1,
      mode: 'sticker',
      aspectRatio: '1:1',
      layers: [
        {
          id: 'lyr_1',
          type: 'text',
          content: 'VISIBILITY: 0%',
          x: 50,
          y: 200,
          width: 412,
          height: 60,
          rotation: 0,
          fontSize: 36,
          fill: '#20241E',
          stroke: '#D9F36B',
          strokeWidth: 2,
        },
      ],
    },
    renderedImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=512',
    isPublished: true,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'cr_attendance_saved',
    creatorId: 'usr_rahul_v',
    kind: 'sticker',
    title: '85% Attendance Saved Me',
    draftData: {
      version: 1,
      mode: 'sticker',
      aspectRatio: '1:1',
      layers: [
        {
          id: 'lyr_2',
          type: 'text',
          content: '85.1% SAFE 🛡️',
          x: 60,
          y: 220,
          width: 390,
          height: 50,
          rotation: -5,
          fontSize: 32,
          fill: '#D9F36B',
          stroke: '#20241E',
          strokeWidth: 3,
        },
      ],
    },
    renderedImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=512',
    isPublished: true,
    createdAt: '2026-10-22T14:00:00Z',
    updatedAt: '2026-10-22T14:00:00Z',
  },
  {
    id: 'cr_chai_sticker',
    creatorId: 'usr_priya_k',
    kind: 'sticker',
    title: 'Gazebo Chai Time',
    draftData: {
      version: 1,
      mode: 'sticker',
      aspectRatio: '1:1',
      layers: [
        {
          id: 'lyr_3',
          type: 'text',
          content: 'Cutting Chai Only ☕',
          x: 70,
          y: 240,
          width: 370,
          height: 48,
          rotation: 0,
          fontSize: 30,
          fill: '#F26457',
        },
      ],
    },
    renderedImageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=512',
    isPublished: true,
    createdAt: '2026-10-24T16:00:00Z',
    updatedAt: '2026-10-24T16:00:00Z',
  },
];

export const SEED_STICKER_PACKS: StickerPack[] = [
  {
    id: 'pack_lavasa_essentials',
    creatorId: 'usr_arnav_s',
    title: 'Lavasa Essentials Pack',
    coverCreationId: 'cr_fog_warning',
    coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=512',
    stickers: SEED_CREATIONS,
    isPublished: true,
    isSaved: true,
    createdAt: '2026-10-24T18:00:00Z',
    updatedAt: '2026-10-24T18:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// 9. Notifications
// ----------------------------------------------------------------------------
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    recipientId: 'usr_arnav_s',
    actorId: 'usr_priya_k',
    type: 'reaction',
    destinationUrl: '/posts/post_fog_poll',
    title: 'Priya Kulkarni reacted to your poll',
    body: 'Priya reacted with 😆: "Is the Central Block 8:30 AM fog getting thicker..."',
    isRead: false,
    createdAt: '2026-10-30T03:35:00Z',
  },
  {
    id: 'notif_2',
    recipientId: 'usr_arnav_s',
    actorId: 'usr_campus_admin',
    type: 'comment',
    destinationUrl: '/posts/post_admin_announcement',
    title: 'Campus Administration replied to your comment',
    body: '"Yes, all labs in Central Block will follow extended hours..."',
    isRead: false,
    createdAt: '2026-10-28T10:01:00Z',
  },
  {
    id: 'notif_3',
    recipientId: 'usr_arnav_s',
    actorId: 'usr_tanmay_r',
    type: 'friend_request',
    destinationUrl: '/people/tanmay_r',
    title: 'Tanmay Rao sent you a friend request',
    body: 'MBA 2nd Year • President, Rotaract Club',
    isRead: true,
    createdAt: '2026-10-30T16:00:00Z',
  },
  {
    id: 'notif_4',
    recipientId: 'usr_arnav_s',
    actorId: 'usr_sneha_m',
    type: 'event_update',
    destinationUrl: '/events/evt_hacklavasa',
    title: 'HackLavasa 2026 schedule published',
    body: 'Coding Club announced the hackathon problem tracks.',
    isRead: true,
    createdAt: '2026-10-29T11:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// 10. Trending Tags
// ----------------------------------------------------------------------------
export const SEED_TRENDING_TAGS = [
  '#HackLavasa',
  '#CentralBlock',
  '#CampusWeather',
  '#EndSemExams',
  '#AttendanceRush',
  '#MelodicaNights',
  '#LiteratureSociety',
];
