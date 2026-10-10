import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ApiError,
  fetchOverview,
  fetchRecentRuns,
  fetchRunEvents,
  getSinceCutoff,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchRecentRuns", () => {
  test("requests the selected page while preserving service and status filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchRecentRuns("newsletter-worker", "TIMEOUT", 25, 3);

    const requestUrl = new URL(
      String(fetchMock.mock.calls[0]?.[0]),
      "http://localhost",
    );
    expect(requestUrl.pathname).toBe("/api/v1/runs");
    expect(requestUrl.searchParams.get("service_name")).toBe(
      "newsletter-worker",
    );
    expect(requestUrl.searchParams.get("status")).toBe("TIMEOUT");
    expect(requestUrl.searchParams.get("limit")).toBe("25");
    expect(requestUrl.searchParams.get("page")).toBe("3");
  });

  test("includes the since cutoff alongside pagination parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchRecentRuns(
      undefined,
      undefined,
      50,
      2,
      "2026-10-09T12:00:00.000Z",
    );

    const requestUrl = new URL(
      String(fetchMock.mock.calls[0]?.[0]),
      "http://localhost",
    );
    expect(requestUrl.searchParams.get("since")).toBe(
      "2026-10-09T12:00:00.000Z",
    );
    expect(requestUrl.searchParams.get("page")).toBe("2");
  });

  test("surfaces a failed response as an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await expect(fetchRecentRuns()).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
    } satisfies Partial<ApiError>);
  });
});

describe("time range filtering", () => {
  test("uses ISO cutoffs and clamps calendar month subtraction", () => {
    const now = new Date("2026-03-31T12:30:00.000Z");
    expect(getSinceCutoff("all", now)).toBeUndefined();
    expect(getSinceCutoff("24-hours", now)).toBe("2026-03-30T12:30:00.000Z");
    expect(getSinceCutoff("7-days", now)).toBe("2026-03-24T12:30:00.000Z");
    expect(getSinceCutoff("month", now)).toBe("2026-02-28T12:30:00.000Z");
  });

  test("sends the overview cutoff", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchOverview("2026-10-09T12:00:00.000Z");

    const requestUrl = new URL(
      String(fetchMock.mock.calls[0]?.[0]),
      "http://localhost",
    );
    expect(requestUrl.pathname).toBe("/api/v1/overview");
    expect(requestUrl.searchParams.get("since")).toBe(
      "2026-10-09T12:00:00.000Z",
    );
  });
});

describe("fetchRunEvents", () => {
  test("reports a missing run history as a 404 API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    await expect(fetchRunEvents("not-found")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Run or event history was not found",
    });
  });
});
