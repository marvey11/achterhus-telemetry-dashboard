import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as NextIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
import type { JobRun, RunEvent } from "../api";
import { fetchRunEvents } from "../api";
import { StatusBadge } from "./StatusBadge";
import { getStatusPresentation } from "./statusPresentation";

interface Props {
  runs: JobRun[];
  page: number;
  canGoNext: boolean;
  onPageChange: (page: number) => void;
}

function formatTimestamp(value: string | null): string {
  if (value === null) {
    return "Not started";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

function formatDetails(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}

export function RunsTable({ runs, page, canGoNext, onPageChange }: Props) {
  const [expandedRunId, setExpandedRunId] = useState<number | null>(null);
  const statusCounts = runs.reduce<Record<string, number>>((counts, run) => {
    counts[run.status] = (counts[run.status] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-500">
          Statuses on this page:
        </span>
        {Object.entries(statusCounts).map(([status, count]) => {
          const presentation = getStatusPresentation(status);
          return (
            <span
              key={status}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${presentation.className}`}
            >
              {presentation.label}: {count}
            </span>
          );
        })}
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th scope="col" className="w-12 p-4">
                <span className="sr-only">Run details</span>
              </th>
              <th scope="col" className="p-4">
                Service
              </th>
              <th scope="col" className="p-4">
                Status
              </th>
              <th scope="col" className="p-4">
                Started at
              </th>
              <th scope="col" className="p-4">
                Duration
              </th>
              <th scope="col" className="p-4">
                Metrics
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((run) => {
              const isExpanded = expandedRunId === run.id;
              const hasExtraDetails =
                run.error_message !== null ||
                run.error_details !== null ||
                run.logs_summary !== null ||
                Object.keys(run.metrics).length > 0;

              return (
                <Fragment key={run.id}>
                  <tr className="transition-colors hover:bg-slate-50">
                    <td className="p-3 text-slate-500">
                      {hasExtraDetails && (
                        <button
                          type="button"
                          aria-label={`${isExpanded ? "Hide" : "Show"} details for run ${run.run_id}`}
                          aria-expanded={isExpanded}
                          onClick={() => {
                            setExpandedRunId(isExpanded ? null : run.id);
                          }}
                          className="rounded p-1 hover:bg-slate-200"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {run.service_name}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="p-4 text-slate-600">
                      {formatTimestamp(run.started_at)}
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {run.duration_seconds === null
                        ? "Not available"
                        : `${run.duration_seconds.toFixed(2)}s`}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(run.metrics).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
                          >
                            {key}:{" "}
                            <strong className="text-indigo-800">
                              {String(value)}
                            </strong>
                          </span>
                        ))}
                        {Object.keys(run.metrics).length === 0 && (
                          <span className="text-slate-400">None</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="p-4 sm:pl-14">
                        <RunDetails run={run} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {runs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No runs match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Run pages"
        className="mt-4 flex items-center justify-between"
      >
        <button
          type="button"
          disabled={page === 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="text-sm text-slate-600">
          Page {page} · {runs.length} runs shown
        </span>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => {
            onPageChange(page + 1);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <NextIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

function RunDetails({ run }: { run: JobRun }) {
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["runEvents", run.run_id],
    queryFn: () => fetchRunEvents(run.run_id),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-xs sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-slate-500">Run ID</dt>
          <dd className="mt-1 break-all font-mono text-slate-800">
            {run.run_id}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Source</dt>
          <dd className="mt-1 text-slate-800">{run.source}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Ended at</dt>
          <dd className="mt-1 text-slate-800">
            {run.ended_at === null
              ? "Not ended"
              : formatTimestamp(run.ended_at)}
          </dd>
        </div>
      </dl>

      {run.error_message !== null && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <strong className="mb-1 block">Error message</strong>
          {run.error_message || "No error message provided"}
        </div>
      )}
      {run.error_details !== null && (
        <details className="rounded-lg border border-rose-200 bg-white p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-rose-800">
            Structured error details
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
            {formatDetails(run.error_details)}
          </pre>
        </details>
      )}
      {run.logs_summary !== null && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
          <strong className="mb-1 block text-slate-600">Log summary</strong>
          <pre className="whitespace-pre-wrap font-mono">
            {run.logs_summary}
          </pre>
        </div>
      )}

      <section aria-label="Run event history">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          Event history
        </h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading event history...</p>
        ) : error ? (
          <p role="alert" className="text-sm text-rose-800">
            Unable to load event history: {error.message}
          </p>
        ) : events?.length === 0 ? (
          <p className="text-sm text-slate-500">No events recorded.</p>
        ) : (
          <ol className="space-y-3">
            {events?.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <EventSummary event={event} />
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">
                  {formatDetails(event.details)}
                </pre>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function EventSummary({ event }: { event: RunEvent }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="font-semibold text-slate-900">{event.event_type}</span>
      <span className="text-slate-500">Source: {event.source}</span>
      <time dateTime={event.timestamp} className="text-slate-500">
        {formatTimestamp(event.timestamp)}
      </time>
    </div>
  );
}
