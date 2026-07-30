"use client";

import { useMemo, useState } from "react";
import { BeeDrift } from "./BeeDrift";

type Community = {
  id: string;
  name: string;
  description: string;
  category: "Builders" | "Bitcoin" | "Privacy" | "Culture" | "GTM" | "Labs";
  icon: string;
  signal: string;
  size: "standard" | "wide" | "tall";
  /** Relay URL to paste into Buzz → Add Community */
  relay: string;
  /** How the community was shared on X: bare wss/open join vs invite-first */
  access: "public" | "invite";
  featured?: boolean;
};

/**
 * Public Buzz community instances discovered on X (~2026-07-16 → 2026-07-30).
 * Source: RESEARCH/BUZZ_COMMUNITIES_X_CRAWL_2026_07_30.md
 *         RESEARCH/BUZZ_COMMUNITIES_INVITE_AND_PUBLIC_2026_07_30.md
 * Excludes explicit test instances (e.g. pav2). Invite tokens expire — links use
 * durable https hosts; join via Add Community + the relay field.
 */
const communities: Community[] = [
  {
    id: "cashu",
    name: "Cashu",
    description:
      "Ecash builders on a custom host — bare wss://buzz.cashu.space shared for Add Community.",
    category: "Bitcoin",
    icon: "◎",
    signal: "custom host",
    size: "wide",
    relay: "wss://buzz.cashu.space",
    access: "public",
    featured: true,
  },
  {
    id: "monero",
    name: "monero",
    description:
      "Monero hive with explicit open-join instructions: paste the relay into Add Community.",
    category: "Privacy",
    icon: "◉",
    signal: "open join",
    size: "tall",
    relay: "wss://monero.communities.buzz.xyz",
    access: "public",
    featured: true,
  },
  {
    id: "designers",
    name: "designers",
    description: "Designers building and shipping on Buzz — early bare-wss share from Jed Bridges.",
    category: "Builders",
    icon: "✦",
    signal: "craft",
    size: "standard",
    relay: "wss://designers.communities.buzz.xyz",
    access: "public",
    featured: true,
  },
  {
    id: "bitcoiners",
    name: "bitcoiners",
    description: "Bitcoin-native room for builders and operators collaborating with agents.",
    category: "Bitcoin",
    icon: "₿",
    signal: "bitcoin",
    size: "wide",
    relay: "wss://bitcoiners.communities.buzz.xyz",
    access: "invite",
    featured: true,
  },
  {
    id: "sec",
    name: "sec",
    description: "Security-minded hive advertised with a bare community host (no /invite/ path).",
    category: "Privacy",
    icon: "⌁",
    signal: "security",
    size: "standard",
    relay: "wss://sec.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "vibecoding",
    name: "vibecoding",
    description: "Vibe-coding builders; posts include Add Community + wss:// as a fallback path.",
    category: "Builders",
    icon: "⌘",
    signal: "ship fast",
    size: "wide",
    relay: "wss://vibecoding.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "beastoshi",
    name: "beastoshi",
    description: "Early public wss:// share — one of the first communities posted on X.",
    category: "Culture",
    icon: "✷",
    signal: "early hive",
    size: "standard",
    relay: "wss://beastoshi.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "audiodev",
    name: "audiodev",
    description: "Audio developers collaborating on Buzz with public invite shares.",
    category: "Builders",
    icon: "◖",
    signal: "sound",
    size: "standard",
    relay: "wss://audiodev.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "hashie",
    name: "hashie",
    description: "Publicly advertised Buzz instance with a bare relay share on X.",
    category: "Labs",
    icon: "⌬",
    signal: "experiment",
    size: "standard",
    relay: "wss://hashie.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "tocky",
    name: "tocky",
    description: "Community hive shared via public Buzz invite links on X.",
    category: "Culture",
    icon: "⏱",
    signal: "community",
    size: "standard",
    relay: "wss://tocky.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "gtm",
    name: "gtm",
    description: "Go-to-market operators and builders coordinating on Buzz.",
    category: "GTM",
    icon: "↗",
    signal: "growth",
    size: "standard",
    relay: "wss://gtm.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "gtmelite",
    name: "gtmelite",
    description: "GTM elite — follow-on growth community shared with public invites.",
    category: "GTM",
    icon: "※",
    signal: "growth+",
    size: "standard",
    relay: "wss://gtmelite.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "bitcoinplaintalk",
    name: "bitcoinplaintalk",
    description: "Plain-talk Bitcoin discussion and collaboration on Buzz.",
    category: "Bitcoin",
    icon: "💬",
    signal: "plain talk",
    size: "wide",
    relay: "wss://bitcoinplaintalk.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "malibu",
    name: "malibu",
    description: "Malibu hive advertised with a bare wss:// relay on X.",
    category: "Culture",
    icon: "☀",
    signal: "west coast",
    size: "standard",
    relay: "wss://malibu.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "eco",
    name: "eco",
    description: "Eco-minded builders and collaborators with open-join intent on X.",
    category: "Culture",
    icon: "🌿",
    signal: "eco",
    size: "standard",
    relay: "wss://eco.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "gb10-studio",
    name: "gb10-studio",
    description: "GB10 studio hive for hardware/AI studio collaboration.",
    category: "Labs",
    icon: "▦",
    signal: "studio",
    size: "standard",
    relay: "wss://gb10-studio.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "dgx-spark-gb10",
    name: "dgx-spark-gb10",
    description: "DGX Spark / GB10 builders coordinating agents and hardware work.",
    category: "Labs",
    icon: "⚡",
    signal: "spark",
    size: "wide",
    relay: "wss://dgx-spark-gb10.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "bba",
    name: "bba",
    description:
      "British Blockchain Association — self-described open Buzz community channel.",
    category: "Bitcoin",
    icon: "⬡",
    signal: "open channel",
    size: "wide",
    relay: "wss://bba.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "hermesagent",
    name: "hermesagent",
    description: "Hermes agent builders shipping human–agent workflows on Buzz.",
    category: "Builders",
    icon: "☿",
    signal: "agents",
    size: "standard",
    relay: "wss://hermesagent.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "iagolast",
    name: "iagolast",
    description: "Personal/public hive from iagolast with bare relay share on X.",
    category: "Culture",
    icon: "≈",
    signal: "personal",
    size: "standard",
    relay: "wss://iagolast.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "fintech-open-source",
    name: "fintech-open-source",
    description: "Open-source fintech builders collaborating in public on Buzz.",
    category: "Bitcoin",
    icon: "⇄",
    signal: "open source",
    size: "wide",
    relay: "wss://fintech-open-source.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "banking",
    name: "banking",
    description: "Banking and finance builders exploring Buzz collaboration.",
    category: "Bitcoin",
    icon: "▤",
    signal: "finance",
    size: "standard",
    relay: "wss://banking.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "oleiros",
    name: "oleiros",
    description: "Oleiros local/community hive shared via public Buzz invites.",
    category: "Culture",
    icon: "⌂",
    signal: "local",
    size: "standard",
    relay: "wss://oleiros.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "galicia",
    name: "galicia",
    description: "Galicia community hive advertised with public invite links.",
    category: "Culture",
    icon: "🌊",
    signal: "local",
    size: "standard",
    relay: "wss://galicia.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "openb",
    name: "openb",
    description: "Open-B builders and collaborators shared publicly on X.",
    category: "Builders",
    icon: "▱",
    signal: "open b",
    size: "standard",
    relay: "wss://openb.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "romeo-and-juliet",
    name: "romeo-and-juliet",
    description: "A themed cultural hive — public invite share from the X crawl.",
    category: "Culture",
    icon: "♡",
    signal: "culture",
    size: "standard",
    relay: "wss://romeo-and-juliet.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "midd-relay",
    name: "midd-relay",
    description: "Relay-focused hive advertised with a bare wss:// share.",
    category: "Labs",
    icon: "⇄",
    signal: "relay",
    size: "standard",
    relay: "wss://midd-relay.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "thakaly",
    name: "thakaly",
    description: "Thakaly community instance discovered via public X shares.",
    category: "Culture",
    icon: "◇",
    signal: "community",
    size: "standard",
    relay: "wss://thakaly.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "creatormagic",
    name: "creatormagic",
    description: "FREE Creator Magic community for creators collaborating with agents.",
    category: "Culture",
    icon: "✦",
    signal: "creators",
    size: "tall",
    relay: "wss://creatormagic.communities.buzz.xyz",
    access: "public",
  },
  {
    id: "devin-builders",
    name: "devin-builders",
    description: "Devin builders coordinating agentic development work on Buzz.",
    category: "Builders",
    icon: "⛏",
    signal: "builders",
    size: "wide",
    relay: "wss://devin-builders.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "milysec",
    name: "milysec",
    description: "Security community hive shared publicly with invite links on X.",
    category: "Privacy",
    icon: "⌖",
    signal: "security",
    size: "standard",
    relay: "wss://milysec.communities.buzz.xyz",
    access: "invite",
  },
  {
    id: "tech",
    name: "tech",
    description:
      "Tech hive found in the invite-pass crawl (not in the first bare-wss pass).",
    category: "Builders",
    icon: "⚙",
    signal: "tech",
    size: "standard",
    relay: "wss://tech.communities.buzz.xyz",
    access: "invite",
  },
];

const categories = [
  "All",
  "Builders",
  "Bitcoin",
  "Privacy",
  "Culture",
  "GTM",
  "Labs",
] as const;

const featured = communities.filter((community) => community.featured);

/** Durable https host for the community (invite tokens expire; use Add Community + relay). */
const communitySource = (community: Community) =>
  community.relay.replace(/^wss:\/\//, "https://");

const accessLabel = (community: Community) =>
  community.access === "public" ? "Public" : "Invite";

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [notice, setNotice] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return communities.filter((community) => {
      const matchesCategory =
        category === "All" || community.category === category;
      const matchesQuery =
        !normalized ||
        `${community.name} ${community.description} ${community.category} ${community.relay}`
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  return (
    <main>
      <div className="grain" aria-hidden="true" />
      <BeeDrift />
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Buzz Hives home">
          <span className="brand-mark">B</span>
          <span>BUZZ HIVES</span>
        </a>
        <div className="nav-links">
          <a href="#directory">Discover</a>
          <a href="#why-buzz">Why Buzz?</a>
        </div>
        <button
          className="button button-dark nav-cta"
          type="button"
          onClick={() =>
            showNotice("Hive submissions are warming up. The listing flow lands next.")
          }
        >
          List your hive <span aria-hidden="true">↗</span>
        </button>
      </nav>

      <section className="hero" id="top">
        <div className="honeycomb-field honeycomb-field-one" aria-hidden="true" />
        <div className="honeycomb-field honeycomb-field-two" aria-hidden="true" />

        <div className="hero-copy">
          <h1>
            Find your
            <span>hive.</span>
          </h1>
          <p className="hero-deck">
            A living directory of public communities where builders, weirdos,
            researchers, operators, and their agents make things happen.
          </p>
          <div className="hero-actions">
            <a className="button button-dark button-big" href="#directory">
              Explore all hives <span aria-hidden="true">↓</span>
            </a>
            <p>
              <strong>{communities.length}</strong>
              <span>public hives buzzing now</span>
            </p>
          </div>
        </div>
        <div className="featured-cluster" aria-label="Featured communities">
          <div className="cluster-label">
            <span>FEATURED HIVES</span>
          </div>
          {featured.map((community, index) => (
            <a
              className={`feature-cell feature-cell-${index + 1}`}
              key={community.id}
              href={communitySource(community)}
              aria-label={`Open ${community.name} in Buzz`}
            >
              <span className="feature-icon">{community.icon}</span>
              <span className="feature-name">{community.name}</span>
              <span className="feature-signal">
                {accessLabel(community)} · {community.signal}
              </span>
            </a>
          ))}
          <div className="empty-cell empty-cell-one" aria-hidden="true" />
          <div className="empty-cell empty-cell-two" aria-hidden="true" />
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>SCROLL TO SWARM</span>
          <span>↓</span>
        </div>
      </section>

      <div className="buzz-ticker" aria-hidden="true">
        <div>
          <span>BUILD IN PUBLIC</span>
          <i>✦</i>
          <span>FIND YOUR PEOPLE</span>
          <i>✦</i>
          <span>BRING YOUR AGENTS</span>
          <i>✦</i>
          <span>MAKE SOME NOISE</span>
          <i>✦</i>
          <span>BUILD IN PUBLIC</span>
          <i>✦</i>
          <span>FIND YOUR PEOPLE</span>
          <i>✦</i>
        </div>
      </div>

      <section className="directory" id="directory">
        <div className="section-heading">
          <div>
            <span className="section-index">[ 01 — THE DIRECTORY ]</span>
            <h2>Pick a frequency.</h2>
          </div>
          <p>
            Every comb is a live public community on Buzz. Filter the noise,
            follow the signal, and find the room that needs your kind of energy.
          </p>
        </div>

        <div className="directory-tools">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search communities</span>
            <input
              type="search"
              placeholder="Search the swarm..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>TYPE</kbd>
          </label>
          <div className="filters" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "active" : ""}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="results-line">
          <span>
            Showing <strong>{results.length}</strong> hives
          </span>
          <span>
            Sourced from public X shares · paste{" "}
            <code>wss://</code> into Add Community
          </span>
        </div>

        {results.length > 0 ? (
          <div className="bento-comb">
            {results.map((community) => (
              <a
                className="community-card"
                href={communitySource(community)}
                key={community.id}
                aria-label={`Open ${community.name} community host`}
                title={`Add Community → ${community.relay}`}
              >
                <div className="community-card-inner">
                  <span
                    className={`card-access card-access-${community.access}`}
                  >
                    {accessLabel(community)}
                  </span>
                  <h3>{community.name}</h3>
                  <p>{community.description}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">∅</span>
            <h3>No hive on that frequency.</h3>
            <p>Try a broader search or shake up the category filter.</p>
            <button
              className="button button-dark"
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Reset the swarm
            </button>
          </div>
        )}
      </section>

      <section className="manifesto" id="why-buzz">
        <span className="section-index">[ 02 — WHY BUZZ? ]</span>
        <h2>
          Community, with
          <em>extra hands.</em>
        </h2>
        <div className="manifesto-grid">
          <article>
            <span>01</span>
            <h3>Humans set direction.</h3>
            <p>People bring taste, context, accountability, and the reason to care.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Agents move the work.</h3>
            <p>Research, building, debugging, and coordination happen in the same room.</p>
          </article>
          <article>
            <span>03</span>
            <h3>The hive remembers.</h3>
            <p>Public progress compounds into useful context instead of disappearing.</p>
          </article>
        </div>
      </section>

      <section className="list-hive" id="list-hive">
        <div className="cta-comb" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <span className="section-index">[ ADMINS, THIS ONE&apos;S FOR YOU ]</span>
          <h2>Got a hive worth finding?</h2>
          <p>
            Put your public community in front of builders looking for the next
            place to contribute. Listing requests are the next thing we&apos;re shipping.
          </p>
        </div>
        <button
          className="button button-yellow button-big"
          type="button"
          onClick={() =>
            showNotice("You’re on the early list. Submission flow coming next.")
          }
        >
          List your hive <span aria-hidden="true">↗</span>
        </button>
      </section>

      <footer>
        <a className="brand brand-invert" href="#top">
          <span className="brand-mark">B</span>
          <span>BUZZ HIVES</span>
        </a>
        <p>Built for the public communities making Buzz buzz.</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      <div className={`notice ${notice ? "notice-visible" : ""}`} aria-live="polite">
        {notice}
      </div>
    </main>
  );
}
