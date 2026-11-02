"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Bell, Bookmark, CalendarDays, Compass, GraduationCap, Home, Menu, MessageCircle, Plus, Search, Settings, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useMockStore } from "@/lib/mock-store/context";
import type { Club } from "@/lib/mock-store/types";
import { FeedView, PostComposer } from "./feed";
import { CommunityViews } from "./community-views";
import { AccountViews } from "./account-views";

const destinations = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Search", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export function CampusApp() {
  const pathname = usePathname();
  const router = useRouter();
  const { store, currentProfile, currentUser, isLoading, unreadMessagesCount, unreadNotificationsCount } = useMockStore();
  const [composerOpen, setComposerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const rawPath = pathname || "";
  const allParts = rawPath.split("/").filter(Boolean);
  const parts = allParts[0]?.toLowerCase() === "campus-connect" ? allParts.slice(1) : allParts;
  const section = parts[0] || "feed";
  const id = parts[1];
  const isHome = ["feed", "login", "signup"].includes(section);

  useEffect(() => {
    let active = true;
    store.getClubs().then(items => { if (active) setClubs(items); }).catch(() => {});
    return () => { active = false; };
  }, [store, currentUser?.id]);
  useEffect(() => { setMoreOpen(false); }, [pathname]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const brand = <span>campus<span className="brand-light">connect</span><span className="brand-period">.</span></span>;
  const toast = notice && <div role="status" className="toast"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button></div>;
  if (isLoading) return <div className="app-loading" role="status"><span className="brand">{brand}</span><span className="loading-dot" /><span className="sr-only">Loading Campus Connect</span></div>;
  if (!currentUser) return <div className="auth-layout"><Link href="/" className="brand auth-brand" aria-label="Campus Connect home">{brand}</Link><main className="auth-main"><AccountViews section="login" onError={setNotice} /></main><footer className="auth-footer"><GraduationCap size={15} />Christ University · Lavasa</footer>{toast}</div>;

  function navItem(item: typeof destinations[number]) {
    const Icon = item.icon;
    const active = section === item.href.slice(1) || (isHome && item.href === "/feed");
    const count = item.href === "/messages" ? unreadMessagesCount : item.href === "/notifications" ? unreadNotificationsCount : 0;
    return <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><span className="nav-icon"><Icon size={23} strokeWidth={active ? 2.4 : 1.7} />{count > 0 && <span className="nav-count">{count > 9 ? "9+" : count}</span>}</span><span>{item.label}</span></Link>;
  }

  let content;
  if (["discover", "clubs", "events"].includes(section)) {
    content = <CommunityViews key={pathname} section={section as "discover" | "clubs" | "events"} slug={id} onError={setNotice} />;
  } else if (["messages", "notifications", "settings", "profile", "people"].includes(section)) {
    content = <AccountViews key={pathname} section={section === "people" ? "profile" : section as "messages" | "notifications" | "settings" | "profile"} id={id} onError={setNotice} />;
  } else if (["feed", "saved", "posts", "login", "signup"].includes(section)) {
    content = <FeedView key={pathname} mode={isHome ? "feed" : section as "saved" | "posts"} postId={id} clubs={clubs} onCompose={() => setComposerOpen(true)} onNotice={setNotice} />;
  } else {
    content = <div className="empty-state"><Compass size={36} /><h1>Page not found</h1><p>Head back to your feed to continue.</p><Link href="/feed" className="action-button">Go to home <ArrowRight size={16} /></Link></div>;
  }

  return <div className="campus-app">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="desktop-sidebar" aria-label="Main navigation">
      <Link href="/feed" className="brand" aria-label="Campus Connect home">{brand}</Link>
      <div className="campus-label"><GraduationCap size={16} /><span>CHRIST · LAVASA</span></div>
      <nav className="main-nav">{destinations.map(navItem)}<Link href="/profile" className={`nav-item ${["profile", "people"].includes(section) ? "active" : ""}`} aria-current={section === "profile" ? "page" : undefined}><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName} size="xs" /><span>Profile</span></Link></nav>
      <button className="create-nav" onClick={() => setComposerOpen(true)}><Plus size={21} />Create</button>
      <div className="sidebar-bottom"><Link className="nav-item" href="/settings"><Settings size={22} /><span>Settings</span></Link><Link href="/profile" className="sidebar-account"><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName} size="md" /><span><strong>{currentProfile?.displayName}</strong><small>{currentProfile?.displayName === currentUser.normalizedRegNumber ? "View profile" : currentUser.normalizedRegNumber}</small></span><ArrowRight size={16} /></Link></div>
    </aside>
    <div className="app-body">
      <header className="topbar"><Link href="/feed" className="mobile-brand">{brand}</Link><div className="topbar-context">{destinations.find(item => item.href === `/${section}`)?.label || (isHome ? "Home" : "Your campus")}</div><form className="top-search" action="/discover" onSubmit={(e) => { e.preventDefault(); if (query.trim()) router.push(`/discover?q=${encodeURIComponent(query.trim())}`); }}><Search size={17} /><label htmlFor="campus-search" className="sr-only">Search campus</label><input id="campus-search" name="q" placeholder="Search campus" value={query} onChange={event => setQuery(event.target.value)} /></form><div className="topbar-actions"><span className="campus-switch"><GraduationCap size={16} /><span>Lavasa campus</span></span><Link href="/notifications" className="icon-button notification-icon" aria-label={`Notifications${unreadNotificationsCount ? `, ${unreadNotificationsCount} unread` : ""}`}><Bell size={21} />{unreadNotificationsCount > 0 && <i />}</Link><button className="icon-button mobile-more" onClick={() => setMoreOpen(!moreOpen)} aria-label="More navigation" aria-expanded={moreOpen}><Menu size={22} /></button></div></header>
      {moreOpen && <nav className="mobile-menu" aria-label="More navigation">{destinations.slice(3).map(navItem)}<Link href="/settings" className="nav-item"><Settings size={21} />Settings</Link></nav>}
      <div className="content-layout"><main id="main-content" className="content-column" tabIndex={-1}><div className="page-transition" key={pathname}>{content}</div></main><aside className="right-rail" aria-label="Your campus">
        <div className="rail-profile"><Link href="/profile"><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName} size="lg" /></Link><div><Link href="/profile"><strong>{currentProfile?.displayName}</strong></Link><p>{currentProfile?.course || "Your profile"}</p></div><Link href="/settings" className="text-link">Edit</Link></div>
        <section className="rail-section campus-info"><GraduationCap size={24} strokeWidth={1.4} /><h2>Christ University</h2><p>Lavasa campus</p><div className="rail-quick-links"><Link href="/clubs"><Users size={18} /><span>Find a club</span><ArrowRight size={15} /></Link><Link href="/events"><CalendarDays size={18} /><span>Campus events</span><ArrowRight size={15} /></Link></div></section>
        {!currentProfile?.bio && <section className="profile-prompt"><h2>Make your profile yours</h2><p>Add your name, course, and a little about yourself.</p><Link href="/settings" className="text-link">Edit profile <ArrowRight size={13} /></Link></section>}
        <footer className="rail-footer"><p>Campus Connect © 2026</p><p>Christ University · Lavasa</p></footer>
      </aside></div>
    </div>
    <nav className="bottom-nav" aria-label="Mobile navigation"><Link href="/feed" aria-label="Home" aria-current={isHome ? "page" : undefined}><Home size={24} /><span>Home</span></Link><Link href="/discover" aria-label="Search" aria-current={section === "discover" ? "page" : undefined}><Search size={24} /><span>Search</span></Link><button onClick={() => setComposerOpen(true)} aria-label="Create a post"><span className="bottom-create"><Plus size={25} /></span></button><Link href="/messages" aria-label="Messages" aria-current={section === "messages" ? "page" : undefined}><MessageCircle size={24} /><span>Messages</span></Link><Link href="/profile" aria-label="My profile" aria-current={section === "profile" ? "page" : undefined}><Avatar src={currentProfile?.avatarUrl} name={currentProfile?.displayName} size="xs" /><span>Profile</span></Link></nav>
    <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} onNotice={setNotice} />{toast}
  </div>;
}
