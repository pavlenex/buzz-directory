"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { BeeDrift } from "./BeeDrift";
import {
  categories,
  communities,
  type Community,
} from "./communities";

const GITHUB_URL = "https://github.com/pavlenex/buzz-directory";
const BUZZDIR_NAME = "buzzdir";
const COMMUNITY_QUERY_PARAM = "community";
const LISTING_DESCRIPTION_LIMIT = 140;

type ListingAccess = "empty" | "public" | "invite" | "web" | "invalid";

type FeaturedCommunity = Community & {
  featured: NonNullable<Community["featured"]>;
};

const featuredCommunities = communities.filter(
  (community): community is FeaturedCommunity => community.featured !== undefined,
);

const communityPublicUrl = (
  community: Pick<Community, "inviteUrl" | "publicUrl">,
) => community.inviteUrl ?? community.publicUrl;

const communityAccess = (
  community: Pick<Community, "inviteUrl" | "publicUrl">,
) => (communityPublicUrl(community) ? "public" : "invite");

const accessLabel = (community: Community) =>
  communityAccess(community) === "public" ? "Public" : "Invite";

const communityOpenLabel = (community: Community) =>
  community.inviteUrl
    ? `Open ${community.name} invite`
    : community.publicUrl
      ? `Open ${community.name}`
      : `Open ${community.name} in Buzz`;

const communityId = (community: Pick<Community, "name">) =>
  community.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Shared invites must go through their HTTPS landing page. That page collects
// any required join-policy acceptance and gives Buzz a policy receipt; a raw
// buzz://join assembled here would fail with `join_policy_required`.
// Invite-required entries can prefill Buzz's Add Community flow, but the user
// still needs an admin invitation before the relay accepts them.
const communityDeepLink = (
  community: Pick<
    Community,
    "name" | "relay" | "inviteUrl" | "publicUrl"
  >,
) => {
  if (!community.relay.startsWith("wss://")) return "#directory";

  const publicUrl = communityPublicUrl(community);
  if (publicUrl) return publicUrl;

  return `buzz://add-community?relay=${encodeURIComponent(community.relay)}&name=${encodeURIComponent(community.name)}`;
};

const buzzdirDeepLink =
  communities.find((community) => community.name === BUZZDIR_NAME)?.inviteUrl ??
  "#directory";

const classifyListingUrl = (value: string): ListingAccess => {
  const normalized = value.trim();
  if (!normalized) return "empty";

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "wss:") return "invite";
    if (parsed.protocol === "https:") {
      const hasInvitePath = parsed.pathname
        .toLowerCase()
        .split("/")
        .includes("invite");
      if (hasInvitePath) return "public";
      return "web";
    }
  } catch {
    return "invalid";
  }

  return "invalid";
};

const listingAccessLabel = (access: ListingAccess) => {
  if (access === "public") return "Public";
  if (access === "web") return "Web link / redirect, review required";
  return "Invite required";
};

function CommunityCard({
  community,
  shareStatus,
  onShare,
}: {
  community: Community;
  shareStatus: "copied" | "ready" | null;
  onShare: (community: Community) => void;
}) {
  const id = communityId(community);

  return (
    <article
      className="community-card"
      id={`community-${id}`}
      data-community-id={id}
    >
      <a
        className="community-card-hitbox"
        href={communityDeepLink(community)}
        aria-label={communityOpenLabel(community)}
        title={communityOpenLabel(community)}
      />
      <span className="community-card-inner">
        <span className="card-meta">
          <span
            className={`card-access card-access-${communityAccess(community)}`}
          >
            {accessLabel(community)}
          </span>
          <span className="card-category">{community.category}</span>
        </span>
        <span className="card-title">{community.name}</span>
        <span className="card-description">{community.description}</span>
        <span className="card-open" aria-hidden="true">
          {community.inviteUrl
            ? "Open invite ↗"
            : community.publicUrl
              ? "Open community ↗"
              : "Open in Buzz ↗"}
        </span>
        <button
          className="card-share"
          type="button"
          aria-label={`Copy directory link for ${community.name}`}
          aria-live="polite"
          onClick={() => onShare(community)}
        >
          {shareStatus === "copied"
            ? "Copied ✓"
            : shareStatus === "ready"
              ? "URL ready ↑"
              : "Share link ↗"}
        </button>
      </span>
    </article>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [shareFeedback, setShareFeedback] = useState<{
    id: string;
    status: "copied" | "ready";
  } | null>(null);
  const [listingOpen, setListingOpen] = useState(false);
  const [listingTab, setListingTab] = useState<"github" | "buzz">("github");
  const [listingName, setListingName] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [listingDescription, setListingDescription] = useState("");
  const [listingError, setListingError] = useState("");
  const listingDialogRef = useRef<HTMLDialogElement>(null);

  const listingAccess = useMemo(
    () => classifyListingUrl(listingUrl),
    [listingUrl],
  );

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get(
      COMMUNITY_QUERY_PARAM,
    );
    if (!requestedId) return;

    const community = communities.find(
      (candidate) => communityId(candidate) === requestedId.toLowerCase(),
    );
    if (!community) return;

    let scrollFrame: number | undefined;
    const filterFrame = window.requestAnimationFrame(() => {
      setQuery(community.name);
      setCategory("All");
      scrollFrame = window.requestAnimationFrame(() => {
        document
          .getElementById(`community-${communityId(community)}`)
          ?.scrollIntoView({ block: "center" });
      });
    });

    return () => {
      window.cancelAnimationFrame(filterFrame);
      if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  useEffect(() => {
    const dialog = listingDialogRef.current;
    if (!dialog) return;

    if (listingOpen && !dialog.open) dialog.showModal();
    if (!listingOpen && dialog.open) dialog.close();
  }, [listingOpen]);

  const handleCommunityShare = async (community: Community) => {
    const id = communityId(community);
    const shareUrl = new URL(window.location.href);
    shareUrl.search = "";
    shareUrl.searchParams.set(COMMUNITY_QUERY_PARAM, id);
    shareUrl.hash = `community-${id}`;

    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(shareUrl.toString());
      setShareFeedback({ id, status: "copied" });
    } catch {
      window.history.replaceState(null, "", shareUrl);
      setShareFeedback({ id, status: "ready" });
    }
  };

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return communities
      .filter((community) => {
        const matchesCategory =
          category === "All" || community.category === category;
        const matchesQuery =
          !normalized ||
          `${community.name} ${community.description} ${community.category} ${community.relay} ${community.publicUrl ?? ""}`
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
        `**Access:** ${listingAccessLabel(listingAccess)}`,
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
        "Use a wss:// relay, an HTTPS community link, or a link containing /invite/.",
      );
      return;
    }

    setListingError("");
    const issueUrl = listingIssueUrl();
    setListingOpen(false);
    const issueWindow = window.open(
      issueUrl,
      "_blank",
      "noopener,noreferrer",
    );
    if (!issueWindow) window.location.href = issueUrl;
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
              type="button"
              className="button button-dark button-big"
              onClick={() => {
                setListingTab("github");
                setListingOpen(true);
              }}
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
              aria-label={communityOpenLabel(community)}
              title={communityOpenLabel(community)}
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
            <span className="section-index">[ 01 / THE DIRECTORY ]</span>
            <h2>Pick a frequency.</h2>
          </div>
          <p>
            Public hives include a link anyone can use to join. Invite hives
            require an invitation from the relay admin.
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
            Sourced from public X shares · open a hive or copy its directory link
          </span>
        </div>

        {results.length > 0 ? (
          <div className="bento-comb">
            {results.map((community) => (
              <CommunityCard
                community={community}
                key={community.name}
                onShare={handleCommunityShare}
                shareStatus={
                  shareFeedback?.id === communityId(community)
                    ? shareFeedback.status
                    : null
                }
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

      <section className="manifesto" id="contribute">
        <span className="section-index">[ 02 / BUILT IN THE OPEN ]</span>
        <h2>
          Open source,
          <em>bring your agents.</em>
        </h2>
        <div className="manifesto-lede">
          <p className="manifesto-deck">
            This directory is a community project and the whole thing is open
            source. If a hive is missing, a relay has gone stale, or the search
            could be smarter. Open the {BUZZDIR_NAME} relay in Buzz, point your
            agents at the repo, and ship the fix with us.
          </p>
          <div className="manifesto-actions">
            <a
              className="button button-yellow button-big"
              href={buzzdirDeepLink}
            >
              Open {BUZZDIR_NAME} in Buzz <span aria-hidden="true">↗</span>
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
            <h3>Everything is open.</h3>
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
              Crawling, cleaning, checking relays, opening patches. Bring
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
            Name, link, one short description. We&apos;ll detect whether it is
            an invite link, relay URL, or web redirect.
          </p>
          <div className="list-hive-actions">
            <button
              className="button button-yellow button-big"
              type="button"
              onClick={() => {
                setListingTab("github");
                setListingOpen(true);
              }}
            >
              List your hive <span aria-hidden="true">↗</span>
            </button>
            <a className="list-hive-buzz-link" href={buzzdirDeepLink}>
              Or open {BUZZDIR_NAME} in Buzz ↗
            </a>
          </div>
        </div>
      </section>

      <dialog
        className="listing-modal"
        ref={listingDialogRef}
        aria-labelledby="listing-dialog-heading"
        onCancel={(event) => {
          event.preventDefault();
          setListingOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setListingOpen(false);
        }}
      >
        <div className="listing-modal-card">
          <button
            className="listing-modal-close"
            type="button"
            aria-label="Close"
            onClick={() => setListingOpen(false)}
          >
            ×
          </button>
          <div className="listing-modal-heading">
            <span>Bring your hive</span>
            <strong id="listing-dialog-heading">Add your community.</strong>
          </div>

          <div className="listing-tabs" role="tablist" aria-label="Add community">
            <button
              type="button"
              role="tab"
              aria-selected={listingTab === "github"}
              aria-controls="listing-github-panel"
              onClick={() => setListingTab("github")}
            >
              List on GitHub
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listingTab === "buzz"}
              aria-controls="listing-buzz-panel"
              onClick={() => setListingTab("buzz")}
            >
              Build on Buzz
            </button>
          </div>

          {listingTab === "github" ? (
            <form
              className="listing-form"
              id="listing-github-panel"
              role="tabpanel"
              onSubmit={handleListingSubmit}
            >
              <p className="listing-form-note">
                Three required fields. We&apos;ll open a prefilled issue for
                review.
              </p>

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
                  placeholder="wss://… or https://…"
                  aria-describedby="listing-url-status"
                  aria-invalid={listingAccess === "invalid"}
                  required
                />
              </label>

              <div
                className={`listing-access listing-access-${listingAccess}`}
                id="listing-url-status"
                role="status"
                aria-live="polite"
              >
                {listingAccess === "public" ? (
                  <>
                    <strong>Public</strong>
                    <span>/invite/ link lets people join</span>
                  </>
                ) : listingAccess === "invite" ? (
                  <>
                    <strong>Invite</strong>
                    <span>Relay requires an invitation from its admin</span>
                  </>
                ) : listingAccess === "web" ? (
                  <>
                    <strong>Web link</strong>
                    <span>HTTPS redirect or community host; we&apos;ll review it</span>
                  </>
                ) : listingAccess === "invalid" ? (
                  <>
                    <strong>Invalid link</strong>
                    <span>Use wss:// or https://</span>
                  </>
                ) : (
                  <>
                    <strong>Access</strong>
                    <span>/invite/ = public · wss:// = invite</span>
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
                  onChange={(event) =>
                    setListingDescription(event.target.value)
                  }
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

              <button
                className="button button-yellow button-big listing-submit"
                type="submit"
              >
                Open prefilled GitHub issue <span aria-hidden="true">↗</span>
              </button>
            </form>
          ) : (
            <div
              className="listing-buzz-panel"
              id="listing-buzz-panel"
              role="tabpanel"
            >
              <span aria-hidden="true">✦</span>
              <h3>Build it with us.</h3>
              <p>
                Open {BUZZDIR_NAME} in Buzz to meet the maintainers and vibe
                with the bot. The relay may ask for an admin invite.
              </p>
              <a
                className="button button-yellow button-big"
                href={buzzdirDeepLink}
              >
                Open {BUZZDIR_NAME} in Buzz <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </div>
      </dialog>

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

    </main>
  );
}
