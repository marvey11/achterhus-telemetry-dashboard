import React from "react";
import { type ServiceOverview, type RunStatus } from "../api";
import { CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

interface Props {
  service: ServiceOverview;
  isSelected: boolean;
  onSelect: (name: string | undefined) => void;
}

interface StatusData {
  color: string;
  bg: string;
  icon: React.ReactNode;
}

const statusConfig: Record<RunStatus, StatusData> = {
  SUCCESS: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  },
  FAILED: {
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
  },
  RUNNING: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />,
  },
  WARNING: {
    color: "text-amber-300",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: <AlertCircle className="w-5 h-5 text-amber-300" />,
  },
};

export const ServiceCard = ({ service, isSelected, onSelect }: Props) => {
  const config = statusConfig[service.last_status];
  const formattedTime = new Date(service.last_run_at).toLocaleString();

  return (
    <div
      onClick={() => {
        onSelect(isSelected ? undefined : service.service_name);
      }}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-indigo-500 bg-slate-800 shadow-lg shadow-indigo-500/10"
          : "border-s{ late-800 bg-slate-800/50 hover:bg-slate-800 hover:borde; }r-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-200 text-lg truncate">
          {service.service_name}
        </h3>
        <div className={`p-1.5 rounded-lg border ${config.bg}`}>
          {config.icon}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <Clock className="w-3.5 h-3.5" />
        <span>{formattedTime}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/50 text-xs">
        <div>
          <span className="text-slate-500 block">Total Executions</span>
          <span className="font-mono text-slate-300 text-sm">
            {service.total_runs}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Failures</span>
          <span
            className={`font-mono text-sm ${service.failed_runs > 0 ? "text-rose-400" : "text-slate-400"}`}
          >
            {service.failed_runs}
          </span>
        </div>
      </div>
    </div>
  );
};
