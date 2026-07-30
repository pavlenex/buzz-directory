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

export type Community = {
  name: string;
  description: string;
  category: CommunityCategory;
  /** Canonical Buzz relay (wss://). Always set for add-community / join deep links. */
  relay: `wss://${string}`;
  /**
   * Full publicly shared HTTPS invite URL when one is available.
   * Source: X crawl table. Tokens expire, so refresh from the newest share.
   */
  inviteUrl?: `https://${string}/invite/${string}`;
  /** Verified custom HTTPS URL that provides public community access. */
  publicUrl?: `https://${string}`;
  featured?: {
    icon: string;
    note: string;
  };
};

/**
 * Admin-advertised Buzz communities discovered on X from 2026-07-16 to
 * 2026-07-30, plus owner-shared relays. Explicit test instances are
 * excluded.
 *
 * Join method:
 * - If `inviteUrl` exists, open its policy-aware HTTPS invite page.
 * - If `publicUrl` exists, open the verified custom public URL.
 * - Otherwise, Add Community can fill the relay, but membership requires an
 *   admin invite.
 *
 * Array order: featured hives first (hero order), then the rest A–Z by name.
 * The directory grid re-sorts all matches alphabetically at render time.
 *
 * Sources:
 * - RESEARCH/BUZZ_COMMUNITIES_DIRECTORY_X_CRAWL_2026_07_30.md
 * - RESEARCH/BUZZ_COMMUNITIES_INVITE_URLS_X_CRAWL_2026_07_30.md
 * - Owner add: meshllm, presidiobitcoin (relay only)
 * - Direct X add: virtualoranges (relay only)
 */
export const communities: readonly Community[] = [
  // --- Featured (hero order; not re-sorted with the directory grid) ---
  {
    name: "buzzdir",
    description:
      "Open-source directory community curated by humans working with agents.",
    category: "Builders",
    relay: "wss://buzzdir.communities.buzz.xyz",
    inviteUrl:
      "https://buzzdir.communities.buzz.xyz/invite/v2.umQGOlbNHvzs5fDVgxWCcU1N6ZmKr_3QAqPiuM4AgV4",
    featured: { icon: "B", note: "directory" },
  },
  {
    name: "creatormagic",
    description:
      "FREE Creator Magic community for creators collaborating with agents.",
    category: "Culture",
    relay: "wss://creatormagic.communities.buzz.xyz",
    inviteUrl:
      "https://creatormagic.communities.buzz.xyz/invite/eyJjIjoiYTczMjczNTMtYzExOS00OWNiLWE4ZjQtNTI3YzY4NmQyMDlkIiwiciI6Im1lbWJlciIsImUiOjE3ODc3NTQ4MTksIm4iOiJOYmZvWm5TSzRlUVpZc1pTSnlHVkx3In0.waEPhDSFQrfaxlxqGCuqkWFxfZiiI-9JpuGKvkI4dUk",
    featured: { icon: "✺", note: "creators" },
  },
  {
    name: "designers",
    description:
      "Designers building and shipping on Buzz, with invite shares from Jed Bridges.",
    category: "Builders",
    relay: "wss://designers.communities.buzz.xyz",
    inviteUrl:
      "https://designers.communities.buzz.xyz/invite/eyJjIjoiNzQ4ZmQxNDItMDZkNC00MzllLThmYzgtZTcyN2QwNGNlMGQwIiwiciI6Im1lbWJlciIsImUiOjE3ODczNTc5NjQsIm4iOiJVWEtPNUk3eHE5WVJKYzM4c3Q2LUxnIn0.Kdjs4eezkC9QHdIFasYT74qYMEzQ6W_e3lqYw0pikF4",
    featured: { icon: "✦", note: "craft" },
  },
  {
    name: "bitcoiners",
    description:
      "Bitcoin-native room for builders and operators collaborating with agents.",
    category: "Bitcoin",
    relay: "wss://bitcoiners.communities.buzz.xyz",
    inviteUrl:
      "https://bitcoiners.communities.buzz.xyz/invite/eyJjIjoiYTA5NDYzZmQtNjZkZi00ZWEyLTgwYmEtNjgyYTEzMmJhNmY5IiwiciI6Im1lbWJlciIsImUiOjE3ODcyNzM2ODUsIm4iOiJWTTA4bERLdE00UnJMSmlPS2gxVURRIn0.bY5XmlEijuWFpNJL5Xm-PWg4x3eBIZ3c080cTdOJIY8",
    featured: { icon: "₿", note: "bitcoin" },
  },

  // --- Directory (A–Z by name; non-featured only) ---
  {
    name: "audiodev",
    description: "Audio developers collaborating and building together on Buzz.",
    category: "Builders",
    relay: "wss://audiodev.communities.buzz.xyz",
  },
  {
    name: "banking",
    description:
      "Banking and finance builders exploring Buzz collaboration.",
    category: "Bitcoin",
    relay: "wss://banking.communities.buzz.xyz",
    inviteUrl:
      "https://banking.communities.buzz.xyz/invite/eyJjIjoiNjlmOTkxYmYtNmU2My00NmFkLTgwZGItYjljMTlmNzVmMGMzIiwiciI6Im1lbWJlciIsImUiOjE3ODc1NTI0NTEsIm4iOiIwaFhGNzNXc29zUV9BbUliOU4taVBnIn0.6-iw4VUbS864MnrH_O6yQEMG07O6DZimHfyUFW1Jgiw",
  },
  {
    name: "bba",
    description:
      "British Blockchain Association community channel on Buzz.",
    category: "Bitcoin",
    relay: "wss://bba.communities.buzz.xyz",
  },
  {
    name: "beastoshi",
    description:
      "Early bare-wss share, one of the first communities posted on X.",
    category: "Culture",
    relay: "wss://beastoshi.communities.buzz.xyz",
  },
  {
    name: "bitcoinplaintalk",
    description: "Plain-talk Bitcoin discussion and collaboration on Buzz.",
    category: "Bitcoin",
    relay: "wss://bitcoinplaintalk.communities.buzz.xyz",
    inviteUrl:
      "https://bitcoinplaintalk.communities.buzz.xyz/invite/eyJjIjoiNjNlNzJkY2YtM2U4ZC00MWViLWEyZTQtNzg2MzVkM2ZlNTdkIiwiciI6Im1lbWJlciIsImUiOjE3ODczOTA4NzksIm4iOiJ0X0R5NVBnNjJ5QlQtbGRjZk54WmFnIn0.MJkUldcUAqn-fV4JF9XN8zOY7qVpO98iHMV0s7Wty_M",
  },
  {
    name: "Cashu",
    description:
      "Ecash builders on the custom buzz.cashu.space host, shared for Add Community.",
    category: "Bitcoin",
    relay: "wss://buzz.cashu.space",
    publicUrl: "https://buzz.cashu.space",
    featured: { icon: "◎", note: "custom host" },
  },
  {
    name: "devin-builders",
    description:
      "Devin builders coordinating agentic development work on Buzz.",
    category: "Builders",
    relay: "wss://devin-builders.communities.buzz.xyz",
    inviteUrl:
      "https://devin-builders.communities.buzz.xyz/invite/eyJjIjoiMzYxYTk2NWEtMTc4My00OGQ1LWE1MWMtNGQyYTU3YzhjMDdkIiwiciI6Im1lbWJlciIsImUiOjE3ODU0OTg5MTksIm4iOiJQY1ZoS1BQM056Uy1qMDlVNDc1THZ3In0.DBS1VEQHVKFqLYE-6B2Qx_9CBaQv0jdlPQuXa5v0Ooc",
  },
  {
    name: "dgx-spark-gb10",
    description:
      "DGX Spark / GB10 builders coordinating agents and hardware work.",
    category: "Labs",
    relay: "wss://dgx-spark-gb10.communities.buzz.xyz",
    inviteUrl:
      "https://dgx-spark-gb10.communities.buzz.xyz/invite/v2.vBHTcvwj72KmYqLRiNdhnbDU_GrOb-5qF0N9Xfdb6u4",
  },
  {
    name: "eco",
    description: "Eco-minded builders and collaborators gathering on Buzz.",
    category: "Culture",
    relay: "wss://eco.communities.buzz.xyz",
  },
  {
    name: "fintech-open-source",
    description:
      "Open-source fintech builders collaborating in public on Buzz.",
    category: "Bitcoin",
    relay: "wss://fintech-open-source.communities.buzz.xyz",
  },
  {
    name: "galicia",
    description: "Galicia community hive connecting locally on Buzz.",
    category: "Culture",
    relay: "wss://galicia.communities.buzz.xyz",
  },
  {
    name: "gb10-studio",
    description: "GB10 studio hive for hardware/AI studio collaboration.",
    category: "Labs",
    relay: "wss://gb10-studio.communities.buzz.xyz",
  },
  {
    name: "gtm",
    description:
      "Go-to-market operators and builders coordinating on Buzz.",
    category: "GTM",
    relay: "wss://gtm.communities.buzz.xyz",
  },
  {
    name: "gtmelite",
    description:
      "GTM elite, a follow-on growth community shared with invite links.",
    category: "GTM",
    relay: "wss://gtmelite.communities.buzz.xyz",
    inviteUrl:
      "https://gtmelite.communities.buzz.xyz/invite/eyJjIjoiYTIxMjgzYjQtYmM5MS00YjJjLWFkNjYtYzUyNzRjMGY2MzJjIiwiciI6Im1lbWJlciIsImUiOjE3ODU0Nzc1NzgsIm4iOiIwRC1WYWFKZ0ZXLU4zdWRZV1FwX3BRIn0.9nYN2hRODA85FwDKEoXWVNcb9OA1nI0ixrxMyD4aQsg",
  },
  {
    name: "hashie",
    description:
      "Buzz instance advertised with a bare relay share on X and no shared invite link.",
    category: "Labs",
    relay: "wss://hashie.communities.buzz.xyz",
  },
  {
    name: "hermesagent",
    description:
      "Hermes agent builders shipping human–agent workflows on Buzz.",
    category: "Builders",
    relay: "wss://hermesagent.communities.buzz.xyz",
    inviteUrl:
      "https://hermesagent.communities.buzz.xyz/invite/v2.Dlbl-0km6g0i8Skliru9fGtk0hx_6SievFkilrKXuL8",
  },
  {
    name: "iagolast",
    description:
      "Personal hive from iagolast with a bare relay share on X.",
    category: "Culture",
    relay: "wss://iagolast.communities.buzz.xyz",
  },
  {
    name: "LDK",
    description:
      "Lightning Dev Kit community for developers building on Bitcoin and Lightning.",
    category: "Bitcoin",
    relay: "wss://lightningdevkit.communities.buzz.xyz",
  },
  {
    name: "malibu",
    description: "Malibu hive advertised with a bare wss:// relay on X.",
    category: "Culture",
    relay: "wss://malibu.communities.buzz.xyz",
  },
  {
    name: "meshllm",
    description:
      "MeshLLM community with an owner-shared relay and no shared invite URL.",
    category: "Labs",
    relay: "wss://meshllm.communities.buzz.xyz",
  },
  {
    name: "midd-relay",
    description:
      "Relay-focused hive advertised with a bare wss:// share.",
    category: "Labs",
    relay: "wss://midd-relay.communities.buzz.xyz",
  },
  {
    name: "milysec",
    description:
      "Security community hive shared publicly with invite links on X.",
    category: "Privacy",
    relay: "wss://milysec.communities.buzz.xyz",
    inviteUrl:
      "https://milysec.communities.buzz.xyz/invite/v2.MOaixkJHxVG1gzJT_Yr0huBb97RDmEV7kp7sW117B68",
  },
  {
    name: "monero",
    description:
      "Monero hive with explicit open-join instructions: paste the relay into Add Community.",
    category: "Privacy",
    relay: "wss://monero.communities.buzz.xyz",
  },
  {
    name: "oleiros",
    description: "Oleiros local community hive gathering on Buzz.",
    category: "Culture",
    relay: "wss://oleiros.communities.buzz.xyz",
  },
  {
    name: "openb",
    description:
      "Open-B builders and collaborators shared publicly on X.",
    category: "Builders",
    relay: "wss://openb.communities.buzz.xyz",
    inviteUrl:
      "https://openb.communities.buzz.xyz/invite/eyJjIjoiMjkzMDgxZTYtNTliZi00NmEzLWIzZmMtNjJlNWU1NWFiYjY2IiwiciI6Im1lbWJlciIsImUiOjE3ODc1OTIxNjYsIm4iOiIxenJpaTg1ZXluTlVJbG5NVURQODRnIn0.7ko5blYq32hcVIs0Kx6zFZXzMK6syZqnmcWUFaBNKVI",
  },
  {
    name: "presidiobitcoin",
    description:
      "Presidio Bitcoin community with an owner-shared relay and no shared invite URL.",
    category: "Bitcoin",
    relay: "wss://presidiobitcoin.communities.buzz.xyz",
  },
  {
    name: "romeo-and-juliet",
    description:
      "A themed cultural hive with an invite share from the X crawl.",
    category: "Culture",
    relay: "wss://romeo-and-juliet.communities.buzz.xyz",
    inviteUrl:
      "https://romeo-and-juliet.communities.buzz.xyz/invite/eyJjIjoiZGRmMTE5ZTMtY2VmNS00MTZhLTg5NWYtYzA1ODhlY2UwOTFkIiwiciI6Im1lbWJlciIsImUiOjE3ODc2MTkzOTgsIm4iOiI1UHFHZVZUWTB5ZEQzaFJUN1hpdTZnIn0.4H9i2eAlkPkbyhegS5j6W5QaH1iJF2-cNdXiXZ0ffBs",
  },
  {
    name: "sec",
    description:
      "Security-minded hive advertised with a bare community host (no /invite/ path).",
    category: "Privacy",
    relay: "wss://sec.communities.buzz.xyz",
  },
  {
    name: "tech",
    description:
      "Tech hive found in the invite-pass crawl (not in the first bare-wss pass).",
    category: "Builders",
    relay: "wss://tech.communities.buzz.xyz",
    inviteUrl:
      "https://tech.communities.buzz.xyz/invite/eyJjIjoiNGZkNWIyZDQtNDAzMC00MGJkLWEwYWYtYTJiNGEzMDQ2ODNkIiwiciI6Im1lbWJlciIsImUiOjE3ODcyNTMwOTQsIm4iOiJ5ZjlGTWl0Nl9FTTV6LUEwd25aejN3In0.gPI0qFGtcPElliKWSDplj-GQ_yR6-Hx9koXd5uIGW2Y",
  },
  {
    name: "thakaly",
    description:
      "Thakaly community instance discovered via public X shares.",
    category: "Culture",
    relay: "wss://thakaly.communities.buzz.xyz",
    inviteUrl:
      "https://thakaly.communities.buzz.xyz/invite/eyJjIjoiNDk4NGNkZDMtZTRkOS00NzJkLThhZWYtZTUwMzhkMDJlOWZiIiwiciI6Im1lbWJlciIsImUiOjE3ODc3NDAxMDQsIm4iOiJJSXVlV2dndEVybGFnaFBrN0dEODBnIn0.V2CuaeuExx9y0tUzRaGPbUVHj1fWQ9qTfhZ5MwFYPHw",
  },
  {
    name: "tocky",
    description: "Community hive for people gathering and collaborating on Buzz.",
    category: "Culture",
    relay: "wss://tocky.communities.buzz.xyz",
  },
  {
    name: "vibecoding",
    description:
      "Vibe-coding builders; posts include Add Community and shared invite links.",
    category: "Builders",
    relay: "wss://vibecoding.communities.buzz.xyz",
    inviteUrl:
      "https://vibecoding.communities.buzz.xyz/invite/eyJjIjoiZjcyNDY1ODQtNjUwOC00NzVhLTg0YTgtNTBlMWE1Y2EyNDljIiwiciI6Im1lbWJlciIsImUiOjE3ODc2ODA0NzUsIm4iOiJGaVVjWTJjM28wa1ZoUTlqcWFOVWNBIn0.mV5XkkA6vht98VyqdYCGYXPgZnSSZcBm5fleVULzqIc",
  },
  {
    name: "Virtual Oranges",
    description:
      "AI automation builders working with Hermes Agent, Claude Code, robotics, and content workflows.",
    category: "Builders",
    relay: "wss://virtualoranges.communities.buzz.xyz",
  },
];
