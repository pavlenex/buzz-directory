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

type JoinGuide = Pick<Community, "name" | "relay"> & {
  status: "copied" | "manual";
};

const featuredCommunities = communities.filter(
  (community): community is FeaturedCommunity => community.featured !== undefined,
);

const accessLabel = (community: Community) =>
  community.access === "public" ? "Public" : "Invite";

async function writeToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
      previousFocus?.focus();
    }
  }
}

function CommunityCard({
  community,
  isActive,
  isCopying,
  onCopy,
}: {
  community: Community;
  isActive: boolean;
  isCopying: boolean;
  onCopy: (community: Community) => void;
}) {
  return (
    <button
      className={`community-card ${isActive ? "community-card-copied" : ""}`}
      type="button"
      onClick={() => onCopy(community)}
      aria-label={`Copy ${community.name} relay and show Buzz join instructions`}
      title={`Copy ${community.relay}`}
    >
      <span className="community-card-inner">
        <span className={`card-access card-access-${community.access}`}>
          {accessLabel(community)}
        </span>
        <span className="card-title">{community.name}</span>
        <span className="card-description">{community.description}</span>
        <span className="card-copy" aria-hidden="true">
          {isCopying ? "Copying…" : isActive ? "Copied ✓" : "Copy relay"}
        </span>
      </span>
    </button>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [notice, setNotice] = useState("");
  const [joinGuide, setJoinGuide] = useState<JoinGuide | null>(null);
  const [copyingRelay, setCopyingRelay] = useState<string | null>(null);

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
    setJoinGuide(null);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const copyCommunityRelay = async (
    community: Pick<Community, "name" | "relay">,
  ) => {
    setNotice("");
    setCopyingRelay(community.relay);
    const copied = await writeToClipboard(community.relay);
    setJoinGuide({
      name: community.name,
      relay: community.relay,
      status: copied ? "copied" : "manual",
    });
    setCopyingRelay(null);
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
          {featuredCommunities.map((community, index) => {
            const isActive = joinGuide?.relay === community.relay;
            return (
              <button
                className={[
                  "feature-cell",
                  `feature-cell-${index + 1}`,
                  isActive ? "feature-cell-copied" : "",
                ].join(" ")}
                key={community.name}
                type="button"
                onClick={() => void copyCommunityRelay(community)}
                aria-label={`Copy ${community.name} relay and show Buzz join instructions`}
                title={`Copy ${community.relay}`}
              >
                <span className="feature-icon">{community.featured.icon}</span>
                <span className="feature-name">{community.name}</span>
                <span className="feature-signal">
                  {isActive
                    ? "Copied ✓"
                    : `${accessLabel(community)} · ${community.featured.note}`}
                </span>
              </button>
            );
          })}
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
            Every comb is a live public community on Buzz. Pick one to copy its
            relay, then paste it into Add Community in the Buzz app.
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
            Sourced from public X shares · click a comb to copy its{" "}
            <code>wss://</code> relay
          </span>
        </div>

        {results.length > 0 ? (
          <div className="bento-comb">
            {results.map((community) => (
              <CommunityCard
                community={community}
                isActive={joinGuide?.relay === community.relay}
                isCopying={copyingRelay === community.relay}
                key={community.name}
                onCopy={(selected) => void copyCommunityRelay(selected)}
              />
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

      {notice ? (
        <div className="notice" role="status">
          {notice}
        </div>
      ) : null}

      {joinGuide ? (
        <aside className="join-guide" aria-label="Buzz join instructions">
          <button
            className="join-guide-close"
            type="button"
            aria-label="Dismiss join instructions"
            onClick={() => setJoinGuide(null)}
          >
            ×
          </button>
          <p
            className={`join-guide-status join-guide-status-${joinGuide.status}`}
            role="status"
          >
            {joinGuide.status === "copied"
              ? "Relay copied to clipboard ✓"
              : "Automatic copy was blocked"}
          </p>
          <h2>{joinGuide.name} is ready.</h2>
          <code tabIndex={0}>{joinGuide.relay}</code>
          <ol>
            <li>Open Buzz.</li>
            <li>
              Click <strong>+ Add community</strong> in the left sidebar.
            </li>
            <li>
              Paste into <strong>Relay URL</strong>, then continue.
            </li>
          </ol>
          {joinGuide.status === "manual" ? (
            <p className="join-guide-help">
              Select the relay above or try copying it again.
            </p>
          ) : null}
          <div className="join-guide-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={() => void copyCommunityRelay(joinGuide)}
            >
              Copy again
            </button>
            <button
              className="button button-quiet"
              type="button"
              onClick={() => setJoinGuide(null)}
            >
              Done
            </button>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
