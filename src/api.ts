export type RunStatus = "RUNNING" | "SUCCESS" | "FAILED" | "WARNING";

export interface JobRun {
  id: number;
  service_name: string;
  run_id: string;
  status: RunStatus;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  metrics: Record<string, unknown>;
  error_message: string | null;
  logs_summary: string | null;
  created_at: string;
}

export interface ServiceOverview {
  service_name: string;
  last_status: RunStatus;
  last_run_at: string;
  total_runs: number;
  failed_runs: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "") as string;

export async function fetchOverview(): Promise<ServiceOverview[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/overview`);
  if (!res.ok) throw new Error("Failed to fetch overview");
  return res.json() as Promise<ServiceOverview[]>;
}

export async function fetchRecentRuns(
  serviceName?: string,
  statusFilter?: string,
): Promise<JobRun[]> {
  const params = new URLSearchParams();

  if (isNonEmptyString(serviceName)) {
    params.append("service_name", serviceName);
  }
  if (isNonEmptyString(statusFilter)) {
    params.append("status", statusFilter);
  }
  params.append("limit", "50");

  const res = await fetch(`${API_BASE_URL}/api/v1/runs?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json() as Promise<JobRun[]>;
}

const isNonEmptyString = (value?: string): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};
