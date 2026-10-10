import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchOverview,
  fetchRecentRuns,
  getSinceCutoff,
  RUN_STATUSES,
  type TimeRange,
} from "./api";
import { ServiceCard } from "./components/ServiceCard";
import { RunsTable } from "./components/RunsTable";
import { Activity, RefreshCw } from "lucide-react";
import { useIsFetching } from "@tanstack/react-query";
import { Button, Label } from "@marvey11/codescape-ui";

const PAGE_SIZE = 50;
const queryClient = new QueryClient();

function DashboardContent() {
  const [selectedService, setSelectedService] = useState<string | undefined>(
    undefined,
  );
  const [selectedStatus, setSelectedStatus] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [page, setPage] = useState(1);

  // Poll the overview and current run page every five seconds.
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ["overview", timeRange],
    queryFn: () => fetchOverview(getSinceCutoff(timeRange)),
    refetchInterval: 5000,
  });

  const {
    data: runs,
    isLoading: runsLoading,
    error: runsError,
  } = useQuery({
    queryKey: ["runs", selectedService, selectedStatus, timeRange, page],
    queryFn: () =>
      fetchRecentRuns(
        selectedService,
        selectedStatus,
        PAGE_SIZE,
        page,
        getSinceCutoff(timeRange),
      ),
    refetchInterval: 5000,
  });

  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;

  const handleRefresh = () => {
    void (async () => {
      await queryClient.invalidateQueries();
    })();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-700">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Execution Telemetry
            </h1>
            <p className="text-xs text-slate-500">
              Home Server Container Overview
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching}
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </header>

      {/* Services Overview Grid */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">
          Services
        </h2>
        {overviewLoading ? (
          <div className="text-sm text-slate-500">
            Loading service overview...
          </div>
        ) : overviewError ? (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            Unable to load service overview: {overviewError.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overview?.map((s) => (
              <ServiceCard
                key={s.service_name}
                service={s}
                isSelected={selectedService === s.service_name}
                onSelect={(name) => {
                  setSelectedService(name);
                  setPage(1);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Executions Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
            {selectedService !== undefined
              ? `Recent Runs: ${selectedService}`
              : "All Recent Executions"}
          </h2>
          {selectedService !== undefined && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedService(undefined);
                setPage(1);
              }}
              className="text-xs font-medium text-indigo-700 hover:underline"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Label
            className="text-xs font-medium text-slate-600"
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            Time range
            <select
              value={timeRange}
              onChange={(event) => {
                setTimeRange(event.target.value as TimeRange);
                setPage(1);
              }}
              className="min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All time</option>
              <option value="24-hours">Last 24 hours</option>
              <option value="7-days">Last 7 days</option>
              <option value="month">Last month</option>
            </select>
          </Label>
          <Label
            className="text-xs font-medium text-slate-600"
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            Status
            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value);
                setPage(1);
              }}
              className="min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All statuses</option>
              {RUN_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </Label>
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-indigo-800">
              In progress: SCHEDULED through RUNNING
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700">
              Terminal: SUCCESS and outcomes
            </span>
          </div>
        </div>

        {runsLoading ? (
          <div className="text-sm text-slate-500">
            Loading execution logs...
          </div>
        ) : runsError ? (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            Unable to load runs: {runsError.message}
          </div>
        ) : (
          <RunsTable
            runs={runs ?? []}
            page={page}
            canGoNext={(runs?.length ?? 0) === PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
