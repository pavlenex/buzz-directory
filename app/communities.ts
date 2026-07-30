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
  /** Canonical Buzz relay (wss://). Always set for add-community / join deep links. */
  relay: `wss://${string}`;
  access: CommunityAccess;
  /**
   * Full public HTTPS invite URL when `access` is `public`.
   * Source: X crawl table (tokens expire — refresh from newest public share).
   */
  inviteUrl?: `https://${string}`;
  featured?: {
    icon: string;
    note: string;
  };
};

/**
 * Publicly advertised Buzz communities discovered on X from 2026-07-16 to
 * 2026-07-30, plus private owner-shared relays. Explicit test instances are
 * excluded.
 *
 * Access labels (directory convention):
 * - `public` — a public `/invite/{token}` share was found on X; `inviteUrl`
 *   holds that join link so cards can open a real join (not bare add-community)
 * - `invite` — no public `/invite/` found; bare wss:// only (Add Community)
 *
 * Array order: featured hives first (hero order), then the rest A–Z by name.
 * The directory grid re-sorts all matches alphabetically at render time.
 *
 * Sources:
 * - RESEARCH/BUZZ_COMMUNITIES_DIRECTORY_X_CRAWL_2026_07_30.md
 * - RESEARCH/BUZZ_COMMUNITIES_INVITE_URLS_X_CRAWL_2026_07_30.md
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
    inviteUrl:
      "https://creatormagic.communities.buzz.xyz/invite/eyJjIjoiYTczMjczNTMtYzExOS00OWNiLWE4ZjQtNTI3YzY4NmQyMDlkIiwiciI6Im1lbWJlciIsImUiOjE3ODc3NTQ4MTksIm4iOiJOYmZvWm5TSzRlUVpZc1pTSnlHVkx3In0.waEPhDSFQrfaxlxqGCuqkWFxfZiiI-9JpuGKvkI4dUk",
    featured: { icon: "✺", note: "creators" },
  },
  {
    name: "designers",
    description:
      "Designers building and shipping on Buzz — public invite shares from Jed Bridges.",
    category: "Builders",
    relay: "wss://designers.communities.buzz.xyz",
    access: "public",
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
    access: "public",
    inviteUrl:
      "https://bitcoiners.communities.buzz.xyz/invite/eyJjIjoiYTA5NDYzZmQtNjZkZi00ZWEyLTgwYmEtNjgyYTEzMmJhNmY5IiwiciI6Im1lbWJlciIsImUiOjE3ODcyNzM2ODUsIm4iOiJWTTA4bERLdE00UnJMSmlPS2gxVURRIn0.bY5XmlEijuWFpNJL5Xm-PWg4x3eBIZ3c080cTdOJIY8",
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
    inviteUrl:
      "https://audiodev.communities.buzz.xyz/invite/eyJjIjoiNGI3Y2ZhZjgtZjBhNS00ZWY1LWFmYTAtYWFhNjU1NzAzZjc0IiwiciI6Im1lbWJlciIsImUiOjE3ODQ4MDMxMDQsIm4iOiJQWkJnTVl3bzdWRlN2QVl0UmEtdU5RIn0.3Qp2yfPqshQl1Xl69kj6shOFFBZgONHt_-G_PgT4Sfk",
  },
  {
    name: "banking",
    description:
      "Banking and finance builders exploring Buzz collaboration.",
    category: "Bitcoin",
    relay: "wss://banking.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://banking.communities.buzz.xyz/invite/eyJjIjoiNjlmOTkxYmYtNmU2My00NmFkLTgwZGItYjljMTlmNzVmMGMzIiwiciI6Im1lbWJlciIsImUiOjE3ODc1NTI0NTEsIm4iOiIwaFhGNzNXc29zUV9BbUliOU4taVBnIn0.6-iw4VUbS864MnrH_O6yQEMG07O6DZimHfyUFW1Jgiw",
  },
  {
    name: "bba",
    description:
      "British Blockchain Association — self-described open Buzz community channel.",
    category: "Bitcoin",
    relay: "wss://bba.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://bba.communities.buzz.xyz/invite/eyJjIjoiMjViZDQ2NmEtY2NlOC00YzNjLTk2NzgtMWFiN2YyYmI5YzhhIiwiciI6Im1lbWJlciIsImUiOjE3ODUwOTU1MzQsIm4iOiIxdDkyRXY1LTBjYXdoTHdKSVpvUXVRIn0.0iMHwmP-c8AEjg139f0XUlvsOEOiZn_uvixgPE3NPis",
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
    inviteUrl:
      "https://bitcoinplaintalk.communities.buzz.xyz/invite/eyJjIjoiNjNlNzJkY2YtM2U4ZC00MWViLWEyZTQtNzg2MzVkM2ZlNTdkIiwiciI6Im1lbWJlciIsImUiOjE3ODczOTA4NzksIm4iOiJ0X0R5NVBnNjJ5QlQtbGRjZk54WmFnIn0.MJkUldcUAqn-fV4JF9XN8zOY7qVpO98iHMV0s7Wty_M",
  },
  {
    name: "devin-builders",
    description:
      "Devin builders coordinating agentic development work on Buzz.",
    category: "Builders",
    relay: "wss://devin-builders.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://devin-builders.communities.buzz.xyz/invite/eyJjIjoiMzYxYTk2NWEtMTc4My00OGQ1LWE1MWMtNGQyYTU3YzhjMDdkIiwiciI6Im1lbWJlciIsImUiOjE3ODU0OTg5MTksIm4iOiJQY1ZoS1BQM056Uy1qMDlVNDc1THZ3In0.DBS1VEQHVKFqLYE-6B2Qx_9CBaQv0jdlPQuXa5v0Ooc",
  },
  {
    name: "dgx-spark-gb10",
    description:
      "DGX Spark / GB10 builders coordinating agents and hardware work.",
    category: "Labs",
    relay: "wss://dgx-spark-gb10.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://dgx-spark-gb10.communities.buzz.xyz/invite/v2.vBHTcvwj72KmYqLRiNdhnbDU_GrOb-5qF0N9Xfdb6u4",
  },
  {
    name: "eco",
    description:
      "Eco-minded builders and collaborators with open-join intent on X.",
    category: "Culture",
    relay: "wss://eco.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://eco.communities.buzz.xyz/invite/eyJjIjoiYjUyZTMyYzMtMDVmNS00ZWViLWI2ZmItZjlkZDM2MWVkMThhIiwiciI6Im1lbWJlciIsImUiOjE3ODU0MTUwMDQsIm4iOiJ3NGNlb0FzMEdMeW5VdWplZVJIYklBIn0.CoxVhyVYxss36o0VyOjWYOrCDXg8cL7o8dgym6ER_ho",
  },
  {
    name: "fintech-open-source",
    description:
      "Open-source fintech builders collaborating in public on Buzz.",
    category: "Bitcoin",
    relay: "wss://fintech-open-source.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://fintech-open-source.communities.buzz.xyz/invite/eyJjIjoiZjQzYWFjOGYtYmQ3NS00NjYwLWEwNzktMWU5NDNhYjYxOTEwIiwiciI6Im1lbWJlciIsImUiOjE3ODUwODExMzksIm4iOiJlUjlETWI3Uld4LVdDdHVOU2pYMzB3In0.feI4VLW1uY2xcKPk7lvBX2I7D21SVImSRSDPUvPVbFs",
  },
  {
    name: "galicia",
    description:
      "Galicia community hive advertised with public invite links.",
    category: "Culture",
    relay: "wss://galicia.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://galicia.communities.buzz.xyz/invite/eyJjIjoiYWI4ZjdhZWEtMzEzZC00OTgwLWE2ZjAtMDViOWY4ZTBiYjIzIiwiciI6Im1lbWJlciIsImUiOjE3ODUyNDE2MDgsIm4iOiI5ajJQZlZHcHFUS24tN1hFNXlCeUlnIn0.HcidLtpJo7vMgzrgZvGpjWTHC6oFEa55bMEsbaLZF7g",
  },
  {
    name: "gb10-studio",
    description: "GB10 studio hive for hardware/AI studio collaboration.",
    category: "Labs",
    relay: "wss://gb10-studio.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://gb10-studio.communities.buzz.xyz/invite/eyJjIjoiYjlmMGY4ZTItNWI0Yy00MTNjLWIxMTctOWI0ODQ5NTU3ZjM1IiwiciI6Im1lbWJlciIsImUiOjE3ODUwODk2MDksIm4iOiJlYzBEYVYxNml4Y284ZW5kc3NQVTlnIn0.7hcnNFMk9ZAYIIG-lW3LYxGWfab79AIBZw3jgy1qg3s",
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
    inviteUrl:
      "https://gtmelite.communities.buzz.xyz/invite/eyJjIjoiYTIxMjgzYjQtYmM5MS00YjJjLWFkNjYtYzUyNzRjMGY2MzJjIiwiciI6Im1lbWJlciIsImUiOjE3ODU0Nzc1NzgsIm4iOiIwRC1WYWFKZ0ZXLU4zdWRZV1FwX3BRIn0.9nYN2hRODA85FwDKEoXWVNcb9OA1nI0ixrxMyD4aQsg",
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
    inviteUrl:
      "https://hermesagent.communities.buzz.xyz/invite/v2.Dlbl-0km6g0i8Skliru9fGtk0hx_6SievFkilrKXuL8",
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
    inviteUrl:
      "https://milysec.communities.buzz.xyz/invite/v2.MOaixkJHxVG1gzJT_Yr0huBb97RDmEV7kp7sW117B68",
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
    inviteUrl:
      "https://oleiros.communities.buzz.xyz/invite/eyJjIjoiN2ZhYTg5YTYtZmEzZi00NTBjLTk2ZmUtM2RmMDY4YTE1YjBiIiwiciI6Im1lbWJlciIsImUiOjE3ODUyMzMzNDQsIm4iOiJsekxMOWhTY3UzckowMGNsWktmMnlBIn0.2WRsthrc2uq_G8VkwVnGR5Em-m3wBAPiMufws0C4kJU",
  },
  {
    name: "openb",
    description:
      "Open-B builders and collaborators shared publicly on X.",
    category: "Builders",
    relay: "wss://openb.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://openb.communities.buzz.xyz/invite/eyJjIjoiMjkzMDgxZTYtNTliZi00NmEzLWIzZmMtNjJlNWU1NWFiYjY2IiwiciI6Im1lbWJlciIsImUiOjE3ODc1OTIxNjYsIm4iOiIxenJpaTg1ZXluTlVJbG5NVURQODRnIn0.7ko5blYq32hcVIs0Kx6zFZXzMK6syZqnmcWUFaBNKVI",
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
    inviteUrl:
      "https://romeo-and-juliet.communities.buzz.xyz/invite/eyJjIjoiZGRmMTE5ZTMtY2VmNS00MTZhLTg5NWYtYzA1ODhlY2UwOTFkIiwiciI6Im1lbWJlciIsImUiOjE3ODc2MTkzOTgsIm4iOiI1UHFHZVZUWTB5ZEQzaFJUN1hpdTZnIn0.4H9i2eAlkPkbyhegS5j6W5QaH1iJF2-cNdXiXZ0ffBs",
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
    inviteUrl:
      "https://tech.communities.buzz.xyz/invite/eyJjIjoiNGZkNWIyZDQtNDAzMC00MGJkLWEwYWYtYTJiNGEzMDQ2ODNkIiwiciI6Im1lbWJlciIsImUiOjE3ODcyNTMwOTQsIm4iOiJ5ZjlGTWl0Nl9FTTV6LUEwd25aejN3In0.gPI0qFGtcPElliKWSDplj-GQ_yR6-Hx9koXd5uIGW2Y",
  },
  {
    name: "thakaly",
    description:
      "Thakaly community instance discovered via public X shares.",
    category: "Culture",
    relay: "wss://thakaly.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://thakaly.communities.buzz.xyz/invite/eyJjIjoiNDk4NGNkZDMtZTRkOS00NzJkLThhZWYtZTUwMzhkMDJlOWZiIiwiciI6Im1lbWJlciIsImUiOjE3ODc3NDAxMDQsIm4iOiJJSXVlV2dndEVybGFnaFBrN0dEODBnIn0.V2CuaeuExx9y0tUzRaGPbUVHj1fWQ9qTfhZ5MwFYPHw",
  },
  {
    name: "tocky",
    description: "Community hive shared via public Buzz invite links on X.",
    category: "Culture",
    relay: "wss://tocky.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://tocky.communities.buzz.xyz/invite/eyJjIjoiYjhiMWNlYjMtNTBlZC00MGFiLTk3ODktMWQzMjBmZTAxODQ4IiwiciI6Im1lbWJlciIsImUiOjE3ODQ3ODA4MzYsIm4iOiJoRDg1TWZRc1FZcUE0S3FPMjdmV3BRIn0.l-mBelLEUF4P98hcr07pxrt1wKtxexJWEVR6Scpc1jk",
  },
  {
    name: "vibecoding",
    description:
      "Vibe-coding builders; posts include Add Community + public invite shares.",
    category: "Builders",
    relay: "wss://vibecoding.communities.buzz.xyz",
    access: "public",
    inviteUrl:
      "https://vibecoding.communities.buzz.xyz/invite/eyJjIjoiZjcyNDY1ODQtNjUwOC00NzVhLTg0YTgtNTBlMWE1Y2EyNDljIiwiciI6Im1lbWJlciIsImUiOjE3ODc2ODA0NzUsIm4iOiJGaVVjWTJjM28wa1ZoUTlqcWFOVWNBIn0.mV5XkkA6vht98VyqdYCGYXPgZnSSZcBm5fleVULzqIc",
  },
];
