-- Campus Connect: core production schema. Apply with `supabase db push`.
create extension if not exists pgcrypto;

create type public.campus_role as enum ('student', 'moderator', 'campus_admin');
create type public.membership_status as enum ('active', 'suspended', 'banned');
create type public.friendship_status as enum ('pending', 'accepted', 'rejected');
create type public.report_category as enum ('harassment', 'impersonation', 'sexual_content', 'hate', 'spam', 'copyright', 'other');
create type public.report_status as enum ('pending', 'reviewed', 'actioned', 'dismissed');
create type public.attachment_kind as enum ('image', 'custom_sticker', 'giphy');
create type public.club_role as enum ('member', 'organizer', 'owner');
create type public.rsvp_status as enum ('going', 'interested');
create type public.conversation_type as enum ('direct', 'group');
create type public.member_invite_status as enum ('pending', 'accepted', 'left', 'removed');
create type public.creation_kind as enum ('meme', 'sticker');
create type public.notification_type as enum ('friend_request', 'friend_accept', 'comment', 'reaction', 'group_invite', 'message', 'event_update', 'moderation');

create table public.campuses (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  created_at timestamptz not null default now()
);
insert into public.campuses (name, slug) values ('Christ University Lavasa', 'christ-lavasa');

create table public.account_identifiers (
  normalized_reg_number text primary key check (normalized_reg_number ~ '^[A-Z0-9-]{4,32}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,24}$'), display_name text not null,
  avatar_url text, bio varchar(160), course text, year_of_study int check (year_of_study between 1 and 5),
  interests text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.account_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  reduce_motion boolean not null default false, read_receipts_enabled boolean not null default false,
  notify_on_comments boolean not null default true, notify_on_reactions boolean not null default true,
  notify_on_friend_requests boolean not null default true, updated_at timestamptz not null default now()
);
create table public.campus_memberships (
  id uuid primary key default gen_random_uuid(), campus_id uuid not null references public.campuses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role public.campus_role not null default 'student',
  status public.membership_status not null default 'active', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique (campus_id, user_id)
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(), requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade, status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint no_self_friendship check (requester_id <> addressee_id),
  constraint unique_friendship_pair unique (least(requester_id, addressee_id), greatest(requester_id, addressee_id))
);
create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade, blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (blocker_id, blocked_id), check (blocker_id <> blocked_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id) on delete cascade,
  category public.report_category not null, notes text, target_type text not null check (target_type in ('profile', 'post', 'comment', 'message', 'pack')),
  target_id uuid not null, status public.report_status not null default 'pending', created_at timestamptz not null default now()
);
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(), moderator_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.reports(id) on delete set null, action text not null check (action in ('warn', 'remove_content', 'suspend_user', 'ban_user', 'dismiss')),
  reason text not null, target_user_id uuid references auth.users(id) on delete cascade, created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(), uploader_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique, bucket text not null default 'media' check (bucket = 'media'), byte_size int not null check (byte_size > 0),
  mime_type text not null, width int not null check (width > 0), height int not null check (height > 0),
  purpose text not null check (purpose in ('avatar', 'post_image', 'sticker', 'meme', 'club_cover', 'event_cover')),
  created_at timestamptz not null default now()
);
create table public.creations (
  id uuid primary key default gen_random_uuid(), creator_id uuid not null references auth.users(id) on delete cascade,
  kind public.creation_kind not null, title text not null, draft_data jsonb not null default '{}'::jsonb,
  rendered_asset_id uuid references public.media_assets(id) on delete set null, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.sticker_packs (
  id uuid primary key default gen_random_uuid(), creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null, cover_creation_id uuid references public.creations(id) on delete set null, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.pack_items (pack_id uuid references public.sticker_packs(id) on delete cascade, creation_id uuid references public.creations(id) on delete cascade, display_order int not null default 0, primary key (pack_id, creation_id));
create table public.saved_packs (user_id uuid references auth.users(id) on delete cascade, pack_id uuid references public.sticker_packs(id) on delete cascade, saved_at timestamptz not null default now(), primary key (user_id, pack_id));

create table public.clubs (
  id uuid primary key default gen_random_uuid(), campus_id uuid not null references public.campuses(id) on delete cascade,
  name text not null, slug text not null unique, description text not null, cover_image_url text, category text not null,
  owner_id uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now()
);
create table public.club_memberships (club_id uuid references public.clubs(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, role public.club_role not null default 'member', joined_at timestamptz not null default now(), primary key (club_id, user_id));
create table public.events (
  id uuid primary key default gen_random_uuid(), club_id uuid references public.clubs(id) on delete cascade,
  campus_id uuid not null references public.campuses(id) on delete cascade, creator_id uuid not null references auth.users(id) on delete restrict,
  title text not null, description text not null, cover_image_url text, starts_at timestamptz not null, ends_at timestamptz not null,
  venue text not null, external_url text, is_cancelled boolean not null default false, created_at timestamptz not null default now(), check (ends_at > starts_at)
);
create table public.event_rsvps (event_id uuid references public.events(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, status public.rsvp_status not null, created_at timestamptz not null default now(), primary key (event_id, user_id));

create table public.posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users(id) on delete cascade,
  campus_id uuid not null references public.campuses(id) on delete cascade, club_id uuid references public.clubs(id) on delete cascade,
  content varchar(2000), is_pinned boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.post_attachments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  kind public.attachment_kind not null, media_asset_id uuid references public.media_assets(id) on delete cascade,
  creation_id uuid references public.creations(id) on delete cascade, giphy_id text, giphy_kind text check (giphy_kind in ('gif', 'sticker')),
  display_order int not null default 0, created_at timestamptz not null default now(),
  check ((kind = 'image' and media_asset_id is not null and creation_id is null and giphy_id is null) or (kind = 'custom_sticker' and creation_id is not null and media_asset_id is null and giphy_id is null) or (kind = 'giphy' and giphy_id is not null and media_asset_id is null and creation_id is null))
);
create table public.comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, author_id uuid not null references auth.users(id) on delete cascade, content varchar(1000) not null, parent_comment_id uuid references public.comments(id) on delete cascade, created_at timestamptz not null default now());
create table public.post_reactions (post_id uuid references public.posts(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, reaction text not null check (reaction in ('like', 'love', 'laugh', 'fire', 'clap')), created_at timestamptz not null default now(), primary key (post_id, user_id));
create table public.bookmarks (user_id uuid references auth.users(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, post_id));
create table public.polls (id uuid primary key default gen_random_uuid(), post_id uuid not null unique references public.posts(id) on delete cascade, question text not null, closes_at timestamptz not null, created_at timestamptz not null default now());
create table public.poll_options (id uuid primary key default gen_random_uuid(), poll_id uuid not null references public.polls(id) on delete cascade, option_text text not null, display_order int not null, unique(poll_id, display_order));
create table public.poll_votes (poll_id uuid references public.polls(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, option_id uuid not null references public.poll_options(id) on delete cascade, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key (poll_id, user_id));

create table public.conversations (id uuid primary key default gen_random_uuid(), type public.conversation_type not null, title text, creator_id uuid not null references auth.users(id) on delete restrict, last_message_at timestamptz not null default now(), created_at timestamptz not null default now(), check ((type = 'direct' and title is null) or type = 'group'));
create table public.direct_conversation_pairs (user_one uuid references auth.users(id) on delete cascade, user_two uuid references auth.users(id) on delete cascade, conversation_id uuid not null unique references public.conversations(id) on delete cascade, primary key(user_one, user_two), check (user_one < user_two));
create table public.conversation_members (conversation_id uuid references public.conversations(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, role text not null default 'member' check (role in ('member','admin')), status public.member_invite_status not null default 'accepted', last_read_at timestamptz not null default now(), joined_at timestamptz not null default now(), primary key(conversation_id,user_id));
create table public.messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade, sender_id uuid not null references auth.users(id) on delete cascade, content varchar(4000), attachment_kind public.attachment_kind, media_asset_id uuid references public.media_assets(id) on delete set null, creation_id uuid references public.creations(id) on delete set null, giphy_id text, created_at timestamptz not null default now(), is_deleted boolean not null default false, check (content is not null or attachment_kind is not null));
create table public.message_reactions (message_id uuid references public.messages(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, emoji text not null, created_at timestamptz not null default now(), primary key(message_id,user_id));
create table public.notifications (id uuid primary key default gen_random_uuid(), recipient_id uuid not null references auth.users(id) on delete cascade, actor_id uuid references auth.users(id) on delete cascade, type public.notification_type not null, destination_url text not null, title text not null, body text, is_read boolean not null default false, dedup_key text, created_at timestamptz not null default now());
create table public.rate_limit_buckets (bucket_key text primary key, tokens int not null check (tokens >= 0), last_replenished_at timestamptz not null default now());
create table public.upload_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, purpose text not null check (purpose in ('avatar','post_image','sticker','meme','club_cover','event_cover')), quarantine_path text not null unique, filename text not null, declared_byte_size int not null check (declared_byte_size > 0), finalized_at timestamptz, expires_at timestamptz not null default now() + interval '2 hours', created_at timestamptz not null default now());

create index idx_profiles_handle on public.profiles(handle); create index idx_profiles_display_name on public.profiles(display_name);
create index idx_posts_campus_created on public.posts(campus_id, created_at desc); create index idx_posts_author on public.posts(author_id);
create index idx_comments_post on public.comments(post_id, created_at); create index idx_messages_conv_created on public.messages(conversation_id, created_at desc);
create index idx_conversation_members_user on public.conversation_members(user_id, status); create index idx_notifications_recipient on public.notifications(recipient_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger settings_updated before update on public.account_settings for each row execute function public.set_updated_at();
create trigger memberships_updated before update on public.campus_memberships for each row execute function public.set_updated_at();
create trigger friendships_updated before update on public.friendships for each row execute function public.set_updated_at();
create trigger posts_updated before update on public.posts for each row execute function public.set_updated_at();
create trigger creations_updated before update on public.creations for each row execute function public.set_updated_at();
create trigger packs_updated before update on public.sticker_packs for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare campus uuid; reg text;
begin
  reg := new.raw_user_meta_data ->> 'normalized_reg_number';
  if reg is null or reg !~ '^[A-Z0-9-]{4,32}$' then raise exception 'Missing valid registration number'; end if;
  select id into campus from public.campuses where slug = 'christ-lavasa';
  if campus is null then raise exception 'Campus seed is missing'; end if;
  insert into public.account_identifiers(normalized_reg_number, user_id) values(reg, new.id);
  insert into public.profiles(id, handle, display_name) values(new.id, 'student_' || substr(replace(new.id::text, '-', ''), 1, 12), 'Campus Student');
  insert into public.account_settings(user_id) values(new.id);
  insert into public.campus_memberships(campus_id, user_id) values(campus, new.id);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_active_student(uid uuid) returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.campus_memberships where user_id = uid and status = 'active'); $$;
create or replace function public.are_blocked(uid_a uuid, uid_b uuid) returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.blocks where (blocker_id=uid_a and blocked_id=uid_b) or (blocker_id=uid_b and blocked_id=uid_a)); $$;
create or replace function public.are_friends(uid_a uuid, uid_b uuid) returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.friendships where status='accepted' and ((requester_id=uid_a and addressee_id=uid_b) or (requester_id=uid_b and addressee_id=uid_a))); $$;
create or replace function public.is_conversation_member(conv_id uuid, uid uuid) returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.conversation_members where conversation_id=conv_id and user_id=uid and status='accepted'); $$;
create or replace function public.is_club_organizer(club uuid, uid uuid) returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.club_memberships where club_id=club and user_id=uid and role in ('organizer','owner')); $$;
create or replace function public.is_campus_admin(uid uuid) returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from public.campus_memberships where user_id=uid and role='campus_admin' and status='active'); $$;

-- All tables are deny-by-default; the policies below only expose authorized rows.
alter table public.campuses enable row level security; alter table public.account_identifiers enable row level security; alter table public.profiles enable row level security; alter table public.account_settings enable row level security; alter table public.campus_memberships enable row level security; alter table public.friendships enable row level security; alter table public.blocks enable row level security; alter table public.reports enable row level security; alter table public.moderation_actions enable row level security; alter table public.media_assets enable row level security; alter table public.creations enable row level security; alter table public.sticker_packs enable row level security; alter table public.pack_items enable row level security; alter table public.saved_packs enable row level security; alter table public.clubs enable row level security; alter table public.club_memberships enable row level security; alter table public.events enable row level security; alter table public.event_rsvps enable row level security; alter table public.posts enable row level security; alter table public.post_attachments enable row level security; alter table public.comments enable row level security; alter table public.post_reactions enable row level security; alter table public.bookmarks enable row level security; alter table public.polls enable row level security; alter table public.poll_options enable row level security; alter table public.poll_votes enable row level security; alter table public.conversations enable row level security; alter table public.direct_conversation_pairs enable row level security; alter table public.conversation_members enable row level security; alter table public.messages enable row level security; alter table public.message_reactions enable row level security; alter table public.notifications enable row level security; alter table public.rate_limit_buckets enable row level security; alter table public.upload_sessions enable row level security;

create policy campuses_read on public.campuses for select to authenticated using (public.is_active_student(auth.uid()));
create policy profiles_read on public.profiles for select to authenticated using (public.is_active_student(auth.uid()) and not public.are_blocked(auth.uid(), id));
create policy profiles_update on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy settings_self on public.account_settings for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy memberships_self on public.campus_memberships for select to authenticated using (user_id=auth.uid());
create policy friendships_read on public.friendships for select to authenticated using (auth.uid() in (requester_id, addressee_id));
create policy friendships_insert on public.friendships for insert to authenticated with check (requester_id=auth.uid() and public.is_active_student(auth.uid()) and not public.are_blocked(auth.uid(),addressee_id));
create policy friendships_update on public.friendships for update to authenticated using (auth.uid() in (requester_id,addressee_id)) with check (auth.uid() in (requester_id,addressee_id));
create policy friendships_delete on public.friendships for delete to authenticated using (auth.uid() in (requester_id,addressee_id));
create policy blocks_self on public.blocks for all to authenticated using (blocker_id=auth.uid()) with check (blocker_id=auth.uid());
create policy reports_own on public.reports for insert to authenticated with check (reporter_id=auth.uid()); create policy reports_read on public.reports for select to authenticated using (reporter_id=auth.uid() or public.is_campus_admin(auth.uid()));
create policy assets_owner on public.media_assets for select to authenticated using (uploader_id=auth.uid());
create policy creations_access on public.creations for select to authenticated using (creator_id=auth.uid() or is_published); create policy creations_owner on public.creations for insert to authenticated with check (creator_id=auth.uid()); create policy creations_manage on public.creations for update to authenticated using (creator_id=auth.uid()) with check (creator_id=auth.uid()); create policy creations_delete on public.creations for delete to authenticated using (creator_id=auth.uid());
create policy packs_access on public.sticker_packs for select to authenticated using (creator_id=auth.uid() or is_published); create policy packs_owner on public.sticker_packs for all to authenticated using (creator_id=auth.uid()) with check (creator_id=auth.uid());
create policy clubs_read on public.clubs for select to authenticated using (public.is_active_student(auth.uid())); create policy clubs_create on public.clubs for insert to authenticated with check (owner_id=auth.uid() and public.is_active_student(auth.uid())); create policy clubs_update on public.clubs for update to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy club_members_read on public.club_memberships for select to authenticated using (public.is_active_student(auth.uid())); create policy club_members_join on public.club_memberships for insert to authenticated with check (user_id=auth.uid()); create policy club_members_leave on public.club_memberships for delete to authenticated using (user_id=auth.uid());
create policy events_read on public.events for select to authenticated using (public.is_active_student(auth.uid())); create policy events_create on public.events for insert to authenticated with check (creator_id=auth.uid() and (club_id is null or public.is_club_organizer(club_id,auth.uid()))); create policy events_manage on public.events for update to authenticated using (creator_id=auth.uid() or (club_id is not null and public.is_club_organizer(club_id,auth.uid())));
create policy rsvps_read on public.event_rsvps for select to authenticated using (public.is_active_student(auth.uid())); create policy rsvps_self on public.event_rsvps for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy posts_read on public.posts for select to authenticated using (public.is_active_student(auth.uid()) and not public.are_blocked(auth.uid(),author_id)); create policy posts_create on public.posts for insert to authenticated with check (author_id=auth.uid() and public.is_active_student(auth.uid())); create policy posts_update on public.posts for update to authenticated using (author_id=auth.uid()) with check (author_id=auth.uid()); create policy posts_delete on public.posts for delete to authenticated using (author_id=auth.uid() or public.is_campus_admin(auth.uid()));
create policy attachments_read on public.post_attachments for select to authenticated using (exists(select 1 from public.posts p where p.id=post_id and public.is_active_student(auth.uid()) and not public.are_blocked(auth.uid(),p.author_id))); create policy attachments_manage on public.post_attachments for all to authenticated using (exists(select 1 from public.posts p where p.id=post_id and p.author_id=auth.uid())) with check (exists(select 1 from public.posts p where p.id=post_id and p.author_id=auth.uid()));
create policy comments_read on public.comments for select to authenticated using (not public.are_blocked(auth.uid(),author_id)); create policy comments_create on public.comments for insert to authenticated with check (author_id=auth.uid()); create policy comments_update on public.comments for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid()); create policy comments_delete on public.comments for delete to authenticated using(author_id=auth.uid() or exists(select 1 from public.posts where id=post_id and author_id=auth.uid()));
create policy reactions_read on public.post_reactions for select to authenticated using (true); create policy reactions_self on public.post_reactions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid()); create policy bookmarks_self on public.bookmarks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy polls_read on public.polls for select to authenticated using(true); create policy options_read on public.poll_options for select to authenticated using(true); create policy votes_read on public.poll_votes for select to authenticated using(public.is_active_student(auth.uid())); create policy votes_self on public.poll_votes for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy conversations_read on public.conversations for select to authenticated using(public.is_conversation_member(id,auth.uid())); create policy members_read on public.conversation_members for select to authenticated using(public.is_conversation_member(conversation_id,auth.uid())); create policy members_self_update on public.conversation_members for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy messages_read on public.messages for select to authenticated using(public.is_conversation_member(conversation_id,auth.uid()) and not public.are_blocked(auth.uid(),sender_id)); create policy messages_create on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.is_conversation_member(conversation_id,auth.uid())); create policy messages_update on public.messages for update to authenticated using(sender_id=auth.uid()) with check(sender_id=auth.uid()); create policy reactions_messages_read on public.message_reactions for select to authenticated using(exists(select 1 from public.messages m where m.id=message_id and public.is_conversation_member(m.conversation_id,auth.uid()))); create policy reactions_messages_self on public.message_reactions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy notifications_self on public.notifications for select to authenticated using(recipient_id=auth.uid()); create policy notifications_update on public.notifications for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
create policy upload_sessions_self on public.upload_sessions for select to authenticated using(user_id=auth.uid());

-- Private buckets. Browser uploads are restricted to a user's own temporary prefix.
insert into storage.buckets(id, name, public) values ('quarantine','quarantine',false),('media','media',false) on conflict (id) do update set public=false;
create policy quarantine_insert on storage.objects for insert to authenticated with check (bucket_id='quarantine' and (storage.foldername(name))[1]=auth.uid()::text);
create policy quarantine_select on storage.objects for select to authenticated using (bucket_id='quarantine' and (storage.foldername(name))[1]=auth.uid()::text);
create policy quarantine_delete on storage.objects for delete to authenticated using (bucket_id='quarantine' and (storage.foldername(name))[1]=auth.uid()::text);

alter publication supabase_realtime add table public.messages; alter publication supabase_realtime add table public.message_reactions; alter publication supabase_realtime add table public.notifications; alter publication supabase_realtime add table public.conversation_members;
