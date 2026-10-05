import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { JobRun, RunEvent } from "../api";
import { RunsTable } from "./RunsTable";

afterEach(() => {
  vi.unstubAllGlobals();
});

const run: JobRun = {
  id: 12,
  service_name: "newsletter-worker",
  run_id: "run/with-special-characters",
  status: "FUTURE_STATUS",
  source: "orchestrator",
  started_at: null,
  ended_at: null,
  duration_seconds: null,
  metrics: {},
  error_message: "Container did not start",
  error_details: { reason: "ContainerError", extra: { code: 17 } },
  logs_summary: null,
  created_at: "2026-10-03T10:00:00Z",
  updated_at: "2026-10-03T10:00:00Z",
};

const event: RunEvent = {
  id: 8,
  run_id: run.run_id,
  event_type: "status_changed",
  source: "orchestrator",
  timestamp: "2026-10-03T10:01:00Z",
  details: { status: "START_FAILED", note: "custom detail" },
  created_at: "2026-10-03T10:01:00Z",
};

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RunsTable
        runs={[run]}
        page={1}
        canGoNext={false}
        onPageChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("RunsTable", () => {
  test("shows unknown statuses and nullable fields without formatting them", () => {
    renderTable();

    expect(screen.getByText("FUTURE STATUS")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();
  });

  test("shows structured error details and defensively renders event history", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([event]),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderTable();
    fireEvent.click(
      screen.getByRole("button", {
        name: `Show details for run ${run.run_id}`,
      }),
    );

    expect(screen.getByText("Container did not start")).toBeInTheDocument();
    expect(screen.getByText(/ContainerError/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("status_changed")).toBeInTheDocument();
    });
    expect(screen.getByText("Source: orchestrator")).toBeInTheDocument();
    expect(screen.getByText(/custom detail/)).toBeInTheDocument();
  });
});
