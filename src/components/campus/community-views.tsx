"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Compass, MapPin, Search, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useMockStore } from "@/lib/mock-store/context";
import type { CampusEvent, Club, SearchFilter, SearchResults } from "@/lib/mock-store/types";
import { formatCampusDate } from "@/lib/utils";

type Props = {
  section: "discover" | "clubs" | "events";
  slug?: string;
  onError: (message: string) => void;
};

const emptyResults: SearchResults = { people: [], clubs: [], events: [], posts: [], tags: [] };

export function CommunityViews({ section, slug, onError }: Props) {
  const { store, currentUser } = useMockStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [category, setCategory] = useState("All clubs");
  const [eventFilter, setEventFilter] = useState("Upcoming");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") || "");
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    const load = async () => {
      try {
        const [nextClubs, nextEvents] = await Promise.all([store.getClubs(), store.getEvents()]);
        if (!active) return;
        setClubs(nextClubs);
        setEvents(nextEvents.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)));
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load your campus. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const unsubscribe = store.subscribe(event => {
      if (event.type === "CLUBS_CHANGE" || event.type === "EVENTS_CHANGE") void load();
    });
    return () => { active = false; unsubscribe(); };
  }, [store, currentUser?.id, retry]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(emptyResults);
      setSearching(false);
      setSearchError("");
      return;
    }
    let active = true;
    setSearching(true);
    setSearchError("");
    const timeout = window.setTimeout(async () => {
      try {
        const next = await store.search(query.replace(/^#/, ""), filter);
        if (active) setResults(next);
      } catch (error) {
        if (active) setSearchError(error instanceof Error ? error.message : "Search is unavailable. Try again.");
      } finally {
        if (active) setSearching(false);
      }
    }, 350);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [store, query, filter, retry]);

  async function toggle(kind: "club" | "event", id: string, status: "going" | "interested" = "going") {
    setPending(items => [...items, id]);
    try {
      if (kind === "club") await store.toggleClubMembership(id);
      else await store.toggleEventRsvp(id, status);
    } catch (error) {
      onError(error instanceof Error ? error.message : "That did not save. Please try again.");
    } finally {
      setPending(items => items.filter(item => item !== id));
    }
  }

  const clubButton = (club: Club) => !currentUser ? <Link href="/login" className="action-button">Log in to join</Link> : (
    <button type="button" className={club.isJoined ? "soft-button" : "action-button"}
      disabled={pending.includes(club.id)} aria-pressed={!!club.isJoined}
      aria-label={`${club.isJoined ? "Leave" : "Join"} ${club.name}`}
      onClick={() => void toggle("club", club.id)}>
      {pending.includes(club.id) ? "Saving…" : club.isJoined ? <><Check size={15} /> Joined</> : "Join club"}
    </button>
  );

  const eventButtons = (event: CampusEvent, detailed = false) => {
    const ended = Date.parse(event.endsAt) <= Date.now();
    if (event.isCancelled || ended) return <span className="text-xs font-medium text-zinc-500">{event.isCancelled ? "Cancelled" : "Event ended"}</span>;
    if (!currentUser) return <Link href="/login" className="action-button">Log in to RSVP</Link>;
    return <div className="flex flex-wrap gap-2">
      <button type="button" className={event.userRsvp === "going" ? "soft-button" : "action-button"}
        disabled={pending.includes(event.id)} aria-pressed={event.userRsvp === "going"}
        aria-label={`${event.userRsvp === "going" ? "Cancel going to" : "RSVP going to"} ${event.title}`}
        onClick={() => void toggle("event", event.id)}>
        {pending.includes(event.id) ? "Saving…" : event.userRsvp === "going" ? <><Check size={15} /> Going</> : "RSVP"}
      </button>
      {detailed && <button type="button" className="soft-button" aria-pressed={event.userRsvp === "interested"}
        disabled={pending.includes(event.id)} onClick={() => void toggle("event", event.id, "interested")}>
        {event.userRsvp === "interested" ? <><Check size={15} /> Interested</> : "Interested"}
      </button>}
    </div>;
  };

  const clubCard = (rawClub: Club) => {
    const club = clubs.find(item => item.id === rawClub.id) || rawClub;
    return <article key={club.id} className="directory-card overflow-hidden">
      {club.coverImageUrl && <Link href={`/clubs/${club.slug}`} className="block">
        <img src={club.coverImageUrl} alt="" width={600} height={300} loading="lazy" className="directory-cover" />
      </Link>}
      <div className="space-y-4 p-5">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.12em] text-violet-700">{club.category}</p>
          <Link href={`/clubs/${club.slug}`} className="text-base font-semibold hover:text-violet-700">{club.name}</Link>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{club.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Users size={14} />{club.memberCount} members</span>
          {clubButton(club)}
        </div>
      </div>
    </article>;
  };

  const eventCard = (rawEvent: CampusEvent) => {
    const event = events.find(item => item.id === rawEvent.id) || rawEvent;
    return <article key={event.id} className="directory-card overflow-hidden">
      {event.coverImageUrl && <Link href={`/events/${event.id}`} className="block">
        <img src={event.coverImageUrl} alt="" width={600} height={300} loading="lazy" className="directory-cover" />
      </Link>}
      <div className="space-y-4 p-5">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-violet-700"><CalendarDays size={14} />{formatCampusDate(event.startsAt)}</p>
          <Link href={`/events/${event.id}`} className="text-base font-semibold leading-snug hover:text-violet-700">{event.title}</Link>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><MapPin size={14} />{event.venue}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-500">{event.rsvpsCount.going} going</span>
          {eventButtons(event)}
        </div>
      </div>
    </article>;
  };

  if (loading && clubs.length === 0) return <div className="empty-state" role="status">Loading…</div>;
  if (loadError) return <div className="empty-state" role="alert"><p>{loadError}</p><button type="button" className="soft-button mt-4" onClick={() => setRetry(value => value + 1)}>Try again</button></div>;

  if (slug && section !== "discover") {
    const item = section === "clubs" ? clubs.find(club => club.slug === slug) : events.find(event => event.id === slug);
    if (!item) return <div className="empty-state"><Compass size={32} /><h1 className="mt-4 text-xl font-semibold">{section === "clubs" ? "Club" : "Event"} not found</h1><Link className="text-link mt-3 inline-block" href={`/${section}`}>Back to {section}</Link></div>;
    const club = section === "clubs" ? item as Club : undefined;
    const event = section === "events" ? item as CampusEvent : undefined;
    return <div className="space-y-6">
      <Link href={`/${section}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"><ArrowLeft size={16} /> All {section}</Link>
      <article className="surface overflow-hidden">
        {item.coverImageUrl && <img src={item.coverImageUrl} alt="" width={1000} height={500} className="detail-cover" />}
        <div className="space-y-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1"><p className="eyebrow">{club ? club.category : "Campus event"}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{club ? club.name : event?.title}</h1></div>
            {club && clubButton(club)}
          </div>
          {event && <div className="space-y-3 border-y border-zinc-100 py-5 text-sm"><p className="flex items-center gap-2"><CalendarDays size={17} className="text-violet-700" />{formatCampusDate(event.startsAt)} <span className="text-zinc-500">IST</span></p><p className="flex items-center gap-2"><MapPin size={17} className="text-violet-700" />{event.venue}</p>{eventButtons(event, true)}</div>}
          <div><h2 className="mb-3 text-sm font-semibold">{club ? "About this club" : "About this event"}</h2><p className="whitespace-pre-line text-sm leading-7 text-zinc-600">{item.description}</p></div>
          {club && <div className="flex flex-wrap items-center gap-5 border-t border-zinc-100 pt-5"><span className="inline-flex items-center gap-2 text-sm text-zinc-500"><Users size={17} />{club.memberCount} members</span>{club.owner && <Link href={`/people/${club.owner.handle}`} className="flex items-center gap-2 text-sm"><Avatar src={club.owner.avatarUrl} name={club.owner.displayName} size="sm" /><span>Led by <strong className="font-medium">{club.owner.displayName}</strong></span></Link>}</div>}
          {event?.club && <Link href={`/clubs/${event.club.slug}`} className="text-link inline-flex items-center gap-2 text-sm">Hosted by {event.club.name}<ArrowUpRight size={15} /></Link>}
        </div>
      </article>
      {club && <section className="space-y-4"><h2 className="text-lg font-semibold">Club events</h2><div className="directory-grid">{events.filter(event => event.clubId === club.id).map(eventCard)}</div>{!events.some(event => event.clubId === club.id) && <div className="empty-state">No events announced yet. Check back soon.</div>}</section>}
    </div>;
  }

  if (section === "clubs") {
    const visible = clubs.filter(club => category === "All clubs" || (category === "My clubs" ? club.isJoined : club.category === category));
    return <div className="space-y-6"><div className="page-heading"><div><h1>Clubs</h1><p className="muted mt-2 text-sm">Browse campus communities and manage your memberships.</p></div></div>
      <div className="flex flex-wrap gap-2" aria-label="Filter clubs">{["All clubs", "My clubs", ...Array.from(new Set(clubs.map(club => club.category)))].map(value => <button type="button" key={value} className={`chip ${category === value ? "active" : ""}`} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
      <div className="directory-grid">{visible.map(clubCard)}</div>{visible.length === 0 && <div className="empty-state"><Users size={30} /><h2 className="mt-4 font-semibold">{category === "My clubs" ? "You haven’t joined any clubs" : "No clubs yet"}</h2><p className="mt-2 text-sm text-zinc-500">{category === "My clubs" ? "Join a club to find it here." : "Campus clubs will appear here once they’ve been added."}</p>{category !== "All clubs" && <button type="button" className="soft-button mt-4" onClick={() => setCategory("All clubs")}>Browse all clubs</button>}</div>}
    </div>;
  }

  if (section === "events") {
    const visible = events.filter(event => eventFilter === "My plans" ? !!event.userRsvp : eventFilter === "Past events" ? Date.parse(event.endsAt) <= Date.now() : Date.parse(event.endsAt) > Date.now());
    return <div className="space-y-6"><div className="page-heading"><div><h1>Events</h1><p className="muted mt-2 text-sm">Browse campus events and manage your RSVPs.</p></div></div>
      <div className="flex flex-wrap gap-2" aria-label="Filter events">{["Upcoming", "My plans", "Past events"].map(value => <button type="button" key={value} className={`chip ${eventFilter === value ? "active" : ""}`} aria-pressed={eventFilter === value} onClick={() => setEventFilter(value)}>{value}</button>)}</div>
      <div className="directory-grid">{visible.map(eventCard)}</div>{visible.length === 0 && <div className="empty-state"><CalendarDays size={30} /><h2 className="mt-4 font-semibold">{eventFilter === "My plans" ? "No RSVPs yet" : eventFilter === "Past events" ? "No past events" : "No upcoming events"}</h2><p className="mt-2 text-sm text-zinc-500">{eventFilter === "My plans" ? "RSVP to an event to add it to your plans." : "Events will appear here once they’ve been added."}</p>{eventFilter === "My plans" && <button type="button" className="soft-button mt-4" onClick={() => setEventFilter("Upcoming")}>Browse events</button>}</div>}
    </div>;
  }

  const hasResults = results.people.length + results.clubs.length + results.events.length + results.posts.length > 0;
  return <div className="space-y-7">
    <div className="page-heading"><div><h1>Search</h1><p className="muted mt-2 text-sm">Find students, clubs, events, and posts.</p></div></div>
    <div className="relative"><label htmlFor="campus-discover-search" className="sr-only">Search students, clubs, events and posts</label><Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input id="campus-discover-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your campus" className="search-field w-full pl-11" autoComplete="off" /></div>
    <div className="flex flex-wrap gap-2" aria-label="Search categories">{(["all", "people", "clubs", "events", "posts"] as SearchFilter[]).map(value => <button type="button" className={`chip capitalize ${filter === value ? "active" : ""}`} key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Everything" : value}</button>)}</div>
    {query.trim() ? <div className="space-y-7" aria-live="polite" aria-busy={searching}>
      {searching ? <div className="empty-state" role="status">Searching campus…</div> : searchError ? <div className="empty-state" role="alert"><p>{searchError}</p><button type="button" className="soft-button mt-4" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : <>
        {results.people.length > 0 && <section className="space-y-4"><h2 className="text-base font-semibold">People</h2><div className="surface divide-y divide-zinc-100">{results.people.map(person => <Link key={person.id} href={`/people/${person.handle}`} className="person-row flex items-center gap-3 p-4 hover:bg-zinc-50"><Avatar src={person.avatarUrl} name={person.displayName} /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{person.displayName}</h3><p className="truncate text-xs text-zinc-500">@{person.handle} · {person.course}</p></div><ArrowUpRight size={16} className="shrink-0 text-zinc-400" /></Link>)}</div></section>}
        {results.clubs.length > 0 && <section className="space-y-4"><h2 className="text-base font-semibold">Clubs</h2><div className="directory-grid">{results.clubs.map(clubCard)}</div></section>}
        {results.events.length > 0 && <section className="space-y-4"><h2 className="text-base font-semibold">Events</h2><div className="directory-grid">{results.events.map(eventCard)}</div></section>}
        {results.posts.length > 0 && <section className="space-y-4"><h2 className="text-base font-semibold">Posts</h2><div className="space-y-3">{results.posts.map(post => <Link href={`/posts/${post.id}`} key={post.id} className="surface block space-y-3 p-5 hover:border-violet-200"><span className="text-sm font-semibold">{post.author?.displayName || "Campus student"}</span><p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{post.content}</p><span className="text-link inline-flex items-center gap-1 text-xs">View post <ArrowUpRight size={13} /></span></Link>)}</div></section>}
        {!hasResults && <div className="empty-state"><Search size={30} /><h2 className="mt-4 font-semibold">No matches for “{query}”</h2><p className="mt-2 text-sm text-zinc-500">Try a name, course, club, or a different keyword.</p><button type="button" className="soft-button mt-4" onClick={() => { setQuery(""); setFilter("all"); }}>Clear search</button></div>}
      </>}
    </div> : <div className="empty-state"><Search size={30} /><h2 className="mt-4 font-semibold">Find your campus</h2><p className="mt-2 text-sm text-zinc-500">Search by name, club, event, or topic.</p></div>}
  </div>;
}
