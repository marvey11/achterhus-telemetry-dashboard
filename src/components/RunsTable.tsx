import React, { useState } from "react";
import { type JobRun } from "../api";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Props {
  runs: JobRun[];
}

export const RunsTable: React.FC<Props> = ({ runs }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-800/40">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
          <tr>
            <th className="p-4 w-10"></th>
            <th className="p-4">Service</th>
            <th className="p-4">Status</th>
            <th className="p-4">Started At</th>
            <th className="p-4">Duration</th>
            <th className="p-4">Metrics</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {runs.map((run) => {
            const isExpanded = expandedId === run.id;
            const hasExtraDetails =
              run.error_message != null ||
              run.logs_summary != null ||
              Object.keys(run.metrics).length > 0;

            return (
              <React.Fragment key={run.id}>
                <tr
                  onClick={() => {
                    if (hasExtraDetails) {
                      toggleRow(run.id);
                    }
                  }}
                  className={`hover:bg-slate-800/60 transition-colors ${hasExtraDetails ? "cursor-pointer" : ""}`}
                >
                  <td className="p-4 text-slate-500">
                    {hasExtraDetails &&
                      (isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      ))}
                  </td>
                  <td className="p-4 font-medium text-slate-200">
                    {run.service_name}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(run.started_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    {run.duration_seconds !== null
                      ? `${run.duration_seconds.toFixed(2)}s`
                      : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(run.metrics).map(([key, val]) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs font-mono"
                        >
                          {key}:{" "}
                          <strong className="text-indigo-300">
                            {String(val)}
                          </strong>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="bg-slate-900/50">
                    <td colSpan={6} className="p-4 pl-14">
                      {Boolean(run.error_message?.trim()) && (
                        <div className="mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                          <strong className="block mb-1 text-rose-400">
                            Error Message:
                          </strong>
                          {run.error_message}
                        </div>
                      )}
                      {run.logs_summary != null && (
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono whitespace-pre-wrap">
                          <strong className="block mb-1 text-slate-500">
                            Log Summary:
                          </strong>
                          {run.logs_summary}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "SUCCESS":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Success
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3 h-3" /> Failed
        </span>
      );
    case "RUNNING":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Loader2 className="w-3 h-3 animate-spin" /> Running
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
          {status}
        </span>
      );
  }
};
