import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { DATA } from "@/data/resume";

type SnapshotItem = {
  label: string;
  value: string;
  detail: string;
};

type CachedSnapshot = {
  fetchedAt: number;
  items: SnapshotItem[];
};

type GitHubUserResponse = {
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

const CACHE_KEY = "github-snapshot:zzemy";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function isSnapshotItem(value: unknown): value is SnapshotItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.label === "string" &&
    typeof item.value === "string" &&
    typeof item.detail === "string"
  );
}

function isCachedSnapshot(value: unknown): value is CachedSnapshot {
  if (!value || typeof value !== "object") return false;
  const cache = value as Record<string, unknown>;
  return (
    typeof cache.fetchedAt === "number" &&
    Array.isArray(cache.items) &&
    cache.items.every(isSnapshotItem)
  );
}

function isGitHubUserResponse(value: unknown): value is GitHubUserResponse {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.public_repos === "number" &&
    typeof user.followers === "number" &&
    typeof user.following === "number" &&
    typeof user.created_at === "string"
  );
}

function formatUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function toSnapshotItems(user: GitHubUserResponse): SnapshotItem[] {
  return [
    { label: "Public repos", value: String(user.public_repos), detail: "Open repositories" },
    { label: "Followers", value: String(user.followers), detail: "GitHub followers" },
    { label: "Following", value: String(user.following), detail: "Developers followed" },
    { label: "Since", value: new Date(user.created_at).getFullYear().toString(), detail: "Joined GitHub" },
  ];
}

export default function GitHubSnapshotSection() {
  const fallbackItems = useMemo<SnapshotItem[]>(
    () => DATA.githubSnapshot.map((item) => ({ ...item })),
    []
  );
  const [items, setItems] = useState<SnapshotItem[]>(fallbackItems);
  const [updatedAt, setUpdatedAt] = useState<string>("fallback");

  useEffect(() => {
    let cancelled = false;

    async function refreshSnapshot() {
      const cachedRaw = window.localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        try {
          const cached: unknown = JSON.parse(cachedRaw);
          if (
            isCachedSnapshot(cached) &&
            Date.now() - cached.fetchedAt < CACHE_TTL_MS
          ) {
            setItems(cached.items);
            setUpdatedAt(formatUpdatedAt(cached.fetchedAt));
            return;
          }
        } catch {
          window.localStorage.removeItem(CACHE_KEY);
        }
      }

      try {
        const response = await fetch("https://api.github.com/users/zzemy", {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) return;

        const payload: unknown = await response.json();
        if (!isGitHubUserResponse(payload) || cancelled) return;

        const nextItems = toSnapshotItems(payload);
        const fetchedAt = Date.now();
        setItems(nextItems);
        setUpdatedAt(formatUpdatedAt(fetchedAt));
        window.localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ fetchedAt, items: nextItems } satisfies CachedSnapshot)
        );
      } catch {
        // Keep the checked-in fallback values when the public API is unavailable.
      }
    }

    void refreshSnapshot();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="github">
      <div className="flex min-h-0 flex-col gap-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{DATA.sections.github.heading}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated daily from GitHub public profile data
              {updatedAt !== "fallback" ? ` · ${updatedAt}` : ""}
            </p>
          </div>
          <a
            href="https://github.com/zzemy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View profile
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-background p-4 ring-2 ring-border/20"
            >
              <div className="text-2xl font-semibold tabular-nums text-foreground">
                {item.value}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {item.label}
              </div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
