import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { JobRun, ServiceOverview } from "./api";
import App from "./App";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    fetchOverview: vi.fn(),
    fetchRecentRuns: vi.fn(),
  };
});

import { fetchOverview, fetchRecentRuns } from "./api";

const overview: ServiceOverview[] = [
  {
    service_name: "newsletter-worker",
    last_status: "RUNNING",
    last_run_at: "2026-10-03T10:00:00Z",
    total_runs: 4,
    failed_runs: 1,
  },
];

function makeRun(id: number): JobRun {
  return {
    id,
    service_name: "newsletter-worker",
    run_id: `run-${String(id)}`,
    status: "RUNNING",
    source: "application",
    started_at: "2026-10-03T10:00:00Z",
    ended_at: null,
    duration_seconds: null,
    metrics: {},
    error_message: null,
    error_details: null,
    logs_summary: null,
    created_at: "2026-10-03T10:00:00Z",
    updated_at: "2026-10-03T10:00:00Z",
  };
}

describe("dashboard run filters and pagination", () => {
  beforeEach(() => {
    vi.mocked(fetchOverview).mockResolvedValue(overview);
    vi.mocked(fetchRecentRuns).mockImplementation(
      (_service, _status, _limit, page) =>
        Promise.resolve(
          page === 1 ? Array.from({ length: 50 }, (_, i) => makeRun(i)) : [],
        ),
    );
  });

  test("resets to page one when a status or service filter changes", async () => {
    render(<App />);

    await screen.findByRole("button", { name: /newsletter-worker/i });
    await waitFor(() => {
      expect(fetchRecentRuns).toHaveBeenCalledWith(
        undefined,
        "",
        50,
        1,
        undefined,
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Page 2 · 0 runs shown");
    expect(fetchRecentRuns).toHaveBeenLastCalledWith(
      undefined,
      "",
      50,
      2,
      undefined,
    );

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "TIMEOUT" },
    });
    await waitFor(() => {
      expect(fetchRecentRuns).toHaveBeenLastCalledWith(
        undefined,
        "TIMEOUT",
        50,
        1,
        undefined,
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Page 2 · 0 runs shown");
    fireEvent.click(screen.getByRole("button", { name: /newsletter-worker/i }));
    await waitFor(() => {
      expect(fetchRecentRuns).toHaveBeenLastCalledWith(
        "newsletter-worker",
        "TIMEOUT",
        50,
        1,
        undefined,
      );
    });
  });

  test("resets pagination and filters both endpoints when the time range changes", async () => {
    render(<App />);

    await screen.findByRole("button", { name: /newsletter-worker/i });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Page 2 · 0 runs shown");

    fireEvent.change(screen.getByLabelText("Time range"), {
      target: { value: "7-days" },
    });

    await waitFor(() => {
      expect(fetchRecentRuns).toHaveBeenLastCalledWith(
        undefined,
        "",
        50,
        1,
        expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
      );
      expect(fetchOverview).toHaveBeenLastCalledWith(
        expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
      );
    });
  });
});
