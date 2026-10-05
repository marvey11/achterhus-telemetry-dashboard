import type { RunStatus } from "../api";
import { getStatusPresentation } from "./statusPresentation";

export function StatusBadge({ status }: { status: RunStatus }) {
  const presentation = getStatusPresentation(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${presentation.className}`}
    >
      {presentation.icon}
      {presentation.label}
    </span>
  );
}
