import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  LoaderCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { RunStatus } from "../api";

interface StatusPresentation {
  label: string;
  className: string;
  icon: ReactNode;
}

const statusPresentations: Record<string, StatusPresentation> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "border-sky-200 bg-sky-50 text-sky-800",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  IMAGE_PULLING: {
    label: "Image pulling",
    className: "border-indigo-200 bg-indigo-50 text-indigo-800",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  STARTING: {
    label: "Starting",
    className: "border-violet-200 bg-violet-50 text-violet-800",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  INITIALIZING: {
    label: "Initializing",
    className: "border-cyan-200 bg-cyan-50 text-cyan-800",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  RUNNING: {
    label: "Running",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  SUCCESS: {
    label: "Success",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  FAILED: {
    label: "Failed",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  CREATE_FAILED: {
    label: "Create failed",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  START_FAILED: {
    label: "Start failed",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  OOM_KILLED: {
    label: "Out of memory",
    className: "border-orange-200 bg-orange-50 text-orange-800",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  TIMEOUT: {
    label: "Timed out",
    className: "border-orange-200 bg-orange-50 text-orange-800",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  ORCHESTRATOR_ERROR: {
    label: "Orchestrator error",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

export function getStatusPresentation(status: RunStatus): StatusPresentation {
  return (
    statusPresentations[status] ?? {
      label: status.replaceAll("_", " "),
      className: "border-slate-300 bg-slate-100 text-slate-700",
      icon: <CircleHelp className="h-3.5 w-3.5" />,
    }
  );
}
