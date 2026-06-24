import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { DATA } from "@/data/resume";

type SnapshotItem = {
  label: string;
  value: string;
  detail: string;
};

type LanguageItem = {
  name: string;
  bytes: number;
};

type CachedSnapshot = {
  fetchedAt: number;
  items: SnapshotItem[];
  languages: LanguageItem[];
};

type GitHubUserResponse = {
  public_repos: number;
  created_at: string;
};

type GitHubSearchResponse = {
  total_count: number;
};

type GitHubRepoResponse = {
  languages_url: string;
};

const CACHE_KEY = "github-snapshot:zzemy:v2";

function isSnapshotItem(value: unknown): value is SnapshotItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.label === "string" &&
    typeof item.value === "string" &&
    typeof item.detail === "string"
  );
}

function isLanguageItem(value: unknown): value is LanguageItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.name === "string" && typeof item.bytes === "number";
}

function isCachedSnapshot(value: unknown): value is CachedSnapshot {
  if (!value || typeof value !== "object") return false;
  const cache = value as Record<string, unknown>;
  return (
    typeof cache.fetchedAt === "number" &&
    Array.isArray(cache.items) &&
    cache.items.every(isSnapshotItem) &&
    Array.isArray(cache.languages) &&
    cache.languages.every(isLanguageItem)
  );
}

function isGitHubUserResponse(value: unknown): value is GitHubUserResponse {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.public_repos === "number" &&
    typeof user.created_at === "string"
  );
}

function isGitHubSearchResponse(value: unknown): value is GitHubSearchResponse {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return typeof result.total_count === "number";
}

function isGitHubRepoResponse(value: unknown): value is GitHubRepoResponse {
  if (!value || typeof value !== "object") return false;
  const repo = value as Record<string, unknown>;
  return typeof repo.languages_url === "string";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }
  return response.json() as Promise<unknown>;
}

function toSnapshotItems(
  user: GitHubUserResponse,
  commitCount: number,
  pullRequestCount: number
): SnapshotItem[] {
  return [
    { label: "Public repos", value: String(user.public_repos), detail: "Open repositories" },
    {
      label: "Contributions",
      value: formatNumber(commitCount + pullRequestCount),
      detail: "Commits + authored PRs",
    },
    {
      label: "Pull requests",
      value: formatNumber(pullRequestCount),
      detail: "Public authored PRs",
    },
    {
      label: "Since",
      value: new Date(user.created_at).getFullYear().toString(),
      detail: "Joined GitHub",
    },
  ];
}

async function fetchLanguageBreakdown(): Promise<LanguageItem[]> {
  const reposPayload = await fetchJson(
    "https://api.github.com/users/zzemy/repos?per_page=100&sort=updated&type=owner"
  );
  if (!Array.isArray(reposPayload)) return [];

  const languageUrls = reposPayload
    .filter(isGitHubRepoResponse)
    .map((repo) => repo.languages_url);

  const languageResults = await Promise.allSettled(
    languageUrls.map((url) => fetchJson(url))
  );
  const totals = new Map<string, number>();

  for (const result of languageResults) {
    if (result.status !== "fulfilled" || !result.value || typeof result.value !== "object") {
      continue;
    }

    for (const [name, bytes] of Object.entries(result.value)) {
      if (typeof bytes !== "number") continue;
      totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
  }

  return [...totals.entries()]
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6);
}

export default function GitHubSnapshotSection() {
  const fallbackItems = useMemo<SnapshotItem[]>(
    () => DATA.githubSnapshot.map((item) => ({ ...item })),
    []
  );
  const fallbackLanguages = useMemo<LanguageItem[]>(
    () => DATA.githubLanguages.map((item) => ({ ...item })),
    []
  );
  const [items, setItems] = useState<SnapshotItem[]>(fallbackItems);
  const [languages, setLanguages] = useState<LanguageItem[]>(fallbackLanguages);
  const [updatedAt, setUpdatedAt] = useState<string>("fallback");

  useEffect(() => {
    let cancelled = false;

    async function refreshSnapshot() {
      const cachedRaw = window.localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        try {
          const cached: unknown = JSON.parse(cachedRaw);
          if (isCachedSnapshot(cached)) {
            setItems(cached.items);
            setLanguages(cached.languages);
            setUpdatedAt(formatUpdatedAt(cached.fetchedAt));
          }
        } catch {
          window.localStorage.removeItem(CACHE_KEY);
        }
      }

      try {
        const [userPayload, commitsPayload, pullRequestsPayload, nextLanguages] =
          await Promise.all([
            fetchJson("https://api.github.com/users/zzemy"),
            fetchJson("https://api.github.com/search/commits?q=author:zzemy"),
            fetchJson("https://api.github.com/search/issues?q=type:pr+author:zzemy"),
            fetchLanguageBreakdown(),
          ]);

        if (
          !isGitHubUserResponse(userPayload) ||
          !isGitHubSearchResponse(commitsPayload) ||
          !isGitHubSearchResponse(pullRequestsPayload) ||
          cancelled
        ) {
          return;
        }

        const nextItems = toSnapshotItems(
          userPayload,
          commitsPayload.total_count,
          pullRequestsPayload.total_count
        );
        const fetchedAt = Date.now();
        const resolvedLanguages = nextLanguages.length > 0 ? nextLanguages : fallbackLanguages;

        setItems(nextItems);
        setLanguages(resolvedLanguages);
        setUpdatedAt(formatUpdatedAt(fetchedAt));
        window.localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            fetchedAt,
            items: nextItems,
            languages: resolvedLanguages,
          } satisfies CachedSnapshot)
        );
      } catch {
        // Keep the checked-in fallback values when the public API is unavailable.
      }
    }

    void refreshSnapshot();

    return () => {
      cancelled = true;
    };
  }, [fallbackLanguages]);

  const languageTotal = languages.reduce((total, item) => total + item.bytes, 0);

  return (
    <section id="github">
      <div className="flex min-h-0 flex-col gap-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{DATA.sections.github.heading}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Fetched live from GitHub public data
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
        <div className="rounded-xl border border-border bg-background p-4 ring-2 ring-border/20">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              Language Breakdown
            </h3>
            <span className="text-xs text-muted-foreground">Public repos</span>
          </div>
          <div className="space-y-3">
            {languages.map((language) => {
              const percent = languageTotal > 0 ? (language.bytes / languageTotal) * 100 : 0;
              const displayPercent = percent > 0 && percent < 1 ? "<1" : Math.round(percent).toString();

              return (
                <div key={language.name} className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{language.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {displayPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${Math.max(percent, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
