"use client";

import { useMemo, useState } from "react";
import { BeeDrift } from "./BeeDrift";
import {
  categories,
  communities,
  type Community,
} from "./communities";

type FeaturedCommunity = Community & {
  featured: NonNullable<Community["featured"]>;
};

const featuredCommunities = communities.filter(
  (community): community is FeaturedCommunity => community.featured !== undefined,
);

const accessLabel = (community: Community) =>
  community.access === "public" ? "Public" : "Invite";

function CommunityCard({ community }: { community: Community }) {
  return (
    <a
      className="community-card"
      href={community.relay}
      aria-label={`Open ${community.name} in Buzz`}
      title={community.relay}
    >
      <div className="community-card-inner">
        <span className={`card-access card-access-${community.access}`}>
          {accessLabel(community)}
        </span>
        <h3>{community.name}</h3>
        <p>{community.description}</p>
      </div>
    </a>
  );
}

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
          </div>
        </div>
        <div className="featured-cluster" aria-label="Featured communities">
          <div className="cluster-label">
            <span>FEATURED HIVES</span>
          </div>
          {featuredCommunities.map((community, index) => (
            <a
              className={`feature-cell feature-cell-${index + 1}`}
              key={community.name}
              href={community.relay}
              aria-label={`Open ${community.name} in Buzz`}
            >
              <span className="feature-icon">{community.featured.icon}</span>
              <span className="feature-name">{community.name}</span>
              <span className="feature-signal">
                {accessLabel(community)} · {community.featured.note}
              </span>
            </a>
          ))}
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
            Sourced from public X shares · cards open{" "}
            <code>wss://</code> directly in Buzz
          </span>
        </div>

        {results.length > 0 ? (
          <div className="bento-comb">
            {results.map((community) => (
              <CommunityCard community={community} key={community.name} />
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
