import Link from "next/link";
import { fetchSession } from "../api";
import { requireSessionOrRedirect } from "@/lib/auth";
import { FormattedDate } from "@/components/FormattedDate";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { apiKey } = await requireSessionOrRedirect();
  const { id } = await params;

  let session;
  let error: string | null = null;
  try {
    session = await fetchSession(apiKey, id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load session";
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <Link
          href="/sessions"
          className="text-sm text-text-muted hover:text-text-primary"
        >
          &larr; Back to sessions
        </Link>
        <h1 className="text-2xl font-semibold">Session not found</h1>
        <p className="text-danger text-sm">{error}</p>
      </div>
    );
  }

  const tags = session.tags || [];

  return (
    <div className="space-y-6">
      <Link
        href="/sessions"
        className="text-sm text-text-muted hover:text-text-primary"
      >
        &larr; Back to sessions
      </Link>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold leading-tight">
          {session.title || (
            <span className="italic text-text-muted">Untitled session</span>
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
          {session.project && (
            <span>
              Project:{" "}
              <span className="text-text-primary">{session.project.name}</span>
            </span>
          )}
          {session.client && (
            <span>
              Client:{" "}
              <span className="text-text-primary">{session.client}</span>
            </span>
          )}
          {session.started_at && (
            <span>
              Started:{" "}
              <span className="text-text-primary">
                <FormattedDate date={session.started_at} />
              </span>
            </span>
          )}
          {session.ended_at && (
            <span>
              Ended:{" "}
              <span className="text-text-primary">
                <FormattedDate date={session.ended_at} />
              </span>
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 border border-border bg-bg-elevated text-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {session.summary && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-muted">
            Summary
          </h2>
          <div className="bg-bg-surface border border-border rounded-lg p-4 text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
            {session.summary}
          </div>
        </section>
      )}

      {Array.isArray(session.highlights) && session.highlights.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-muted">
            Highlights
          </h2>
          <ul className="bg-bg-surface border border-border rounded-lg p-4 text-sm text-text-primary space-y-1.5 list-disc list-inside">
            {session.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>
      )}

      {Array.isArray(session.next_steps) && session.next_steps.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-muted">
            Next steps
          </h2>
          <ul className="bg-bg-surface border border-border rounded-lg p-4 text-sm text-text-primary space-y-1.5 list-disc list-inside">
            {session.next_steps.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      {session.entities && Object.keys(session.entities).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-muted">
            Entities
          </h2>
          <pre className="bg-bg-surface border border-border rounded-lg p-4 text-xs text-text-secondary overflow-x-auto">
            {JSON.stringify(session.entities, null, 2)}
          </pre>
        </section>
      )}

      <section className="text-xs text-text-muted space-y-1 pt-2 border-t border-border">
        <p>Session ID: {session.id}</p>
        {session.client_session_id && (
          <p>Client session ID: {session.client_session_id}</p>
        )}
        <p>
          Created: <FormattedDate date={session.created_at} />
        </p>
      </section>
    </div>
  );
}
