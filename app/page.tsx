"use client";

import { useMemo, useState } from "react";
import { BeeDrift } from "./BeeDrift";
import {
  categories,
  communities,
  type Community,
} from "./communities";

// TODO(pav): swap these two for the real values. A test fails while either
// still says REPLACE-ME, because github.com/REPLACE-ME is an unclaimed
// namespace anyone could register and point at the "View the source" button.
const GITHUB_URL = "https://github.com/REPLACE-ME/buzz-directory";
const BUZZDIR_NAME = "buzzdir";
const BUZZDIR_RELAY = "wss://REPLACE-ME.example";

type FeaturedCommunity = Community & {
  featured: NonNullable<Community["featured"]>;
};

const featuredCommunities = communities.filter(
  (community): community is FeaturedCommunity => community.featured !== undefined,
);

const accessLabel = (community: Community) =>
  community.access === "public" ? "Public" : "Invite";

// The `wss://` template-literal type is erased at runtime, so re-check it here
// before handing a relay to the Buzz app.
const communityDeepLink = (community: Pick<Community, "name" | "relay">) =>
  community.relay.startsWith("wss://")
    ? `buzz://add-community?relay=${encodeURIComponent(community.relay)}&name=${encodeURIComponent(community.name)}`
    : "#directory";

const buzzdirDeepLink = communityDeepLink({
  name: BUZZDIR_NAME,
  relay: BUZZDIR_RELAY,
});

function CommunityCard({ community }: { community: Community }) {
  return (
    <a
      className="community-card"
      href={communityDeepLink(community)}
      aria-label={`Open ${community.name} in Buzz`}
      title={`Open ${community.name} in Buzz`}
    >
      <span className="community-card-inner">
        <span className={`card-access card-access-${community.access}`}>
          {accessLabel(community)}
        </span>
        <span className="card-title">{community.name}</span>
        <span className="card-description">{community.description}</span>
        <span className="card-open" aria-hidden="true">
          Open in Buzz ↗
        </span>
      </span>
    </a>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [notice, setNotice] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return communities
      .filter((community) => {
        const matchesCategory =
          category === "All" || community.category === category;
        const matchesQuery =
          !normalized ||
          `${community.name} ${community.description} ${community.category} ${community.relay}`
            .toLowerCase()
            .includes(normalized);
        return matchesCategory && matchesQuery;
      })
      // Directory grid is always A–Z; featured hero order is independent.
      .slice()
      .sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
      );
  }, [category, query]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  return (
    <main>
      <BeeDrift />

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>
            Find your
            <span>hive.</span>
          </h1>
          <p className="hero-deck">
            A directory of publicly shared{" "}
            <a
              href="https://buzz.xyz"
              target="_blank"
              rel="noreferrer noopener"
            >
              Buzz
            </a>{" "}
            communities. Join a community and find out why everyone is buzzing
            about Buzz.
          </p>
          <div className="hero-actions">
            <button
              className="button button-dark button-big"
              type="button"
              onClick={() =>
                showNotice("You’re on the early list. Submission flow coming next.")
              }
            >
              List your hive <span aria-hidden="true">↗</span>
            </button>
            <a className="button button-ghost button-big" href="#directory">
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
              href={communityDeepLink(community)}
              key={community.name}
              aria-label={`Open ${community.name} in Buzz`}
              title={`Open ${community.name} in Buzz`}
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
          <span>FORK THE DIRECTORY</span>
          <i>✦</i>
          <span>BUILD IN PUBLIC</span>
          <i>✦</i>
          <span>FIND YOUR PEOPLE</span>
          <i>✦</i>
          <span>BRING YOUR AGENTS</span>
          <i>✦</i>
          <span>FORK THE DIRECTORY</span>
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
            Every comb is a live public community. Pick one to open Buzz with
            its name and relay already filled in.
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
            Sourced from public X shares · click a comb to open it in Buzz
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

      <section className="manifesto" id="contribute">
        <span className="section-index">[ 02 — BUILT IN THE OPEN ]</span>
        <h2>
          Open source,
          <em>bring your agents.</em>
        </h2>
        <div className="manifesto-lede">
          <p className="manifesto-deck">
            This directory is a community project and the whole thing is open
            source. If a hive is missing, a relay has gone stale, or the search
            could be smarter — join the {BUZZDIR_NAME} community on Buzz, point
            your agents at the repo, and ship the fix with us.
          </p>
          <div className="manifesto-actions">
            <a
              className="button button-yellow button-big"
              href={buzzdirDeepLink}
            >
              Join {BUZZDIR_NAME} on Buzz <span aria-hidden="true">↗</span>
            </a>
            <a
              className="button button-outline-light button-big"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              View the source <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="manifesto-grid">
          <article>
            <span>01</span>
            <h3>Everything is public.</h3>
            <p>
              The catalog, the code, and the crawl live in the open. Read it,
              fork it, disagree with it.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Humans set direction.</h3>
            <p>
              People decide what belongs here, what a good listing looks like,
              and what gets built next.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Agents move the work.</h3>
            <p>
              Crawling, cleaning, checking relays, opening patches — bring
              yours into {BUZZDIR_NAME}.
            </p>
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
        <p className="footer-disclaimer">
          buzzdir is an independent, open-source, community-run directory. Not
          affiliated with, endorsed by, or operated by buzz.xyz. Every community
          listed was shared publicly by its own admins.
        </p>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
            GitHub ↗
          </a>
          <a href={buzzdirDeepLink}>Our hive on Buzz ↗</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {notice ? (
        <div className="notice" role="status">
          {notice}
        </div>
      ) : null}
    </main>
  );
}
