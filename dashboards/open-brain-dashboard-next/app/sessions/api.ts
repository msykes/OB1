import "server-only";
import { apiFetch } from "@/lib/api";

export interface TrackedProject {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  status: string | null;
  goals: string[] | null;
  tags: string[] | null;
  color: string | null;
  created_at: string;
  updated_at: string | null;
  last_active_at: string | null;
}

export interface TrackedSessionListItem {
  id: string;
  project_id: string | null;
  client: string | null;
  client_session_id: string | null;
  title: string | null;
  summary: string | null;
  tags: string[] | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TrackedSessionDetail extends TrackedSessionListItem {
  highlights: string[] | null;
  next_steps: string[] | null;
  entities: Record<string, unknown> | null;
  project: TrackedProject | null;
}

export async function fetchProjects(
  apiKey: string,
  params?: { status?: string; limit?: number }
): Promise<{ data: TrackedProject[]; count: number }> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return apiFetch(apiKey, `/projects${qs ? `?${qs}` : ""}`);
}

export async function fetchSessions(
  apiKey: string,
  params?: {
    project_id?: string;
    client?: string;
    q?: string;
    page?: number;
    per_page?: number;
  }
): Promise<{
  data: TrackedSessionListItem[];
  total: number;
  page: number;
  per_page: number;
}> {
  const sp = new URLSearchParams();
  if (params?.project_id) sp.set("project_id", params.project_id);
  if (params?.client) sp.set("client", params.client);
  if (params?.q) sp.set("q", params.q);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  const qs = sp.toString();
  return apiFetch(apiKey, `/sessions${qs ? `?${qs}` : ""}`);
}

export async function fetchSession(
  apiKey: string,
  id: string
): Promise<TrackedSessionDetail> {
  return apiFetch(apiKey, `/sessions/${id}`);
}
