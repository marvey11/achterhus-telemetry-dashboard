import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiError, fetchRecentRuns, fetchRunEvents } from "./api";

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
