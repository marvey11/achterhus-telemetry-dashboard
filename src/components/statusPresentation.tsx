import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  LoaderCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { BadgeProps } from "@marvey11/codescape-ui";
import type { RunStatus } from "../api";

interface StatusPresentation {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
  icon: ReactNode;
}

const statusPresentations: Record<string, StatusPresentation> = {
  SCHEDULED: {
    label: "Scheduled",
    variant: "default",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  IMAGE_PULLING: {
    label: "Image pulling",
    variant: "default",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  STARTING: {
    label: "Starting",
    variant: "default",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  INITIALIZING: {
    label: "Initializing",
    variant: "default",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  RUNNING: {
    label: "Running",
    variant: "warning",
    icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />,
  },
  SUCCESS: {
    label: "Success",
    variant: "success",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  FAILED: {
    label: "Failed",
    variant: "destructive",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  CREATE_FAILED: {
    label: "Create failed",
    variant: "destructive",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  START_FAILED: {
    label: "Start failed",
    variant: "destructive",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  OOM_KILLED: {
    label: "Out of memory",
    variant: "warning",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  TIMEOUT: {
    label: "Timed out",
    variant: "warning",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  ORCHESTRATOR_ERROR: {
    label: "Orchestrator error",
    variant: "destructive",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

export function getStatusPresentation(status: RunStatus): StatusPresentation {
  return (
    statusPresentations[status] ?? {
      label: status.replaceAll("_", " "),
      variant: "secondary",
      icon: <CircleHelp className="h-3.5 w-3.5" />,
    }
  );
}
