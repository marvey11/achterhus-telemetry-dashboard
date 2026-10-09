import type { RunStatus } from "../api";
import { Badge } from "@marvey11/codescape-ui";
import { getStatusPresentation } from "./statusPresentation";

export function StatusBadge({ status }: { status: RunStatus }) {
  const presentation = getStatusPresentation(status);
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 whitespace-nowrap px-2.5 py-1 font-medium ${presentation.className}`}
    >
      {presentation.icon}
      {presentation.label}
    </Badge>
  );
}
