import Link from "next/link";
import { fetchSessions, fetchProjects } from "./api";
import { requireSessionOrRedirect } from "@/lib/auth";
import { FormattedDate } from "@/components/FormattedDate";

export const dynamic = "force-dynamic";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { apiKey } = await requireSessionOrRedirect();
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const projectId = params.project_id || "";
  const client = params.client || "";
  const q = params.q || "";

  let data;
  let projects: { id: string; name: string }[] = [];
  let error: string | null = null;
  try {
    const [sessionsRes, projectsRes] = await Promise.all([
      fetchSessions(apiKey, {
        page,
        per_page: 25,
        project_id: projectId || undefined,
        client: client || undefined,
        q: q || undefined,
      }),
      fetchProjects(apiKey, { limit: 100 }),
    ]);
    data = sessionsRes;
    projects = projectsRes.data.map((p) => ({ id: p.id, name: p.name }));
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load sessions";
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Sessions</h1>
        <p className="text-danger text-sm">Failed to load sessions. {error}</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.per_page));
  const projectName = (id: string | null) =>
    id ? projects.find((p) => p.id === id)?.name || "—" : "—";

  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    sp.set("page", String(p));
    if (projectId) sp.set("project_id", projectId);
    if (client) sp.set("client", client);
    if (q) sp.set("q", q);
    return `/sessions?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Sessions</h1>
        <p className="text-text-secondary text-sm">
          {data.total.toLocaleString()} tracked sessions across {projects.length} projects
        </p>
      </div>

      <form
        action="/sessions"
        method="get"
        className="flex flex-wrap items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-2"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title / summary"
          className="flex-1 min-w-[200px] bg-bg-elevated border border-border px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-violet focus:outline-none"
        />
        <select
          name="project_id"
          defaultValue={projectId}
          className="bg-bg-elevated border border-border px-3 py-1.5 text-sm text-text-primary focus:border-violet focus:outline-none"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="client"
          defaultValue={client}
          placeholder="Client (e.g. claude-code)"
          className="w-44 bg-bg-elevated border border-border px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-violet focus:outline-none"
        />
        <button
          type="submit"
          className="border border-violet/35 bg-violet-surface px-3 py-1.5 text-sm font-medium text-violet hover:bg-violet/15 transition-colors"
        >
          Filter
        </button>
        {(projectId || client || q) && (
          <Link
            href="/sessions"
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium w-44">Project</th>
              <th className="text-left px-4 py-3 font-medium w-32">Client</th>
              <th className="text-left px-4 py-3 font-medium w-40">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No sessions match these filters.
                </td>
              </tr>
            )}
            {data.data.map((s) => (
              <tr key={s.id} className="hover:bg-bg-hover transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/sessions/${s.id}`}
                    className="text-text-primary hover:text-violet transition-colors"
                  >
                    {(s.title && s.title.length > 110
                      ? s.title.slice(0, 110) + "..."
                      : s.title) || (
                      <span className="italic text-text-muted">
                        Untitled session
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {projectName(s.project_id)}
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">
                  {s.client || "—"}
                </td>
                <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                  {s.started_at ? (
                    <FormattedDate date={s.started_at} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageUrl(page - 1)}
                className="px-3 py-1.5 text-sm bg-bg-elevated border border-border rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageUrl(page + 1)}
                className="px-3 py-1.5 text-sm bg-bg-elevated border border-border rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
