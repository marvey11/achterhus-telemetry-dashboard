export const RUN_STATUSES = [
  "SCHEDULED",
  "IMAGE_PULLING",
  "STARTING",
  "INITIALIZING",
  "RUNNING",
  "SUCCESS",
  "FAILED",
  "CREATE_FAILED",
  "START_FAILED",
  "OOM_KILLED",
  "TIMEOUT",
  "ORCHESTRATOR_ERROR",
] as const;

export type KnownRunStatus = (typeof RUN_STATUSES)[number];
export type RunStatus = KnownRunStatus | (string & {});

export interface JobRun {
  id: number;
  service_name: string;
  run_id: string;
  status: RunStatus;
  source: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  metrics: Record<string, unknown>;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  logs_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOverview {
  service_name: string;
  last_status: RunStatus | null;
  last_run_at: string | null;
  total_runs: number;
  failed_runs: number;
}

export interface RunEvent {
  id: number;
  run_id: string;
  event_type: string;
  source: string;
  timestamp: string;
  details: Record<string, unknown>;
  created_at: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const apiBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = typeof apiBaseUrl === "string" ? apiBaseUrl : "";

export async function fetchOverview(): Promise<ServiceOverview[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/overview`);
  if (!response.ok) {
    throw new ApiError("Failed to fetch service overview", response.status);
  }
  const data: unknown = await response.json();
  return data as ServiceOverview[];
}

export async function fetchRecentRuns(
  serviceName?: string,
  statusFilter?: string,
  limit = 50,
  page = 1,
): Promise<JobRun[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (isNonEmptyString(serviceName)) {
    params.set("service_name", serviceName);
  }
  if (isNonEmptyString(statusFilter)) {
    params.set("status", statusFilter);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/runs?${params}`);
  if (!response.ok) {
    throw new ApiError("Failed to fetch runs", response.status);
  }
  const data: unknown = await response.json();
  return data as JobRun[];
}

export async function fetchRunEvents(runId: string): Promise<RunEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/runs/${encodeURIComponent(runId)}/events`,
  );
  if (!response.ok) {
    const message =
      response.status === 404
        ? "Run or event history was not found"
        : "Failed to fetch run event history";
    throw new ApiError(message, response.status);
  }
  const data: unknown = await response.json();
  return data as RunEvent[];
}

const isNonEmptyString = (value?: string): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};
