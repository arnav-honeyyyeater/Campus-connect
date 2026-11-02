import { CampusApp } from "@/components/campus/campus-app";

export function generateStaticParams() {
  const routes: string[][] = [
    // Top-level sections
    ["feed"],
    ["discover"],
    ["messages"],
    ["notifications"],
    ["clubs"],
    ["events"],
    ["saved"],
    ["profile"],
    ["settings"],
    ["login"],
    ["signup"],
    ["people"],
    ["posts"],
    // Known clubs
    ["clubs", "coding-club"],
    ["clubs", "literary-society"],
    ["clubs", "melodica"],
    ["clubs", "rotaract"],
    ["clubs", "club_coding"],
    ["clubs", "club_literary"],
    ["clubs", "club_melodica"],
    ["clubs", "club_rotaract"],
    // Known events
    ["events", "evt_hacklavasa"],
    ["events", "evt_acoustic_night"],
    ["events", "evt_chai_meetup"],
    // Known posts
    ["posts", "post_fog_poll"],
    ["posts", "post_lost_earbuds"],
    ["posts", "post_hackathon_teaser"],
    ["posts", "post_stair_meme"],
    // Known profiles
    ["people", "usr_arnav_s"],
    ["people", "usr_priya_k"],
    ["people", "usr_rahul_v"],
    ["people", "usr_sneha_m"],
    ["people", "usr_tanmay_r"],
    ["people", "usr_ananya_d"],
    ["people", "usr_campus_admin"],
    // Known conversations
    ["messages", "conv_arnav_priya"],
    ["messages", "conv_arnav_rahul"],
    ["messages", "conv_central_survivors"],
  ];

  return routes.map((path) => ({ path }));
}

export default function CampusPage() {
  return <CampusApp />;
}
