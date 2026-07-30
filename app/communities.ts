export const categories = [
  "All",
  "Builders",
  "Bitcoin",
  "Privacy",
  "Culture",
  "GTM",
  "Labs",
] as const;

export type CommunityCategory = Exclude<(typeof categories)[number], "All">;
export type CommunityAccess = "public" | "invite";

export type Community = {
  name: string;
  description: string;
  category: CommunityCategory;
  /** Canonical Buzz join target. Keep this as wss:// so the app can open it. */
  relay: `wss://${string}`;
  access: CommunityAccess;
  featured?: {
    icon: string;
    note: string;
  };
};

/**
 * Publicly advertised Buzz communities discovered on X from 2026-07-16 to
 * 2026-07-30, plus private owner-shared relays. Explicit test instances are
 * excluded. Invite URLs are not stored because they expire; every card uses
 * the community's canonical wss:// relay.
 *
 * Access labels (directory convention):
 * - `public` — a public `/invite/{token}` share was found on X
 * - `invite` — no public `/invite/` found; bare wss:// / host only (Add
 *   Community paste or private owner share)
 *
 * Array order: featured hives first (hero order), then the rest A–Z by name.
 * The directory grid re-sorts all matches alphabetically at render time.
 *
 * Sources:
 * - RESEARCH/BUZZ_COMMUNITIES_DIRECTORY_X_CRAWL_2026_07_30.md
 * - RESEARCH/BUZZ_COMMUNITIES_INVITE_AND_PUBLIC_2026_07_30.md
 * - Owner add: meshllm, presidiobitcoin (private / invite)
 */
export const communities: readonly Community[] = [
  // --- Featured (hero order; not re-sorted with the directory grid) ---
  {
    name: "Cashu",
    description:
      "Ecash builders on a custom host — bare wss://buzz.cashu.space shared for Add Community.",
    category: "Bitcoin",
    relay: "wss://buzz.cashu.space",
    access: "invite",
    featured: { icon: "◎", note: "custom host" },
  },
  {
    name: "creatormagic",
    description:
      "FREE Creator Magic community for creators collaborating with agents.",
    category: "Culture",
    relay: "wss://creatormagic.communities.buzz.xyz",
    access: "public",
    featured: { icon: "✺", note: "creators" },
  },
  {
    name: "designers",
    description:
      "Designers building and shipping on Buzz — public invite shares from Jed Bridges.",
    category: "Builders",
    relay: "wss://designers.communities.buzz.xyz",
    access: "public",
    featured: { icon: "✦", note: "craft" },
  },
  {
    name: "bitcoiners",
    description:
      "Bitcoin-native room for builders and operators collaborating with agents.",
    category: "Bitcoin",
    relay: "wss://bitcoiners.communities.buzz.xyz",
    access: "public",
    featured: { icon: "₿", note: "bitcoin" },
  },

  // --- Directory (A–Z by name; non-featured only) ---
  {
    name: "audiodev",
    description:
      "Audio developers collaborating on Buzz with public invite shares.",
    category: "Builders",
    relay: "wss://audiodev.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "banking",
    description:
      "Banking and finance builders exploring Buzz collaboration.",
    category: "Bitcoin",
    relay: "wss://banking.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "bba",
    description:
      "British Blockchain Association — self-described open Buzz community channel.",
    category: "Bitcoin",
    relay: "wss://bba.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "beastoshi",
    description:
      "Early bare-wss share — one of the first communities posted on X.",
    category: "Culture",
    relay: "wss://beastoshi.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "bitcoinplaintalk",
    description: "Plain-talk Bitcoin discussion and collaboration on Buzz.",
    category: "Bitcoin",
    relay: "wss://bitcoinplaintalk.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "devin-builders",
    description:
      "Devin builders coordinating agentic development work on Buzz.",
    category: "Builders",
    relay: "wss://devin-builders.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "dgx-spark-gb10",
    description:
      "DGX Spark / GB10 builders coordinating agents and hardware work.",
    category: "Labs",
    relay: "wss://dgx-spark-gb10.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "eco",
    description:
      "Eco-minded builders and collaborators with open-join intent on X.",
    category: "Culture",
    relay: "wss://eco.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "fintech-open-source",
    description:
      "Open-source fintech builders collaborating in public on Buzz.",
    category: "Bitcoin",
    relay: "wss://fintech-open-source.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "galicia",
    description:
      "Galicia community hive advertised with public invite links.",
    category: "Culture",
    relay: "wss://galicia.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "gb10-studio",
    description: "GB10 studio hive for hardware/AI studio collaboration.",
    category: "Labs",
    relay: "wss://gb10-studio.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "gtm",
    description:
      "Go-to-market operators and builders coordinating on Buzz.",
    category: "GTM",
    relay: "wss://gtm.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "gtmelite",
    description:
      "GTM elite — follow-on growth community shared with public invites.",
    category: "GTM",
    relay: "wss://gtmelite.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "hashie",
    description:
      "Buzz instance advertised with a bare relay share on X (no public invite).",
    category: "Labs",
    relay: "wss://hashie.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "hermesagent",
    description:
      "Hermes agent builders shipping human–agent workflows on Buzz.",
    category: "Builders",
    relay: "wss://hermesagent.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "iagolast",
    description:
      "Personal hive from iagolast with a bare relay share on X.",
    category: "Culture",
    relay: "wss://iagolast.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "malibu",
    description: "Malibu hive advertised with a bare wss:// relay on X.",
    category: "Culture",
    relay: "wss://malibu.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "meshllm",
    description:
      "Private MeshLLM community — owner-shared relay, no public invite URL.",
    category: "Labs",
    relay: "wss://meshllm.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "midd-relay",
    description:
      "Relay-focused hive advertised with a bare wss:// share.",
    category: "Labs",
    relay: "wss://midd-relay.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "milysec",
    description:
      "Security community hive shared publicly with invite links on X.",
    category: "Privacy",
    relay: "wss://milysec.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "monero",
    description:
      "Monero hive with explicit open-join instructions: paste the relay into Add Community.",
    category: "Privacy",
    relay: "wss://monero.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "oleiros",
    description:
      "Oleiros local/community hive shared via public Buzz invites.",
    category: "Culture",
    relay: "wss://oleiros.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "openb",
    description:
      "Open-B builders and collaborators shared publicly on X.",
    category: "Builders",
    relay: "wss://openb.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "presidiobitcoin",
    description:
      "Private Presidio Bitcoin community — owner-shared relay, no public invite URL.",
    category: "Bitcoin",
    relay: "wss://presidiobitcoin.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "romeo-and-juliet",
    description:
      "A themed cultural hive — public invite share from the X crawl.",
    category: "Culture",
    relay: "wss://romeo-and-juliet.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "sec",
    description:
      "Security-minded hive advertised with a bare community host (no /invite/ path).",
    category: "Privacy",
    relay: "wss://sec.communities.buzz.xyz",
    access: "invite",
  },
  {
    name: "tech",
    description:
      "Tech hive found in the invite-pass crawl (not in the first bare-wss pass).",
    category: "Builders",
    relay: "wss://tech.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "thakaly",
    description:
      "Thakaly community instance discovered via public X shares.",
    category: "Culture",
    relay: "wss://thakaly.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "tocky",
    description: "Community hive shared via public Buzz invite links on X.",
    category: "Culture",
    relay: "wss://tocky.communities.buzz.xyz",
    access: "public",
  },
  {
    name: "vibecoding",
    description:
      "Vibe-coding builders; posts include Add Community + public invite shares.",
    category: "Builders",
    relay: "wss://vibecoding.communities.buzz.xyz",
    access: "public",
  },
];
