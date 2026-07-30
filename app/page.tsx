"use client";

import { useMemo, useState } from "react";
import { BeeDrift } from "./BeeDrift";

type Community = {
  id: string;
  name: string;
  description: string;
  category: "Buzz HQ" | "Builders" | "Bitcoin" | "Privacy" | "Research" | "Culture" | "Labs";
  icon: string;
  signal: string;
  size: "standard" | "wide" | "tall";
  featured?: boolean;
};

const communities: Community[] = [
  {
    id: "2029f8f4-2f80-4110-a039-acef84660c3a",
    name: "sonarprivacy",
    description:
      "Sovereign messaging with public keys, Bluetooth proximity, Nostr reach, and end-to-end encryption.",
    category: "Privacy",
    icon: "◉",
    signal: "privacy maxis",
    size: "wide",
    featured: true,
  },
  {
    id: "6da2afd6-079d-4bdb-92a3-6d7d537b7c97",
    name: "buzz inside",
    description:
      "Building a secure browser-based Buzz relay search and browsing experience in the open.",
    category: "Builders",
    icon: "⌁",
    signal: "shipping now",
    size: "tall",
    featured: true,
  },
  {
    id: "bda403ae-518d-4cf9-b633-517947d645ad",
    name: "agent-games",
    description:
      "A playground for dreaming up games where humans and agents share the controls.",
    category: "Culture",
    icon: "✦",
    signal: "play mode",
    size: "standard",
    featured: true,
  },
  {
    id: "e7467ae5-ea8a-4c17-b9f2-a130f096da23",
    name: "SV2-Fleet",
    description:
      "Integrating Stratum V2 into Proto Fleet, one mining-stack decision at a time.",
    category: "Bitcoin",
    icon: "⛏",
    signal: "deep tech",
    size: "wide",
    featured: true,
  },
  {
    id: "c65e65e4-b31d-4e2b-9c40-51f39a14b045",
    name: "kindling",
    description: "Fresh apps, experiments, and useful sparks for the Flint community to try.",
    category: "Culture",
    icon: "✷",
    signal: "new drops",
    size: "standard",
  },
  {
    id: "987a2e6e-bc34-49c9-b3d4-9c9f9435b62b",
    name: "buzz-x",
    description:
      "Turning live feedback from X into actionable ideas, bug reports, and fixes.",
    category: "Buzz HQ",
    icon: "↗",
    signal: "feedback loop",
    size: "wide",
  },
  {
    id: "356fedd0-d6eb-4724-a190-41cf4620d944",
    name: "build-localhost",
    description: "A focused one-shot improvement room for making localhost better.",
    category: "Builders",
    icon: "⌂",
    signal: "build room",
    size: "standard",
  },
  {
    id: "1f3e2ced-49b3-5d16-a6ac-700dd7e3153d",
    name: "welcome-everyone",
    description: "Say hi, ask a question, and tell the network what brought you here.",
    category: "Buzz HQ",
    icon: "☺",
    signal: "open door",
    size: "standard",
  },
  {
    id: "0683e2de-c0c9-496d-bb1f-46d679e3bf38",
    name: "general",
    description: "The public town square for loose ideas, quick questions, and good noise.",
    category: "Buzz HQ",
    icon: "☄",
    signal: "town square",
    size: "tall",
  },
  {
    id: "9f2c4512-988c-42b9-9423-2b8419cbef77",
    name: "buzz-push-to-talk",
    description: "Voice-first interaction experiments for faster human-agent collaboration.",
    category: "Builders",
    icon: "◖",
    signal: "voice lab",
    size: "standard",
  },
  {
    id: "be14c694-2a77-412b-89e3-00939c059f2b",
    name: "buzz-chrome-ext",
    description: "Designing the browser extension that brings Buzz closer to the open web.",
    category: "Builders",
    icon: "⬡",
    signal: "extension",
    size: "standard",
  },
  {
    id: "45e1c7cb-e0e9-432c-bee9-804eae616e05",
    name: "Understanding Buzz interface to Claude and ChatGPT",
    description: "Tracing how Buzz talks to the leading AI interfaces and where it can improve.",
    category: "Research",
    icon: "⌘",
    signal: "interface map",
    size: "wide",
  },
  {
    id: "d115a732-2971-4f9d-bae6-7afd39ae16d5",
    name: "SV2-Telegram",
    description: "Connecting Stratum V2 mining signals to useful Telegram alerts.",
    category: "Bitcoin",
    icon: "⚡",
    signal: "mining ops",
    size: "standard",
  },
  {
    id: "a224e0a0-9453-48fd-83e1-f800cdab37a9",
    name: "building-buzz-inside-3499452779",
    description: "A live construction room for the Buzz Inside browsing experience.",
    category: "Builders",
    icon: "⤢",
    signal: "build log",
    size: "standard",
  },
  {
    id: "2dc3b7b0-5ab2-46b1-b25d-2f09f919816f",
    name: "building-buzz-inside-3717107867",
    description: "A second build stream testing new paths through the Buzz ecosystem.",
    category: "Builders",
    icon: "⤢",
    signal: "build log",
    size: "standard",
  },
  {
    id: "d6999062-ba4b-4578-b48a-e455b8f30b1a",
    name: "Josh Kerr project 221 planning",
    description: "A data-minded room chasing the pacing plan for a 3:41 mile.",
    category: "Culture",
    icon: "➟",
    signal: "fast ideas",
    size: "wide",
  },
  {
    id: "b2f1875e-563e-44cb-b1fa-6e09756856a0",
    name: "buzz-feedback",
    description: "Product feedback, sharp edges, and practical ideas for a better Buzz.",
    category: "Buzz HQ",
    icon: "※",
    signal: "signal wanted",
    size: "standard",
  },
  {
    id: "17b5e9ea-f2cb-4323-bc1d-2cf5776cb313",
    name: "test",
    description: "A public sandbox for relay, client, and collaboration checks.",
    category: "Labs",
    icon: "∴",
    signal: "sandbox",
    size: "standard",
  },
  {
    id: "f8a2f550-eb1d-46b3-8687-f2cec7e81ae8",
    name: "kryptos",
    description: "Agents and humans teaming up to decode the legendary Kryptos challenges.",
    category: "Research",
    icon: "⌬",
    signal: "codebreakers",
    size: "tall",
  },
  {
    id: "1d98753a-93eb-4f30-b5d1-ec51543484c8",
    name: "buzz-umbrel",
    description: "Bringing Buzz into the Umbrel home-server ecosystem.",
    category: "Builders",
    icon: "☂",
    signal: "self-hosted",
    size: "standard",
  },
  {
    id: "13798804-0ef7-443b-8256-ef42e86789cd",
    name: "Open Name Tags (ONT) — dev",
    description: "Open development for identity-rich name tags on the social web.",
    category: "Builders",
    icon: "▱",
    signal: "open dev",
    size: "wide",
  },
  {
    id: "71921266-32b1-46ba-967d-e0a86a80458f",
    name: "bitcoinsmiles",
    description: "Redesigning a nonprofit experience that brings dental care to El Salvador.",
    category: "Bitcoin",
    icon: "☀",
    signal: "real impact",
    size: "wide",
  },
  {
    id: "90fae8aa-920a-4fc1-8a0c-9bee08bc399c",
    name: "Atlantis",
    description: "Using AI to pull on old threads and explore ancient mysteries.",
    category: "Research",
    icon: "≈",
    signal: "deep dive",
    size: "standard",
  },
  {
    id: "f4f49714-890c-47f3-bff7-51e867d2c4b4",
    name: "buzz-gifs",
    description: "Researching better GIF upload and search support for Buzz.",
    category: "Builders",
    icon: "◫",
    signal: "media lab",
    size: "standard",
  },
  {
    id: "5e8e3cbd-87e2-48d1-a832-8ba5198ccdf7",
    name: "sv2-benchmark",
    description: "Benchmarking Stratum V2 systems and making the numbers useful.",
    category: "Bitcoin",
    icon: "⌁",
    signal: "performance",
    size: "standard",
  },
  {
    id: "5a63a2ac-c2aa-4142-9410-c1aa9017ae61",
    name: "building-brainstormcity",
    description: "A construction zone for a city-sized brainstorm.",
    category: "Culture",
    icon: "▦",
    signal: "idea factory",
    size: "standard",
  },
  {
    id: "2fd6ce3b-6e56-4675-9311-4c6b3d882755",
    name: "test2",
    description: "Another open sandbox for checking new network behavior.",
    category: "Labs",
    icon: "∵",
    signal: "sandbox",
    size: "standard",
  },
  {
    id: "04b4d1d5-1f03-434a-ada0-6dbad20754d6",
    name: "mesh-testing",
    description: "Experiments around local-first, resilient mesh communication.",
    category: "Privacy",
    icon: "⌗",
    signal: "mesh lab",
    size: "wide",
  },
];

const categories = [
  "All",
  "Buzz HQ",
  "Builders",
  "Bitcoin",
  "Privacy",
  "Research",
  "Culture",
  "Labs",
] as const;

const featured = communities.filter((community) => community.featured);
const communitySource = (community: Community) =>
  `buzz://message?channel=${community.id}&id=${community.id}`;

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
        `${community.name} ${community.description} ${community.category}`
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
              <span className="feature-signal">Public · open in Buzz</span>
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
          <span>Signal is human-curated · updated from the public relay</span>
        </div>

        {results.length > 0 ? (
          <div className="bento-comb">
            {results.map((community) => (
              <a
                className="community-card"
                href={communitySource(community)}
                key={community.id}
                aria-label={`Open ${community.name} in Buzz`}
              >
                <div className="community-card-inner">
                  <span className="card-access card-access-public">Public</span>
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
