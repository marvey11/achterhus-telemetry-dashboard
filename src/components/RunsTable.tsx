import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as NextIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
} from "@marvey11/codescape-ui";
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

  const columns: DataTableColumn<JobRun>[] = [
    {
      key: "details-toggle",
      header: <span className="sr-only">Run details</span>,
      className: "w-12 p-3 text-slate-500 align-middle",
      render: (run) => {
        const isExpanded = expandedRunId === run.id;
        const hasExtraDetails =
          run.error_message !== null ||
          run.error_details !== null ||
          run.logs_summary !== null ||
          Object.keys(run.metrics).length > 0;

        if (!hasExtraDetails) {
          return null;
        }

        return (
          <Button
            variant="ghost"
            size="icon"
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
          </Button>
        );
      },
    },
    {
      key: "service_name",
      header: "Service",
      className: "p-4 font-medium text-slate-900",
      accessor: (run) => run.service_name,
    },
    {
      key: "status",
      header: "Status",
      className: "p-4",
      render: (run) => <StatusBadge status={run.status} />,
    },
    {
      key: "started_at",
      header: "Started at",
      className: "p-4 text-slate-600",
      render: (run) => formatTimestamp(run.started_at),
    },
    {
      key: "duration_seconds",
      header: "Duration",
      className: "p-4 font-mono text-slate-600",
      render: (run) =>
        run.duration_seconds === null
          ? "Not available"
          : `${run.duration_seconds.toFixed(2)}s`,
    },
    {
      key: "metrics",
      header: "Metrics",
      className: "p-4",
      render: (run) => (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(run.metrics).map(([key, value]) => (
            <span
              key={key}
              className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
            >
              {key}:{" "}
              <strong className="text-indigo-800">{String(value)}</strong>
            </span>
          ))}
          {Object.keys(run.metrics).length === 0 && (
            <span className="text-slate-400">None</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-500">
          Statuses on this page:
        </span>
        {Object.entries(statusCounts).map(([status, count]) => {
          const presentation = getStatusPresentation(status);
          return (
            <Badge key={status} variant={presentation.variant}>
              {presentation.label}: {count}
            </Badge>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={runs}
          rowKey={(run) => run.id}
          className="w-full border-separate border-spacing-0 text-left text-sm text-slate-700"
          emptyState={
            <div className="p-8 text-center text-slate-500">
              No runs match these filters.
            </div>
          }
          renderExpandedRow={(run) => {
            if (expandedRunId !== run.id) {
              return null;
            }
            return <RunDetails run={run} />;
          }}
        />
      </div>

      <nav
        aria-label="Run pages"
        className="mt-4 flex items-center justify-between"
      >
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={page === 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-slate-600">
          Page {page} · {runs.length} runs shown
        </span>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={!canGoNext}
          onClick={() => {
            onPageChange(page + 1);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <NextIcon className="h-4 w-4" />
        </Button>
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
