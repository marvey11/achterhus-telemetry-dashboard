import { Clock3 } from "lucide-react";
import type { ServiceOverview } from "../api";
import { StatusBadge } from "./StatusBadge";

interface Props {
  service: ServiceOverview;
  isSelected: boolean;
  onSelect: (name: string | undefined) => void;
}

function formatTimestamp(value: string | null): string {
  if (value === null) {
    return "No runs yet";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

export const ServiceCard = ({ service, isSelected, onSelect }: Props) => {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(isSelected ? undefined : service.service_name);
      }}
      aria-pressed={isSelected}
      className={`w-full rounded-xl border p-4 text-left shadow-sm transition-colors ${
        isSelected
          ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-lg font-semibold text-slate-900">
          {service.service_name}
        </h3>
        {service.last_status === null ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            No status
          </span>
        ) : (
          <StatusBadge status={service.last_status} />
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Clock3 className="h-3.5 w-3.5" />
        <span>{formatTimestamp(service.last_run_at)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs">
        <div>
          <span className="block text-slate-500">Total runs</span>
          <span className="font-mono text-sm font-medium text-slate-800">
            {service.total_runs}
          </span>
        </div>
        <div>
          <span className="block text-slate-500">Failed runs</span>
          <span
            className={`font-mono text-sm font-medium ${
              service.failed_runs > 0 ? "text-rose-700" : "text-slate-600"
            }`}
          >
            {service.failed_runs}
          </span>
        </div>
      </div>
    </button>
  );
};
