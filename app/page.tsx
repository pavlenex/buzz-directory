"use client";

import { useMemo, useState, type FormEvent } from "react";
import { BeeDrift } from "./BeeDrift";
import {
  categories,
  communities,
  type Community,
} from "./communities";

const GITHUB_URL = "https://github.com/pavlenex/buzz-directory";
const BUZZDIR_NAME = "buzzdir";
const BUZZDIR_RELAY = "wss://flint.communities.buzz.xyz";
const LISTING_DESCRIPTION_LIMIT = 140;

type ListingAccess = "empty" | "public" | "private" | "invalid";

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

const classifyListingUrl = (value: string): ListingAccess => {
  const normalized = value.trim();
  if (!normalized) return "empty";

  try {
    const parsed = new URL(normalized);
    const hasInvitePath = parsed.pathname
      .toLowerCase()
      .split("/")
      .includes("invite");
    if (hasInvitePath) return "public";
    if (parsed.protocol === "wss:") return "private";
  } catch {
    return "invalid";
  }

  return "invalid";
};

const listingAccessLabel = (access: ListingAccess) =>
  access === "public" ? "Public" : "Private / invite-only";

function CommunityCard({ community }: { community: Community }) {
  return (
    <a
      className="community-card"
      href={communityDeepLink(community)}
      aria-label={`Open ${community.name} in Buzz`}
      title={`Open ${community.name} in Buzz`}
    >
      <span className="community-card-inner">
        <span className="card-meta">
          <span className={`card-access card-access-${community.access}`}>
            {accessLabel(community)}
          </span>
          <span className="card-category">{community.category}</span>
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
  const [listingName, setListingName] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [listingDescription, setListingDescription] = useState("");
  const [listingError, setListingError] = useState("");

  const listingAccess = useMemo(
    () => classifyListingUrl(listingUrl),
    [listingUrl],
  );

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

  const listingSummary = () => {
    const access = listingAccessLabel(listingAccess);
    return [
      `Community: ${listingName.trim()}`,
      `Link: ${listingUrl.trim()}`,
      `Visibility: ${access}`,
      `Description: ${listingDescription.trim()}`,
    ].join("\n");
  };

  const listingIssueUrl = () => {
    const issueUrl = new URL(`${GITHUB_URL}/issues/new`);
    issueUrl.searchParams.set(
      "title",
      `List community: ${listingName.trim()}`,
    );
    issueUrl.searchParams.set(
      "body",
      [
        "## Community listing",
        "",
        `**Name:** ${listingName.trim()}`,
        `**Community URL:** ${listingUrl.trim()}`,
        `**Visibility:** ${listingAccessLabel(listingAccess)}`,
        "",
        "### Short description",
        listingDescription.trim(),
        "",
        "---",
        "Submitted through buzzdir.",
      ].join("\n"),
    );
    return issueUrl.toString();
  };

  const handleListingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (listingAccess === "empty" || listingAccess === "invalid") {
      setListingError(
        "Use a bare wss:// relay for a private hive or a link containing /invite/ for a public hive.",
      );
      return;
    }

    setListingError("");
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intent = submitter?.dataset.intent;

    if (intent === "github") {
      const issueUrl = listingIssueUrl();
      const issueWindow = window.open(
        issueUrl,
        "_blank",
        "noopener,noreferrer",
      );
      if (!issueWindow) window.location.href = issueUrl;
      return;
    }

    if (navigator.clipboard) {
      void navigator.clipboard
        .writeText(listingSummary())
        .then(() =>
          showNotice(
            "Listing copied. Paste it in buzzdir and vibe with the bot.",
          ),
        )
        .catch(() =>
          showNotice("Join buzzdir, then paste your community details."),
        );
    } else {
      showNotice("Join buzzdir, then paste your community details.");
    }
    window.location.href = buzzdirDeepLink;
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
            <a
              className="button button-dark button-big"
              href="#list-hive"
            >
              List your hive <span aria-hidden="true">↓</span>
            </a>
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
            <kbd aria-hidden="true">TYPE</kbd>
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
          <span className="filter-hint" aria-hidden="true">
            Swipe for more filters →
          </span>
        </div>

        <div className="results-line">
          <span aria-live="polite" aria-atomic="true">
            Showing <strong>{results.length}</strong>{" "}
            {results.length === 1 ? "hive" : "hives"}
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
        <div className="list-hive-copy">
          <span className="section-index">[ ADMINS, THIS ONE&apos;S FOR YOU ]</span>
          <h2 id="list-hive-heading">Bring your hive.</h2>
          <p>
            The best way in is social: share your details in the {BUZZDIR_NAME}{" "}
            community, meet the people maintaining the directory, and vibe with
            the bot. Prefer GitHub? Open a prefilled issue instead.
          </p>
          <div className="listing-route-note">
            <strong>How visibility works</strong>
            <span>
              A link containing <code>/invite/</code> is listed as public. A
              bare <code>wss://</code> relay is listed as private / invite-only.
            </span>
          </div>
        </div>

        <form
          className="listing-form"
          aria-labelledby="list-hive-heading"
          onSubmit={handleListingSubmit}
        >
          <div className="listing-form-heading">
            <span>Three fields. All required.</span>
            <strong>Tell us about your community.</strong>
          </div>

          <label className="listing-field">
            <span>Community name</span>
            <input
              type="text"
              name="community-name"
              value={listingName}
              onChange={(event) => setListingName(event.target.value)}
              maxLength={48}
              autoComplete="organization"
              placeholder="e.g. bitcoiners"
              required
            />
          </label>

          <label className="listing-field">
            <span>Community URL</span>
            <input
              type="url"
              name="community-url"
              value={listingUrl}
              onChange={(event) => {
                setListingUrl(event.target.value);
                setListingError("");
              }}
              maxLength={300}
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="wss://… or https://…/invite/…"
              aria-describedby="listing-url-help listing-url-status"
              aria-invalid={listingAccess === "invalid"}
              required
            />
            <small id="listing-url-help">
              Submit the link you actually want people to use.
            </small>
          </label>

          <div
            className={`listing-access listing-access-${listingAccess}`}
            id="listing-url-status"
            role="status"
            aria-live="polite"
          >
            {listingAccess === "public" ? (
              <>
                <strong>Public hive</strong>
                <span>The /invite/ link lets anyone request to join.</span>
              </>
            ) : listingAccess === "private" ? (
              <>
                <strong>Private hive</strong>
                <span>A bare wss:// relay is marked invite-only.</span>
              </>
            ) : listingAccess === "invalid" ? (
              <>
                <strong>Link not recognized</strong>
                <span>Use a wss:// address or a link containing /invite/.</span>
              </>
            ) : (
              <>
                <strong>Public or private?</strong>
                <span>
                  We detect it from /invite/ versus a bare wss:// relay.
                </span>
              </>
            )}
          </div>

          <label className="listing-field">
            <span className="listing-field-label">
              <span>Very short description</span>
              <span aria-live="polite">
                {listingDescription.length}/{LISTING_DESCRIPTION_LIMIT}
              </span>
            </span>
            <textarea
              name="community-description"
              value={listingDescription}
              onChange={(event) => setListingDescription(event.target.value)}
              maxLength={LISTING_DESCRIPTION_LIMIT}
              rows={3}
              placeholder="Who is it for, and what happens there?"
              required
            />
          </label>

          {listingError ? (
            <p className="listing-error" role="alert">
              {listingError}
            </p>
          ) : null}

          <div className="listing-actions">
            <button
              className="button button-yellow button-big"
              type="submit"
              data-intent="buzz"
            >
              Copy details + join {BUZZDIR_NAME}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <button
              className="button listing-github button-big"
              type="submit"
              data-intent="github"
            >
              Open a GitHub issue <span aria-hidden="true">↗</span>
            </button>
          </div>
          <p className="listing-submit-note">
            Recommended: we copy your listing, open {BUZZDIR_NAME} in Buzz, and
            you paste it into the channel.
          </p>
        </form>
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
