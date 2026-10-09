import type { RunStatus } from "../api";
import { Badge } from "@marvey11/codescape-ui";
import { getStatusPresentation } from "./statusPresentation";

export function StatusBadge({ status }: { status: RunStatus }) {
  const presentation = getStatusPresentation(status);
  return (
    <Badge
      variant={presentation.variant}
      style={{ gap: "0.375rem", whiteSpace: "nowrap" }}
    >
      {presentation.icon}
      {presentation.label}
    </Badge>
  );
}
