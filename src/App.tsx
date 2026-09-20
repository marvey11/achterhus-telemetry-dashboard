import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { fetchOverview, fetchRecentRuns } from "./api";
import { ServiceCard } from "./components/ServiceCard";
import { RunsTable } from "./components/RunsTable";
import { Activity, RefreshCw } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

function DashboardContent() {
  const [selectedService, setSelectedService] = useState<string | undefined>(
    undefined,
  );

  // Poll overview and recent runs every 5000ms
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: fetchOverview,
    refetchInterval: 5000,
  });

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["runs", selectedService],
    queryFn: () => fetchRecentRuns(selectedService),
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Execution Telemetry
            </h1>
            <p className="text-xs text-slate-400">
              Home Server Container Overview
            </p>
          </div>
        </div>
        <button
          disabled={isFetching}
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </header>

      {/* Services Overview Grid */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Services
        </h2>
        {overviewLoading ? (
          <div className="text-slate-500 text-sm">
            Loading service overview...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overview?.map((s) => (
              <ServiceCard
                key={s.service_name}
                service={s}
                isSelected={selectedService === s.service_name}
                onSelect={setSelectedService}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Executions Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {selectedService !== undefined
              ? `Recent Runs: ${selectedService}`
              : "All Recent Executions"}
          </h2>
          {selectedService !== undefined && (
            <button
              onClick={() => {
                setSelectedService(undefined);
              }}
              className="text-xs text-indigo-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        {runsLoading ? (
          <div className="text-slate-500 text-sm">
            Loading execution logs...
          </div>
        ) : (
          <RunsTable runs={runs ?? []} />
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
